/*
 * defs.js
 *
 * In this file store all global variables shared between files
 */
var p_hash = null,
	socket = io(),
	players={},
	player_stats={},
	player_alloc = [false, false, false, false, false, false, false, false],
	weapons=[],
	
	container, 
	stats, 
	camera, 
	scene, 
	renderer,

	lastMouse = [winWidth/2,winHeight/2],
	current_sprite,
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
	mouseSensitivity = 0.004,//tweak based on fps

	mouseDown = 0,

	BASE_STEP_FOOT = 10,
	BASE_SPEED = 1,
	BASE_JUMP_POWER = 60,
	BUTTON_PRESS_TIME = 800,
	MAX_MAP_WIDTH = 2000,
	GROUND_TOLERANCE = 12,
	RAMP_TOLERANCE = GROUND_TOLERANCE + 5,
	GRAVITY_ACC = 5,
	RAMP_WAIT_TIME = 8,
	RESPAWN_TIME = 5000,
	PLAYER_HEIGHT = 26;

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

var ground = [],ceil = [], ramps = [], weapon;

var effects = {
	'die' : document.getElementById('audiotag1'),
	'damage' : document.getElementById('doom-damage'),
	'death' : document.getElementById('doom-death'),
	'pistol' : document.getElementById('doom-pistol'),
	'fist' : document.getElementById('doom-fist'),
	'roar' : document.getElementById('doom-roar'),
	'shotgun' : document.getElementById('doom-shotgun'),
	'intro' : document.getElementById('intro-rammstein')
}

var sprite_list = [
	'images/player/playa1.png',
	'images/player/playa2.png',
	'images/player/playa3.png',
	'images/player/playa4.png',
	'images/player/playa5.png',
	'images/player/playa6.png',
	'images/player/playa7.png',
	'images/player/playa8.png',
	'images/player/playe1.png',
	'images/player/playe2.png',
	'images/player/playe3.png',
	'images/player/playe4.png',
	'images/player/playe5.png',
	'images/player/playf1.png',
	'images/player/playf2.png',
	'images/player/playf3.png',
	'images/player/playf4.png',
	'images/player/playf5.png'
];
/*
 * UI elements
 */
var ui_health = document.getElementById("health");
var ui_player_stats = document.getElementById("player-stats-body");