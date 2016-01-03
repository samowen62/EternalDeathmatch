function onWindowResize() {

  camera.left = window.innerWidth / - 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / - 2;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}


$("body").click(function(e){
  mouseDown = 1;
});

var character = new cEntity(new THREE.Vector3(45,45,45));

var keys = [65, 68, 82, 83, 87, 88, 89, 90, 32];
for(var i in keys){
  Controller.add(keys[i],
      function () {},
      function () {})
}

container = document.createElement( 'div' );
document.body.appendChild( container );

container.requestPointerLock = container.requestPointerLock ||
           container.mozRequestPointerLock ||
           container.webkitRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
         document.mozExitPointerLock ||
         document.webkitExitPointerLock;

container.appendChild($('.health-box')[0]);

var img_dom_objs = [];
var weapon_objs = {
  "fist" : [],
  "pistol" : [],
  "shotgun" : []
};

$.each(document.getElementsByClassName('sprite-img'), function(k, v){
  
  switch(v.dataset.weapon){
    case "fist":
      weapon_objs["fist"].push(v);
      break;
    case "pistol":
      weapon_objs["pistol"].push(v);
      break;
    case "shotgun":
      weapon_objs["shotgun"].push(v);
      break;

    default:
      console.log("invalid data-weapon attribute");
  }

  img_dom_objs.push(v);
});

$.each(img_dom_objs, function(k, v){
  container.appendChild(v);
});

function toggleFullScreen() {
  if (container.requestFullscreen) {
    container.requestFullscreen();
  } else if (container.msRequestFullscreen) {
    container.msRequestFullscreen();
  } else if (container.mozRequestFullScreen) {
    container.mozRequestFullScreen();
  } else if (container.webkitRequestFullscreen) {
    container.webkitRequestFullscreen();
  }

  effects['intro'].play();

  container.requestPointerLock();
}


// Hook pointer lock state change events for different browsers
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
  if(document.pointerLockElement === container ||
  document.mozPointerLockElement === container ||
  document.webkitPointerLockElement === container) {
    console.log('The pointer lock status is now locked');
    document.addEventListener("mousemove", character.aim, false);
  } else {
    console.log('The pointer lock status is now unlocked');  
    document.removeEventListener("mousemove", character.aim, false);
  }
}