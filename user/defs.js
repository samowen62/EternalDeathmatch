var p_hash = makeid();
var socket = io();
 
//eventually inline the hash with jade serverside
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 25; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

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
