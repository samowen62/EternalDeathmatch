var socket = io();

//reset these on window  resize
var winHeight = $(window).height();   // returns height of browser viewport
var winWidth = $(window).width();   // returns width of browser viewport
var centX = winWidth / 2;
var centY = winHeight / 2;
var mouseSensitivity = 0.06;

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

  var angleX = mouseSensitivity * (centX - e.clientX) / winWidth;
  var angleY = mouseSensitivity * (e.clientY - centY) / winHeight;

  //NEED TO UPDATE WHERE THE CAMERA IS POINTED AT WITH EVERY MOUSEMOVE AND KEYPRESS
  pointed.applyAxisAngle (up,angleX);
  left.x = pointed.z;
  left.z = (-1) * pointed.x;
  left.normalize();
  pointed.applyAxisAngle (left,angleY);
  tmpVec.addVectors(camera.position, pointed);
  camera.lookAt(tmpVec);
  lastMouse = [e.clientX, e.clientY];
  //console.log(left, angleX, angleY);
});


var container, stats;
var camera, scene, renderer;
var lastMouse = [winWidth/2,winHeight/2];
//from currPos to view point
var pointed = new THREE.Vector3( 1, 0, 0),
    currPos = new THREE.Vector3( 50, 50, 0),
    up = new THREE.Vector3(0,1,0),
    left = new THREE.Vector3(1,0,0),
    //vector used for three js calculations
    tmpVec = new THREE.Vector3();

var stepFoot = 10;
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

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.x = 50;
  camera.position.y = 50;
  camera.position.z = 0;

  tmpVec.addVectors(camera.position, pointed);
  camera.lookAt(tmpVec);

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


function animate() {
  requestAnimationFrame( animate );

  render();
  stats.update();

}
/*
Controller = {
    keyIsDown: [],

    // Add a new control. up is optional.
    // It avoids key repetitions
    add: function (key, down, up) {
        $(document).keydown(function(e) {
            if(e.keyCode === key && !Controller.keyIsDown[key]) {
                    down()
                Controller.keyIsDown[key] = true
                return false
            }
        })

        $(document).keyup(function(e) {
            if(e.keyCode === key) {
                if(up) up()
                Controller.keyIsDown[key] = false
                return false
            }
        })
    },
}
Example:

Controller.add(65,
    function () {
        console.log("A is down")
    },
    // This argument is optional
    function () {
        console.log("A is up")
})

*/
var map = [];    
window.addEventListener('keydown',function(e){
    //keyState[e.keyCode || e.which] = true;
    e = e || event; // to deal with IE
    map[e.keyCode || e.which] = true;
    move();
},true);    
window.addEventListener('keyup',function(e){
    e = e || event; // to deal with IE
    map[e.keyCode || e.which] = false;
    move();
},true);

function move(){
  tmpVec.copy(camera.position);
  tmpVec.y = 0;
  console.log(camera.position, tmpVec);
  var s = stepFoot * speed;
  var diagS = s / Math.sqrt(2);

  if((map[87] && map[83]) || (map[68] && map[65]))
    console.log('no movement');
  else if(map[87] && map[65]) //w + a
  {
    tmpVec.x += diagS * (pointed.z + pointed.x);
    tmpVec.z += diagS * (pointed.z - pointed.x);
  }
  else if(map[87] && map[68]) //w + d
  {
    tmpVec.x += diagS * (pointed.x - pointed.z);
    tmpVec.z += diagS * (pointed.x + pointed.z);
  }
  else if(map[83] && map[65]) //s + a
  {
    tmpVec.x += diagS * (pointed.z - pointed.x);
    tmpVec.z += diagS * ( -1 * pointed.x - pointed.z);
  }
  else if(map[83] && map[68]) //s + d
  {
    tmpVec.x += diagS * (pointed.z - pointed.x);
    tmpVec.z += diagS * (pointed.x - pointed.z);
  }
  else{

    switch(event.keyCode){
    case 87: //w
      tmpVec.x += s * pointed.x;
      tmpVec.z += s * pointed.z;
    break;
    case 65: //a
      tmpVec.x += s * pointed.z;
      tmpVec.z -= s * pointed.x;
    break;
    case 83: //s
      tmpVec.x -= s * pointed.x;
      tmpVec.z -= s * pointed.z;
    break;
    case 68: //d
      tmpVec.x -= s * pointed.z;
      tmpVec.z += s * pointed.x;
    break;
    case 90: //z
    camera.translateY(-10);
    break;
    case 88: //x
    camera.translateY(10);
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
  tmpVec.y = camera.position.y;  
  camera.position.copy(tmpVec);
}



  function render() {

    renderer.render( scene, camera );
  }

