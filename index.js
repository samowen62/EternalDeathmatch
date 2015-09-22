var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var players = [], newId

//need hashes for user and game
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

app.get('/', function(req, res){

  res.sendfile('index.html');
});

app.get('/app.js', function(req, res){
  res.sendfile('assets/js/dest.js');
});

io.sockets.on('connection', function(socket){
  newId = makeid()
  socket.emit('id', { 
      id : newId
    });

  players.push(newId);

   socket.on('disconnect', function() {
      console.log('Got disconnect!');

      var i = players.indexOf(socket);
      delete players[i];
   });

  console.log('user connected');
  socket.on('m', function(msg){
    //testing by inverting coords :)
    socket.emit('o', { 
      x : msg.x,
      y : msg.y,
      z : msg.z
    });
  });
});

  

http.listen(8080, function(){
  console.log('listening on *:8080');
});

