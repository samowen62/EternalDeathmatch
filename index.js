var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/three.js', function(req, res){
  res.sendfile('three.js');
});

app.get('/three.min.js', function(req, res){
  res.sendfile('three.min.js');
});

app.get('/js/renderers/Projector.js', function(req, res){
  res.sendfile('js/renderers/Projector.js');
});

app.get('/js/renderers/CanvasRenderer.js', function(req, res){
  res.sendfile('js/renderers/CanvasRenderer.js');
});

app.get('/js/libs/stats.min.js', function(req, res){
  res.sendfile('js/libs/stats.min.js');
});

//io.on('connection', function(socket){
//  console.log('a user connected');
//});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    socket.emit('news', { hello: 'world' }); console.log('tits');
  });
});

  

http.listen(8080, function(){
  console.log('listening on *:8080');
});

