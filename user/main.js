var socket = io();

//reset these on window  resize
var winHeight = $(window).height();   // returns height of browser viewport
var winWidth = $(window).width();   // returns width of browser viewport
var centX = winWidth / 2;
var centY = winHeight / 2;
var mouseSensitivity = 0.1;

$('form').submit(function(){
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  return false;
});

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}


socket.on('news', function (data) {
  console.log(data);
  socket.emit('my other event', { my: 'data' });
});

$("body").mousemove(function(e) {
  console.log(mouseSensitivity * (centY - e.clientY) / winWidth);
  pointed.applyAxisAngle (up, mouseSensitivity * (centY - e.clientY) / winWidth);
});


var container, stats;
var camera, scene, renderer;
//from currPos to view point
var pointed = new THREE.Vector3( 1, 0, 0);
var currPos = new THREE.Vector3( 1, 0, 0);
var up = new THREE.Vector3( 0, 1, 0);
var tmpVec = new THREE.Vector3();

var stepFoot = 0.1;
var speed = 1;

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  var info = document.createElement( 'div' );
  info.style.position = 'absolute';
  info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> - orthographic view';
  container.appendChild( info );

  camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 1000 );
  camera.position.x = 200;
  camera.position.y = 100;
  camera.position.z = 200;

  scene = new THREE.Scene();

  // Grid

  var size = 500, step = 50;

  var geometry = new THREE.Geometry();

  for ( var i = - size; i <= size; i += step ) {

    geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
    geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );

    geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
    geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );

  }

  var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

  var line = new THREE.Line( geometry, material, THREE.LinePieces );
  scene.add( line );

  // Cubes

  var geometry = new THREE.BoxGeometry( 50, 50, 50 );
  var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );

  for ( var i = 0; i < 100; i ++ ) {

    var cube = new THREE.Mesh( geometry, material );

    cube.scale.y = Math.floor( Math.random() * 2 + 1 );

    cube.position.x = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;
    cube.position.y = ( cube.scale.y * 50 ) / 2;
    cube.position.z = Math.floor( ( Math.random() * 1000 - 500 ) / 50 ) * 50 + 25;

    scene.add( cube );

  }

  // Lights

  var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
  scene.add( ambientLight );

  var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random() - 0.5;
  directionalLight.position.z = Math.random() - 0.5;
  directionalLight.position.normalize();
  scene.add( directionalLight );

  var directionalLight = new THREE.DirectionalLight( Math.random() * 0xffffff );
  directionalLight.position.x = Math.random() - 0.5;
  directionalLight.position.y = Math.random() - 0.5;
  directionalLight.position.z = Math.random() - 0.5;
  directionalLight.position.normalize();
  scene.add( directionalLight );

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xf0f0f0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  container.appendChild( stats.domElement );

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  camera.left = window.innerWidth / - 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / - 2;

  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

  requestAnimationFrame( animate );

  render();
  stats.update();

}

var map = []; // Or you could call it "key"
  onkeydown = onkeyup = function(e){
  e = e || event; // to deal with IE
  map[e.keyCode] = e.type == 'keydown';
  console.log(e.which);

  //w : 87
  //s : 83
  //a : 65
  //d : 68

  if(map[87] && map[83])
    console.log('ya dick');
  if(map[68] && map[65])
    console.log('ya dick');
  else{
    var s = stepFoot * speed;
    switch(event.keyCode){
    case 87: //w
      tmpVec = pointed;
      currPos.add(tmpVec.multiplyScalar(s));
      break;
    case 65: //a
      tmpVec.crossVectors(up, pointed);
      currPos.add(tmpVec);
      break;
    case 83: //s
      tmpVec = pointed;
      currPos.sub(tmpVec.multiplyScalar(s));
      break;
    case 68: //d
      tmpVec.crossVectors(pointed, up);
      currPos.add(tmpVec);
      break;
    case 90: //z
      currPos.y += s;

      break;
    case 88: //x
      currPos.y -= s;
      break;
    case 89: //y
      if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
      break;

    }
  }

}



function render() {


  //see if better way
  camera.position.copy(currPos);
  //  console.log(camera.position, currPos, lookAt);
  camera.lookAt(tmpVec.addVectors(pointed, currPos));

  renderer.render( scene, camera );

}

