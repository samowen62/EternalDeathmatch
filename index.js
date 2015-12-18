var num_rooms = 2;
var room_size = 2;

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
  //might not need
  socket.emit('id', { 
    id : newId
  });

  //need to change this so that we respect room size
  var choice = Math.floor(num_rooms*Math.random());
  socket.room_id = choice;


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
    
    console.log(rooms);
    //could dynamically alter who is host based on latency
    socket.leave(socket.room_id);
  });

  console.log('user connected');

  if(rooms[socket.room_id].host == '')
    rooms[socket.room_id].host = newId;
  rooms[socket.room_id].members[newId] = {};

  console.log(rooms);

  socket.on('m', function(msg){
    socket.iter = socket.iter + 1;

    rooms[socket.room_id].members[socket.uniq_id]['msg'] = msg;
    //console.log(socket.room.members, socket.room.host);
    
    /*
      optimize per socket latency later to respond more frequently
      to faster clients that demand more and vice-versa
    */
    /*if(socket.iter == socket.latency){
      socket.iter = 0;
      socket.broadcast.to(socket.room).emit('o', { 
        x : msg.x,
        y : msg.y,
        z : msg.z
      });
    }*/
    //broadcast.to doesn't emit to sender while
    //io.sockets.in(room).emit() emits to all
    
  });
});

http.listen(process.env.PORT || 8080, function(){
  console.log('listening on *:8080');
});

