//reset these on window  resize
var winHeight = $(window).height();   // returns height of browser viewport
var winWidth = $(window).width();   // returns width of browser viewport
var centX = winWidth / 2;
var centY = winHeight / 2;
var mouseSensitivity = 0.06;

function onWindowResize() {

  camera.left = window.innerWidth / - 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / - 2;

  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

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

var Controller = {
    keyIsDown: [],
    
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

var keys = [65, 68, 83, 87, 88, 89, 90];
for(var i in keys){
  Controller.add(keys[i],
      function () {},
      function () {})
}

var boundaryList = [],stepFoot = 10,speed = 1;

function detectCol(present,future){
  if (present.equals(future))
    return present

  var wxMax,wxMin,wzMax,wzMin,tiles = [],t = 2*sqThick,a,b

  wxMax = Math.max(present.x,future.x)
  wxMin = Math.min(present.x,future.x)
  wzMax = Math.max(present.z,future.z)
  wzMin = Math.min(present.z,future.z)
  wxMax = (wxMax - wxMax % t) + t
  wxMin = (wxMin - wxMin % t) - t
  wzMax = (wzMax - wzMax % t) + t
  wzMin = (wzMin - wzMin % t) - t

  for(var j=wxMin;j<=wxMax;j+=t)
    for(var k = wzMin;k<wzMax;k+=t)
      tiles.push(boundaries[j/t + 11][k/t + 11])

  for(t in tiles){
    for(var i in tiles[t]){
      a = tiles[t][i].whichSide(present) > 0
      b = tiles[t][i].whichSide(future) > 0
      if((!a && b)||(a&& !b)){
        //detected
        //later will want to subtract the 'bad' part of the vector so that the 
        //user may 'slide' along the wall
        return present
      }
    }
  }
  return future
 }

function move(){
  if(!Controller)
    return

  tmpVec.copy(charBounds.position);
  tmpVec.y = 0;
  //console.log(camera.position, tmpVec);
  var s = stepFoot * speed;
  var diagS = s / Math.sqrt(2);

  if((Controller.keyIsDown[87] && Controller.keyIsDown[83]) || (Controller.keyIsDown[68] && Controller.keyIsDown[65]))
    1
  else if(Controller.keyIsDown[87] && Controller.keyIsDown[65]) //w + a
  {
    tmpVec.x += diagS * (pointed.z + pointed.x);
    tmpVec.z += diagS * (pointed.z - pointed.x);
  }
  else if(Controller.keyIsDown[87] && Controller.keyIsDown[68]) //w + d
  {
    tmpVec.x += diagS * (pointed.x - pointed.z);
    tmpVec.z += diagS * (pointed.x + pointed.z);
  }
  else if(Controller.keyIsDown[83] && Controller.keyIsDown[65]) //s + a
  {
    tmpVec.x += diagS * (pointed.z - pointed.x);
    tmpVec.z += diagS * ( -1 * pointed.x - pointed.z);
  }
  else if(Controller.keyIsDown[83] && Controller.keyIsDown[68]) //s + d
  {
    tmpVec.x += diagS * (pointed.z - pointed.x);
    tmpVec.z += diagS * (pointed.x - pointed.z);
  }
  else if(Controller.keyIsDown[87]){ //w
      tmpVec.x += s * pointed.x;
      tmpVec.z += s * pointed.z;
  }
  else if(Controller.keyIsDown[65]){ //a
      tmpVec.x += s * pointed.z;
      tmpVec.z -= s * pointed.x;
  }
  else if(Controller.keyIsDown[83]){ //s
      tmpVec.x -= s * pointed.x;
      tmpVec.z -= s * pointed.z;
  }
  else if(Controller.keyIsDown[68]){ //d
      tmpVec.x -= s * pointed.z;
      tmpVec.z += s * pointed.x;
  }
  else if(Controller.keyIsDown[90]){ //z
      camera.translateY(-10);
  }
  else if(Controller.keyIsDown[88]){ //x
      camera.translateY(10);
  }
  else if(Controller.keyIsDown[89]){ //y
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
    }
  
  tmpVec.y = camera.position.y;
  tmpVec.copy(detectCol(camera.position,tmpVec));

  //console.log(tmpVec)
  //special camera effects could go here
  camera.position.copy(tmpVec);
  charBounds.position.copy(tmpVec);


}