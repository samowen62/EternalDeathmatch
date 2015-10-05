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

/* set collision detection spacial structure
 *
 * boundaries[i][j] refers to the square center (sqStart + 2*i*sqThick,sqStart + 2*j*sqThick)
 * The plane this is divided in is parallel to the y plane (i refers to x and j to z coordinates)
 * max extent is actually 2*sqThick beyond sqStart
 */ 
var boundaries,sqSize = 23,sqThick = 100,sqStart = -2000
for(boundaries = [];boundaries.length < sqSize; boundaries.push([]));
for(var i = 0; i < sqSize; i ++)
	for(var j = 0; j < sqSize; j ++)
		boundaries[i].push([])