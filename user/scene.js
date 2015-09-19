var geometry = new THREE.SphereGeometry( 75, 32, 32 ); 
var material = new THREE.MeshLambertMaterial( { color: 0x0099cc, shading: THREE.FlatShading, overdraw: 0.5 } );
var testSphere = new THREE.Mesh( geometry, material ); 

init();
animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> - orthographic view';
	container.appendChild( info );

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
  // Cubes

  var geometry = new THREE.BoxGeometry( 200, 200, 200 );
  var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );

  for ( var i = 0; i < 100; i ++ ) {

  	var cube = new THREE.Mesh( geometry, material );

  	cube.scale.y = Math.floor( Math.random() * 2 + 1 );

  	cube.position.x = Math.floor( ( Math.random() * 4000 - 2000 ) / 200 ) * 200 + 100;
  	cube.position.y = ( cube.scale.y * 200 ) / 2;
  	cube.position.z = Math.floor( ( Math.random() * 4000 - 2000 ) / 200 ) * 200 + 100;

    //add verticies to list of collidable objects
    boundaryList.push({
    	center : cube.position,
      //not total width but half
      thickness : new THREE.Vector3(100, 100 * cube.scale.y , 100)
  });
    scene.add( cube );

}

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

  //

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