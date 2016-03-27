var num_rooms = 1;
var room_size = 8;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rooms = [], newId
var BASE_LATENCY = 5 

//later include pointed dir
var resp_points = [
  {
    x : 760,
    y : 0,
    z : 190
  },
  //{ 0, 0, -1}
  {
    x : 849,
    y : 0,
    z : -1660
  },
  //{ -1, 0, 0}
  {
    x : 75,
    y : 200,//make sure 2nd floor works too
    z : -1060
  },
  //{ 1, 0, 0}
  {
    x : -595,
    y : 0,
    z : 290
  },
  //{ 1, 0, -1}
];

for(var i = 0; i < num_rooms; i++){
  //things we want to store on a per room basis
  rooms.push({
    id : makeid(8),
    members : {},
    host : ''
  });
}

/*
 * Simply returns squared distance between points
 */
function distSq(p1, p2){
  return (Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
}

/*
 * need hashes for user and game
 */
function makeid(len){
  var text = "",possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < len; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

/*
 *  Choose a respawn point solely based on which is farthest from any other player
 */
function chooseRespawn(players, ignore_socket){
  var max_dist = 0;
  var point = resp_points[0];

  for(var i in resp_points){
    for(var j in players){
      //don't look at current user
      if(j == ignore_socket){
        continue;
      }

      var d = distSq(players[j].pos, resp_points[i]);

      if(d > max_dist){
        max_dist = d;
        point = resp_points[i];
      }
    }
  }

  return point;
}

app.get('/', function(req, res){
  res.sendfile( __dirname + '/index.html');
});

app.get('/assets/css/*', function(req, res){
  res.sendFile( __dirname + '/' + req.originalUrl);
});

app.get('/images/*', function(req, res){
  res.sendFile( __dirname + '/' + req.originalUrl);
});

app.get('/sounds/*', function(req, res){
  res.sendFile( __dirname + '/' + req.originalUrl);
});

app.get('/app.js', function(req, res){
  res.sendFile(__dirname +  '/assets/js/dest.js');
});

app.get('/jquery.js', function(req, res){
  res.sendFile(__dirname +  '/assets/js/jquery-1.11.1.js');
});

app.get('/socket.js', function(req, res){
  res.sendFile( __dirname + '/assets/js/socket.io-1.2.0.js');
});

io.sockets.on('connection', function(socket){

  newId = makeid(25);
  socket.uniq_id = newId;

  var choice, trys = 1000;

  while(trys > 0){
    choice = Math.floor(num_rooms*Math.random());

    if(Object.keys(rooms[choice].members).length < room_size)
      break;
    trys--;
  }

  //TODO: if trys == 0 disconnect and try again

  console.log('user connected');

  socket.room_id = choice;

  //so far host doesn't really have a purpose
  if(rooms[socket.room_id].host == '')
    rooms[socket.room_id].host = newId;
  
  rooms[socket.room_id].members[newId] = {
    'deaths'  : 0,
    'kills'   : 0  
  };
  
  socket.iter = 0;
  socket.latency = BASE_LATENCY;
  socket.room = rooms[socket.room_id].id;
  socket.join(socket.room);
 
  //transmit initial data to client
  socket.emit('id', { 
    id : newId,
    players : rooms[socket.room_id].members
  });


  socket.on('disconnect', function() {
    var room_id = socket.room_id;
    console.log('User disconnected');

    delete rooms[room_id].members[socket.uniq_id];

    if(rooms[room_id].host == socket.uniq_id){
      var keys = Object.keys(rooms[room_id].members);
      rooms[room_id].host = keys.length == 0 ? '' : keys[0];
    }
    
    io.to(socket.room).emit('left', {
      'id'  : socket.uniq_id
    });

    //could dynamically alter who is host based on latency
    socket.leave(socket.room_id);  
    
  });



  socket.on('m', function(msg){
    rooms[socket.room_id].members[socket.uniq_id]['pos'] = msg['pos'];
    rooms[socket.room_id].members[socket.uniq_id]['pnt'] = msg['pnt'];
    rooms[socket.room_id].members[socket.uniq_id]['resp_time'] = msg['resp_time'];
    rooms[socket.room_id].members[socket.uniq_id]['dead'] = msg['dead'];
    
    if(msg['dead']){
      if(msg['resp_time'] < new Date().getTime()){
        console.log('ressurecting!');
        var resp_point = chooseRespawn(rooms[socket.room_id].members, socket.uniq_id);

        io.to(socket.room).emit('respawn',{
          id: socket.uniq_id,
          pos: resp_point
        });
      }
    }

    /*
      optimize per socket latency later to respond more frequently
      to faster clients that demand more and vice-versa
    */
    io.to(socket.room).emit('o', 
      rooms[socket.room_id].members
    );    
  });

  socket.on('damage', function(data){
    io.to(socket.room).emit('damage', 
      { 
        id        : data.hash, 
        attacker  : data.attacker,
        amount    : data.amount 
      }
    );
  });

  socket.on('projectile', function(data){
    io.to(socket.room).emit('projectile', 
      { 
        start     : data.line.start,
        end       : data.line.end,
        color     : data.color,
        duration  : data.duration
      }
    );
  });

  socket.on('death', function(data){
    //console.log(rooms[socket.room_id].members, data.attacker, data.victim);

    rooms[socket.room_id].members[data.victim]['deaths'] += 1;
  
    if(rooms[socket.room_id].members[data.attacker])
      rooms[socket.room_id].members[data.attacker]['kills'] += 1;

    io.to(socket.room).emit('kill', 
      { 
        id: data.victim,
      }
    );

    io.to(socket.room).emit('stats',{
      players : rooms[socket.room_id].members
    });

  });


});

http.listen(process.env.PORT || 8080, function(){
  console.log('listening on *:8080');
});

