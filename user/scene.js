var geometry = new THREE.SphereGeometry( 75, 32, 32 ); 
var material = new THREE.MeshLambertMaterial( { color: 0x0099cc, shading: THREE.FlatShading, overdraw: 0.5 } );
var testSphere = new THREE.Mesh( geometry, material ); 

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 );
	camera.position.x = 0;
	camera.position.y = 50;
	camera.position.z = 0;

	tmpVec.addVectors(camera.position, pointed);
	camera.lookAt(tmpVec);

	scene = new THREE.Scene();

  // Grid

  var size = 2000, step = 200;
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
  scene.add(testSphere);

  var wallLength = 140,wxMax,wxMin,wzMax,wzMin
  var geometry = new THREE.PlaneGeometry( wallLength, 200, 10,10 );
  var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );

  for ( var i = 0; i < 100; i ++ ) {
  	var wall = new THREE.Mesh( geometry, material );
  	wall.position.x = 2000 * Math.cos(Math.PI * (i / 50.0))
  	wall.position.z = 2000 * Math.sin(Math.PI * (i / 50.0))
  	wall.rotation.y = Math.PI * ((75 - i) % 100 / 50) 

  	var wall_x = (wallLength / 2) * Math.cos(Math.PI * ((i + 25) % 100/ 50.0)),
  		wall_z = (wallLength / 2) * Math.sin(Math.PI * ((i + 25) % 100/ 50.0))

  	var ul = new THREE.Vector3(wall.position.x + wall_x,200,wall.position.z + wall_z),
  		lr = new THREE.Vector3(wall.position.x - wall_x,  0,wall.position.z - wall_z)

  	var cw = new collisionWall(ul, lr),t = 2*sqThick
    //computes bounding box of wall in closest thickness sqThick*2
    wxMax = Math.max(ul.x,lr.x)
    wxMin = Math.min(ul.x,lr.x)
    wzMax = Math.max(ul.z,lr.z)
    wzMin = Math.min(ul.z,lr.z)
    //good here
    wxMax = (wxMax - wxMax % t) + (wxMax>0?t:-t)
    wxMin = (wxMin - wxMin % t) + (wxMin<0?t:-t)
    wzMax = (wzMax - wzMax % t) + (wzMax>0?t:-t)
    wzMin = (wzMin - wzMin % t) + (wzMin<0?t:-t)

    //min/max incorrect
    console.log(wxMin,wxMax,wzMin,wzMax)

    for(var j=wxMin;j<=wxMax;j+=t)
      for(var k = wzMin;k<wzMax;k+=t)
        boundaries[j/t + 11][k/t + 11].push(cw)


    scene.add(wall);
}
console.log(boundaries)
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

  window.addEventListener( 'resize', onWindowResize, false );
}




function animate() {
	requestAnimationFrame( animate );

	render();
	stats.update();
}

function render() {
    if(true){//for when the player is dead etc.
    	move();
    	socket.emit('m', {
    		hash : p_hash,
    		x : charBounds.position.x,
    		y : charBounds.position.y,
    		z : charBounds.position.z
    	});
    }
    renderer.render( scene, camera );
}