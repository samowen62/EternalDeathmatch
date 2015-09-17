var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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


//io.on('connection', function(socket){
//  console.log('a user connected');
//});

io.on('connection', function(socket){
  socket.on('m', function(msg){
    console.log('message: ' + msg.x +','+msg.y+','+msg.z+' p_hash'+msg.hash);

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

