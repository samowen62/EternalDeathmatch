var num_rooms = 1;
var room_size = 8;

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rooms = [], newId
var BASE_LATENCY = 5 


for(var i = 0; i < num_rooms; i++){
  //things we want to store on a per room basis
  rooms.push({
    id : makeid(8),
    members : {},
    host : ''
  });
}

//need hashes for user and game
function makeid(len){
  var text = "",possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < len; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
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

  //transmit initial data to client
  socket.emit('id', { 
    id : newId
  });

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
  rooms[socket.room_id].members[newId] = {};

  
  socket.iter = 0;
  socket.latency = BASE_LATENCY;
  socket.room = rooms[socket.room_id].id;
  socket.join(socket.room);
 

  socket.on('disconnect', function() {
    console.log('User disconnected');
    
    delete rooms[socket.room_id].members[socket.uniq_id];

    if(rooms[socket.room_id].host == socket.uniq_id){
      var keys = Object.keys(rooms[socket.room_id].members);
      rooms[socket.room_id].host = keys.length == 0 ? '' : keys[0];
    }
        //could dynamically alter who is host based on latency
    socket.leave(socket.room_id);
  });



  socket.on('m', function(msg){
    rooms[socket.room_id].members[socket.uniq_id]['pos'] = msg;
    
    /*
      optimize per socket latency later to respond more frequently
      to faster clients that demand more and vice-versa
    */
    socket.emit('o', 
      rooms[socket.room_id].members
    );    
  });



  socket.on('death', function(data){
    io.to(socket.room).emit('kill', 
      { id: data.hash }
    );
  });

});

http.listen(process.env.PORT || 8080, function(){
  console.log('listening on *:8080');
});

