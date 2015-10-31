var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rooms = ['lobby'], newId
var BASE_LATENCY = 5 

//need hashes for user and game
function makeid(){
  var text = "",possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 25; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/images/*', function(req, res){
  console.log( __dirname + req.originalUrl)
  res.sendfile( __dirname + req.originalUrl);
});

app.get('/app.js', function(req, res){
  res.sendfile('assets/js/dest.js');
});
app.get('/jquery.js', function(req, res){
  res.sendfile('assets/js/jquery-1.11.1.js');
});
app.get('/socket.js', function(req, res){
  res.sendfile('assets/js/socket.io-1.2.0.js');
});

io.sockets.on('connection', function(socket){
  newId = makeid()

  //transmit initial data to client
  socket.emit('id', { 
    id : newId
  });

  socket.room = rooms[0]//random room later
  socket.iter = 0
  socket.latency = BASE_LATENCY
  socket.join(socket.room)

  socket.on('disconnect', function() {
    console.log('Got disconnect!');
    socket.leave(socket.room)
  });

  console.log('user connected');
  socket.on('m', function(msg){
    socket.iter = socket.iter + 1

    /*
      optimize per socket latency later to respond more frequently
      to faster clients that demand more and vice-versa
    */
    if(socket.iter == socket.latency){
      socket.iter = 0;
      socket.broadcast.to(socket.room).emit('o', { 
        x : msg.x,
        y : msg.y,
        z : msg.z
      });
    }
    //broadcast.to doesn't emit to sender while
    //io.sockets.in(room).emit() emits to all
    
  });
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});

