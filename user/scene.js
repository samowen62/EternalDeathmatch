var geometry = new THREE.SphereGeometry( 75, 32, 32 ); 
var material = new THREE.MeshLambertMaterial( { color: 0x0099cc, shading: THREE.FlatShading, overdraw: 0.5 } );
var testSphere = new THREE.Mesh( geometry, material ); 

//not working right now
var concrete = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/concrete.jpg') } );
var grass = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/grass.jpg') } );

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
  /*var geometry = new THREE.Geometry();

  for ( var i = - size; i <= size; i += step ) {
  	geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
  	geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );
  	geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
  	geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );
  }

  var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2 } );

  var line = new THREE.Line( geometry, material, THREE.LinePieces );
  scene.add( line );*/
  var cw;
  scene.add(testSphere);

  var wallLength = 140,wxMax,wxMin,wzMax,wzMin
  var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );
/*
  for ( var i = 0; i < 100; i ++ ) {
  	var x = 2000 * Math.cos(Math.PI * (i / 50.0))
  	   ,z = 2000 * Math.sin(Math.PI * (i / 50.0))
  	   ,y = Math.PI * ((75 - i) % 100 / 50);

  	var wall_x = (wallLength / 2) * Math.cos(Math.PI * ((i + 25) % 100/ 50.0)),
  		wall_z = (wallLength / 2) * Math.sin(Math.PI * ((i + 25) % 100/ 50.0));

  	var lr = new THREE.Vector3(x + wall_x, 0, z + wall_z),
  		ul = new THREE.Vector3(x - wall_x,  200, z - wall_z);

  	var cw = new collisionWall(ul, lr),t = 2*sqThick;
    //computes bounding box of wall in closest thickness sqThick*2

    //add to 2d array of boundary arrays
    cw.addTo(boundaries);//, t);
    scene.add(new THREE.Mesh( cw.render(), material ));
  }
*/
  // Ground
  var grasses =[
    [new THREE.Vector3(2000,0,2000),new THREE.Vector3(2000,0,-2000), new THREE.Vector3(-2000,0,2000)],
    [new THREE.Vector3(-2000,0,-2000),new THREE.Vector3(2000,0,-2000), new THREE.Vector3(-2000,0,2000)],  
  ];

  

  var floor1_h = 160;
  var building1 = [
    {ul : new THREE.Vector3(250,floor1_h,0), lr : new THREE.Vector3(250,0,50)},
    {ul : new THREE.Vector3(250,floor1_h,50), lr : new THREE.Vector3(280,0,50)},
    {ul : new THREE.Vector3(280,floor1_h,50), lr : new THREE.Vector3(280,0,10)},
    {ul : new THREE.Vector3(280,floor1_h,10), lr : new THREE.Vector3(1000,0,-730)},
    {ul : new THREE.Vector3(1000,floor1_h,-730), lr : new THREE.Vector3(1050,0,-730)},
    {ul : new THREE.Vector3(1050,floor1_h,-730), lr : new THREE.Vector3(1050,0,-750)},

    {ul : new THREE.Vector3(1000,floor1_h,-750), lr : new THREE.Vector3(250,0,0)},
    {ul : new THREE.Vector3(1050,floor1_h,-750), lr : new THREE.Vector3(1000,0,-750)},
    {ul : new THREE.Vector3(1250,floor1_h,-750), lr : new THREE.Vector3(1200,0,-750)},
    {ul : new THREE.Vector3(1200,floor1_h,-750), lr : new THREE.Vector3(1200,0,-730)},
    {ul : new THREE.Vector3(1200,floor1_h,-730), lr : new THREE.Vector3(1250,0,-730)},
    {ul : new THREE.Vector3(1200,floor1_h,-750), lr : new THREE.Vector3(1050,floor1_h - 20,-750)},
    {ul : new THREE.Vector3(1050,floor1_h,-730), lr : new THREE.Vector3(1250,floor1_h - 20,-730)},

    //wall
    {ul : new THREE.Vector3(1250,400,-800), lr : new THREE.Vector3(1250,0,-400)},
    {ul : new THREE.Vector3(1250,400,-1200), lr : new THREE.Vector3(1250,0,-800)},
    {ul : new THREE.Vector3(1250,400,-1600), lr : new THREE.Vector3(1250,0,-1200)},
    {ul : new THREE.Vector3(1250,400,-2000), lr : new THREE.Vector3(1250,0,-1600)},

//render outlines in colwall as well
    {ul : new THREE.Vector3(1050,400,-2000), lr : new THREE.Vector3(1250,0,-2000)},
    {ul : new THREE.Vector3(850,400,-2000), lr : new THREE.Vector3(1050,0,-2000)},
    {ul : new THREE.Vector3(650,400,-2000), lr : new THREE.Vector3(850,0,-2000)},
    {ul : new THREE.Vector3(450,400,-2000), lr : new THREE.Vector3(650,0,-2000)},
    {ul : new THREE.Vector3(250,400,-2000), lr : new THREE.Vector3(450,0,-2000)},
    {ul : new THREE.Vector3(50,400,-2000), lr : new THREE.Vector3(250,0,-2000)},

    //another building
    {ul : new THREE.Vector3(1000,400,-1450), lr : new THREE.Vector3(1000,0,-1850)},
    {ul : new THREE.Vector3(1000,400,-1850), lr : new THREE.Vector3(500,0,-1850)},
    {ul : new THREE.Vector3(500,400,-1850), lr : new THREE.Vector3(500,0,-1830)},
    {ul : new THREE.Vector3(500,400,-1830), lr : new THREE.Vector3(980,0,-1830)},
    {ul : new THREE.Vector3(980,400,-1830), lr : new THREE.Vector3(980,0,-1450)},
    {ul : new THREE.Vector3(980,400,-1450), lr : new THREE.Vector3(1000,0,-1450)},

    {ul : new THREE.Vector3(300,400,-1850), lr : new THREE.Vector3(-100,0,-1850)},
    {ul : new THREE.Vector3(-100,400,-1850), lr : new THREE.Vector3(-100,0,-1000)},
    {ul : new THREE.Vector3(-100,400,-1000), lr : new THREE.Vector3(200,0,-1000)},
    {ul : new THREE.Vector3(200,400,-1000), lr : new THREE.Vector3(200,0,-1020)},
    {ul : new THREE.Vector3(200,400,-1020), lr : new THREE.Vector3(-80,0,-1020)},
    {ul : new THREE.Vector3(-80,400,-1020), lr : new THREE.Vector3(-80,0,-1830)},
    {ul : new THREE.Vector3(-80,400,-1830), lr : new THREE.Vector3(200,0,-1830)},    
    {ul : new THREE.Vector3(200,400,-1830), lr : new THREE.Vector3(200,0,-1850)},

    {ul : new THREE.Vector3(500,400,-1850), lr : new THREE.Vector3(-100,200,-1850)},
    {ul : new THREE.Vector3(-100,400,-1830), lr : new THREE.Vector3(500,200,-1830)},

  ];

  var platforms = [
    [new THREE.Vector3(250,floor1_h,0),new THREE.Vector3(1000,floor1_h,-750),new THREE.Vector3(1000,floor1_h,0)],
    [new THREE.Vector3(1000,floor1_h,0),new THREE.Vector3(1000,floor1_h,-750),new THREE.Vector3(1250,floor1_h,-750)],
    [new THREE.Vector3(1250,floor1_h,-750),new THREE.Vector3(1250,floor1_h,0),new THREE.Vector3(1000,floor1_h,0)],

    //other building
    [new THREE.Vector3(980,200,-1830),new THREE.Vector3(980,200,-1450),new THREE.Vector3(-80,200,-1830)],
    [new THREE.Vector3(-80,200,-1450),new THREE.Vector3(-80,200,-1830),new THREE.Vector3(980,200,-1450)],
    [new THREE.Vector3(-80,200,-1450),new THREE.Vector3(-80,200,-1020),new THREE.Vector3(200,200,-1450)],
    [new THREE.Vector3(200,200,-1020),new THREE.Vector3(200,200,-1450),new THREE.Vector3(-80,200,-1020)],
  ];

  for (var b in building1){
    cw = new collisionWall(building1[b].ul, building1[b].lr);
    cw.addTo(boundaries);
    var toRend = cw.render(material);
    scene.add(toRend[0] );
    scene.add(toRend[1] );
  }

  for (var p in platforms){
    var pl = new platform(platforms[p]);
    var cl = new ceiling(platforms[p]);
    ground.push(pl);
    ceil.push(cl);
    scene.add(new THREE.Mesh( pl.render(), material));
    scene.add(new THREE.Mesh( cl.render(), material));
  }

  for (var g in grasses){
    var gr = new platform(grasses[g]);
    ground.push(gr);
    scene.add(new THREE.Mesh(gr.render(), material));
  }

  var slope = new ramp([new THREE.Vector3(100,100,0), new THREE.Vector3(100,100,100),
                      new THREE.Vector3(0,0,100), new THREE.Vector3(0,0,0)]);
  ramps.push(slope);
  scene.add(new THREE.Mesh( slope.render(), material));
  

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
    	//move();
      character.act();
      //character.position.y += character.thickness.y;
      camera.position.copy(character.position);
      camera.position.y += character.thickness.y;

    	socket.emit('m', {
    		hash : p_hash,
    		x : character.position.x,
    		y : character.position.y,
    		z : character.position.z
    	});
    }
    renderer.render( scene, camera );
}