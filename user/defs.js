var p_hash = null,socket = io(),players=[];

var charBounds = {
  position : new THREE.Vector3(0,0,0),
  thickness : new THREE.Vector3(45,45,45)
}

var container, stats;
var camera, scene, renderer;
var lastMouse = [winWidth/2,winHeight/2];
//from currPos to view point
var pointed = new THREE.Vector3( 1, 0, 0),
    currPos = new THREE.Vector3( 0, 50, 0),
    up = new THREE.Vector3(0,1,0),
    left = new THREE.Vector3(1,0,0),
    //vector used for three js calculations
    tmpVec = new THREE.Vector3();
