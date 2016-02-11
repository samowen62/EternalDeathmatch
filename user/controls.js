
//controls.js

function onWindowResize() {

  camera.left = window.innerWidth / - 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / - 2;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}


function onBodyClick(){
  mouseDown = 1;
}

var character = new cEntity(new THREE.Vector3(45,45,45));

container = document.createElement( 'div' );
document.body.appendChild( container );

container.requestPointerLock = container.requestPointerLock ||
           container.mozRequestPointerLock ||
           container.webkitRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
         document.mozExitPointerLock ||
         document.webkitExitPointerLock;

container.appendChild(document.getElementById('health-box'));
container.appendChild(document.getElementById('stats-screen'));

var img_dom_objs = [];
var weapon_objs = {
  "fist" : [],
  "pistol" : [],
  "shotgun" : []
};

var img_objs = document.getElementsByClassName('sprite-img');

for(var i in img_objs){ 
  var val = img_objs[i];

  if(val.dataset){
    switch(val.dataset.weapon){
      case "fist":
        weapon_objs["fist"].push(val);
        break;
      case "pistol":
        weapon_objs["pistol"].push(val);
        break;
      case "shotgun":
        weapon_objs["shotgun"].push(val);
        break;

      default:
        console.log("invalid data-weapon attribute");
    }

    img_dom_objs.push(val);
  }
}

for(var i in img_dom_objs){ 
  container.appendChild(img_dom_objs[i]);
};

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