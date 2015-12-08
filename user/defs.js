/*
 * In this file store all global variables shared between files
 */
var p_hash = null,
	socket = io(),
	players=[],
	
	container, 
	stats, 
	camera, 
	scene, 
	renderer,
	
	lastMouse = [winWidth/2,winHeight/2],
	//from currPos to view point
 	pointed = new THREE.Vector3( 1, 0, 0),
    currPos = new THREE.Vector3( 0, 50, 0),
    up = new THREE.Vector3(0,1,0),
    left = new THREE.Vector3(1,0,0),
    //vector used for three js calculations
    tmpVec = new THREE.Vector3(),

	winHeight = $(window).height(),
	winWidth = $(window).width(),
	centX = winWidth / 2,
	centY = winHeight / 2,
	mouseSensitivity = 0.06,

	mouseDown = 0,

	BASE_STEP_FOOT = 10,
	BASE_SPEED = 1,
	MAX_MAP_WIDTH = 2000;

/* set collision detection spacial structure
 *
 * boundaries[i][j] refers to the square center (sqStart + 2*i*sqThick,sqStart + 2*j*sqThick)
 * The plane this is divided in is parallel to the y plane (i refers to x and j to z coordinates)
 * max extent is actually 2*sqThick beyond sqStart
 */ 
var boundaries,sqSize = 23,sqThick = 100,sqStart = -MAX_MAP_WIDTH
for(boundaries = [];boundaries.length < sqSize; boundaries.push([]));
for(var i = 0; i < sqSize; i ++)
	for(var j = 0; j < sqSize; j ++)
		boundaries[i].push([])

var ground = [],ceil = [], ramps = [], sprite;

var effects = {
	'die' : document.getElementById('audiotag1'),
	'damage' : document.getElementById('doom-damage'),
	'death' : document.getElementById('doom-death'),
	'pistol' : document.getElementById('doom-pistol'),
	'roar' : document.getElementById('doom-roar'),
	'shotgun' : document.getElementById('doom-shotgun')
}
