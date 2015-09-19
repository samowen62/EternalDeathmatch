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
  var b;

  for( var i in boundaryList){
    b = boundaryList[i];
    if((Math.abs(future.x - b.center.x) < charBounds.thickness.x + b.thickness.x) && (Math.abs(future.z - b.center.z) < charBounds.thickness.z + b.thickness.z)){
        //subtract portion perp to surface for general surfaces
        //that means later we want just a list of surfaces and blocks
        //not just blocks. Also a list of walls for map boundaries
        //Just either don't overlap or loop through everything

        //for this approach we need to just find the surfaces it hits
        //i.e. it can clip through corners
        var x_wall_l = b.center.x - b.thickness.x,
        x_wall_h = b.center.x + b.thickness.x,
        z_wall_l = b.center.z - b.thickness.z,
        z_wall_h = b.center.z + b.thickness.z;
        if((present.x < x_wall_l && x_wall_l < future.x) || (future.x < x_wall_h && x_wall_h < present.x)){
          future.x = present.x;
        } 
        if((present.z < z_wall_l && z_wall_l < future.z) || (future.z < z_wall_h && z_wall_h < present.z)){
          future.z = present.z;
        } 
        return future;
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

  //special camera effects could go here
  camera.position.copy(tmpVec);
  charBounds.position.copy(tmpVec);


}