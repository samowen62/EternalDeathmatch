var player_geometry = new THREE.SphereGeometry( 45, 32, 32 ); 
var player_material = new THREE.MeshLambertMaterial( { color: 0x0099cc, shading: THREE.FlatShading, overdraw: 0.5 } );

//not working right now
var concrete = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/concrete.jpg') } );
var grass = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/grass.jpg') } );

init();
animate();

function init() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
	camera.position.x = 0;
	camera.position.y = 50;
	camera.position.z = 0;

	tmpVec.addVectors(camera.position, pointed);
	camera.lookAt(tmpVec);

	scene = new THREE.Scene();

  // Grid

  var size = MAX_MAP_WIDTH, step = 200, cw;
  var wallLength = 140,wxMax,wxMin,wzMax,wzMin
  var material = new THREE.MeshLambertMaterial( { color: 0xffffff, shading: THREE.FlatShading, overdraw: 0.5 } );

  // Ground
  var grasses =[
    [new THREE.Vector3(2000,0,2000),new THREE.Vector3(2000,0,-2000), new THREE.Vector3(-2000,0,2000)],
    [new THREE.Vector3(-2000,0,-2000),new THREE.Vector3(2000,0,-2000), new THREE.Vector3(-2000,0,2000)],  
  ];

  var floor1_h = 160;
  var walls = [
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
    {ul : new THREE.Vector3(250,floor1_h,0), lr : new THREE.Vector3(250,floor1_h - 20,180)},
    {ul : new THREE.Vector3(280,floor1_h,180), lr : new THREE.Vector3(280,floor1_h - 20,0)},
    {ul : new THREE.Vector3(280,floor1_h,180), lr : new THREE.Vector3(250,0,180)},
    {ul : new THREE.Vector3(250,floor1_h,180), lr : new THREE.Vector3(250,0,300)},
    {ul : new THREE.Vector3(250,floor1_h,300), lr : new THREE.Vector3(400,0,300)},
    {ul : new THREE.Vector3(400,floor1_h,300), lr : new THREE.Vector3(400,0,150)},//ramp goes about here
    {ul : new THREE.Vector3(280,floor1_h,300), lr : new THREE.Vector3(280,0,180)},
    {ul : new THREE.Vector3(380,floor1_h,300), lr : new THREE.Vector3(280,0,300)},
    {ul : new THREE.Vector3(380,floor1_h,150), lr : new THREE.Vector3(380,0,300)},
    {ul : new THREE.Vector3(710,floor1_h,150), lr : new THREE.Vector3(380,0,150)},
    {ul : new THREE.Vector3(380,floor1_h,150), lr : new THREE.Vector3(710,0,150)},
    {ul : new THREE.Vector3(710,floor1_h,300), lr : new THREE.Vector3(710,0,150)},
    {ul : new THREE.Vector3(1250,floor1_h,300), lr : new THREE.Vector3(700,0,300)},
    {ul : new THREE.Vector3(1300,600,600), lr : new THREE.Vector3(1000,0,300)},
    {ul : new THREE.Vector3(1000,600,300), lr : new THREE.Vector3(700,0,300)},
    {ul : new THREE.Vector3(700,600,300), lr : new THREE.Vector3(400,0,600)},
    {ul : new THREE.Vector3(400,600,600), lr : new THREE.Vector3(400,0,900)},
    

    //posts
    {ul : new THREE.Vector3(410,200,-400), lr : new THREE.Vector3(400,0,-410)},
    {ul : new THREE.Vector3(400,200,-410), lr : new THREE.Vector3(390,0,-400)},
    {ul : new THREE.Vector3(390,200,-400), lr : new THREE.Vector3(400,0,-390)},
    {ul : new THREE.Vector3(400,200,-390), lr : new THREE.Vector3(410,0,-400)},
    {ul : new THREE.Vector3(510,200,-500), lr : new THREE.Vector3(500,0,-510)},
    {ul : new THREE.Vector3(500,200,-510), lr : new THREE.Vector3(490,0,-500)},
    {ul : new THREE.Vector3(490,200,-500), lr : new THREE.Vector3(500,0,-490)},
    {ul : new THREE.Vector3(500,200,-490), lr : new THREE.Vector3(510,0,-500)},
    {ul : new THREE.Vector3(590,200,-200), lr : new THREE.Vector3(700,floor1_h,-310)},
    {ul : new THREE.Vector3(700,200,-310), lr : new THREE.Vector3(630,floor1_h,-380)},
    {ul : new THREE.Vector3(630,200,-380), lr : new THREE.Vector3(520,floor1_h,-270)},
    {ul : new THREE.Vector3(520,200,-270), lr : new THREE.Vector3(590,floor1_h,-200)},


    //wall
    {ul : new THREE.Vector3(1250,400,800), lr : new THREE.Vector3(1250,0,1200)},
    {ul : new THREE.Vector3(1250,400,400), lr : new THREE.Vector3(1250,0,800)},
    {ul : new THREE.Vector3(1250,400,0), lr : new THREE.Vector3(1250,0,400)},
    {ul : new THREE.Vector3(1250,400,-400), lr : new THREE.Vector3(1250,0,0)},
    {ul : new THREE.Vector3(1250,400,-800), lr : new THREE.Vector3(1250,0,-400)},
    {ul : new THREE.Vector3(1250,400,-1200), lr : new THREE.Vector3(1250,0,-800)},
    {ul : new THREE.Vector3(1250,400,-1600), lr : new THREE.Vector3(1250,0,-1200)},
    {ul : new THREE.Vector3(1250,400,-2000), lr : new THREE.Vector3(1250,0,-1600)},
    {ul : new THREE.Vector3(1050,400,-2000), lr : new THREE.Vector3(1250,0,-2000)},
    {ul : new THREE.Vector3(850,400,-2000), lr : new THREE.Vector3(1050,0,-2000)},
    {ul : new THREE.Vector3(650,400,-2000), lr : new THREE.Vector3(850,0,-2000)},
    {ul : new THREE.Vector3(450,400,-2000), lr : new THREE.Vector3(650,0,-2000)},
    {ul : new THREE.Vector3(200,400,-2000), lr : new THREE.Vector3(450,0,-2000)},
    {ul : new THREE.Vector3(200,400,-1850), lr : new THREE.Vector3(200,0,-2000)},

    {ul : new THREE.Vector3(400,200,700), lr : new THREE.Vector3(-100,0,700)},
    {ul : new THREE.Vector3(-100,450,850), lr : new THREE.Vector3(-100,0,200)},
    {ul : new THREE.Vector3(-100,450,200), lr : new THREE.Vector3(-120,0,200)},
    {ul : new THREE.Vector3(-120,450,200), lr : new THREE.Vector3(-120,0,600)},
    {ul : new THREE.Vector3(-120,450,600), lr : new THREE.Vector3(-700,0,600)},
    {ul : new THREE.Vector3(-700,450,600), lr : new THREE.Vector3(-700,0,-150)},
    {ul : new THREE.Vector3(-500,450,220), lr : new THREE.Vector3(-350,0,220)},
    {ul : new THREE.Vector3(-350,450,220), lr : new THREE.Vector3(-350,0,-250)},
    {ul : new THREE.Vector3(-350,450,-250), lr : new THREE.Vector3(-500,0,-250)},
    {ul : new THREE.Vector3(-500,450,-250), lr : new THREE.Vector3(-500,0,220)},


    //another building
    {ul : new THREE.Vector3(1000,400,-1450), lr : new THREE.Vector3(1000,0,-1850)},
    {ul : new THREE.Vector3(1000,400,-1850), lr : new THREE.Vector3(500,0,-1850)},
    {ul : new THREE.Vector3(500,400,-1850), lr : new THREE.Vector3(500,0,-1830)},
    {ul : new THREE.Vector3(500,400,-1830), lr : new THREE.Vector3(980,0,-1830)},
    {ul : new THREE.Vector3(980,400,-1830), lr : new THREE.Vector3(980,0,-1450)},
    {ul : new THREE.Vector3(980,400,-1450), lr : new THREE.Vector3(1000,0,-1450)},
    {ul : new THREE.Vector3(-100,400,-1420), lr : new THREE.Vector3(-100,0,-1000)},
    {ul : new THREE.Vector3(-100,400,-1000), lr : new THREE.Vector3(200,0,-1000)},
    {ul : new THREE.Vector3(200,400,-1000), lr : new THREE.Vector3(200,0,-1020)},
    {ul : new THREE.Vector3(200,400,-1020), lr : new THREE.Vector3(-80,0,-1020)},
    {ul : new THREE.Vector3(-80,400,-1720), lr : new THREE.Vector3(-80,0,-1830)},
    {ul : new THREE.Vector3(-80,400,-1020), lr : new THREE.Vector3(-80,0,-1420)},
    {ul : new THREE.Vector3(-80,400,-1830), lr : new THREE.Vector3(200,0,-1830)},    
    {ul : new THREE.Vector3(200,400,-1830), lr : new THREE.Vector3(200,0,-1850)},
    {ul : new THREE.Vector3(-80,400,-1420), lr : new THREE.Vector3(-100,0,-1420)},
    {ul : new THREE.Vector3(-100,400,-1720), lr : new THREE.Vector3(-80,0,-1720)},
    {ul : new THREE.Vector3(500,400,-1850), lr : new THREE.Vector3(-100,200,-1850)},
    {ul : new THREE.Vector3(-100,400,-1830), lr : new THREE.Vector3(500,200,-1830)},
    {ul : new THREE.Vector3(1000,300,-1020), lr : new THREE.Vector3(1000,0,-1450)},
    {ul : new THREE.Vector3(980,300,-1020), lr : new THREE.Vector3(1000,0,-1020)},
    {ul : new THREE.Vector3(980,300,-1450), lr : new THREE.Vector3(980,0,-1020)},
    {ul : new THREE.Vector3(700,198,-1200), lr : new THREE.Vector3(700,0,-1450)},
    {ul : new THREE.Vector3(680,198,-1200), lr : new THREE.Vector3(700,0,-1200)},
    {ul : new THREE.Vector3(680,198,-1550), lr : new THREE.Vector3(680,0,-1200)},
    {ul : new THREE.Vector3(980,198,-1550), lr : new THREE.Vector3(680,0,-1550)},
    {ul : new THREE.Vector3(150,600,-1400), lr : new THREE.Vector3(250,0,-1400)},
    {ul : new THREE.Vector3(250,600,-1400), lr : new THREE.Vector3(250,0,-1500)},
    {ul : new THREE.Vector3(250,600,-1500), lr : new THREE.Vector3(150,0,-1500)},
    {ul : new THREE.Vector3(150,600,-1500), lr : new THREE.Vector3(150,0,-1400)},

    {ul : new THREE.Vector3(-400,400,-1720), lr : new THREE.Vector3(-100,0,-1720)},
    {ul : new THREE.Vector3(-400,400,-1500), lr : new THREE.Vector3(-400,0,-1720)},
    {ul : new THREE.Vector3(-400,400,-1000), lr : new THREE.Vector3(-400,200,-1300)},
    {ul : new THREE.Vector3(-400,200,-1000), lr : new THREE.Vector3(-400,0,-1500)},
    {ul : new THREE.Vector3(-950,400,-1500), lr : new THREE.Vector3(-400,0,-1500)},
    {ul : new THREE.Vector3(-400,400,-1300), lr : new THREE.Vector3(-700,0,-1300)},
    {ul : new THREE.Vector3(-700,400,-1300), lr : new THREE.Vector3(-700,0,-1000)},
    {ul : new THREE.Vector3(-700,400,-1000), lr : new THREE.Vector3(-400,0,-1000)},
    {ul : new THREE.Vector3(-950,400,-800), lr : new THREE.Vector3(-950,0,-1500)},
    {ul : new THREE.Vector3(-700,400,-150), lr : new THREE.Vector3(-950,0,-800)},
  ];

  //specified cw
  //holds boundaries for both platforms and ceilings
  var horiz_bounds = [
    [new THREE.Vector3(250,floor1_h,0),new THREE.Vector3(1000,floor1_h,-750),new THREE.Vector3(1000,floor1_h,0)],
    [new THREE.Vector3(1000,floor1_h,0),new THREE.Vector3(1000,floor1_h,-750),new THREE.Vector3(1250,floor1_h,-750)],
    [new THREE.Vector3(1250,floor1_h,-750),new THREE.Vector3(1250,floor1_h,0),new THREE.Vector3(1000,floor1_h,0)],
    [new THREE.Vector3(400,floor1_h,0),new THREE.Vector3(400,floor1_h,300),new THREE.Vector3(250,floor1_h,300)],
    [new THREE.Vector3(400,floor1_h,0),new THREE.Vector3(250,floor1_h,300),new THREE.Vector3(250,floor1_h,0)],
    [new THREE.Vector3(700,floor1_h,0),new THREE.Vector3(700,floor1_h,150),new THREE.Vector3(400,floor1_h,150)],
    [new THREE.Vector3(700,floor1_h,0),new THREE.Vector3(400,floor1_h,150),new THREE.Vector3(400,floor1_h,0)],
    [new THREE.Vector3(1250,floor1_h,0),new THREE.Vector3(1250,floor1_h,600),new THREE.Vector3(700,floor1_h,600)],
    [new THREE.Vector3(1250,floor1_h,0),new THREE.Vector3(700,floor1_h,600),new THREE.Vector3(700,floor1_h,0)],
    [new THREE.Vector3(390,200,-400),new THREE.Vector3(500,200,-510),new THREE.Vector3(700,200,-310)],
    [new THREE.Vector3(390,200,-400),new THREE.Vector3(700,200,-310),new THREE.Vector3(590,200,-200)],

    //other building
    [new THREE.Vector3(980,200,-1830),new THREE.Vector3(980,200,-1450),new THREE.Vector3(-80,200,-1830)],
    [new THREE.Vector3(-80,200,-1450),new THREE.Vector3(-80,200,-1830),new THREE.Vector3(980,200,-1450)],
    [new THREE.Vector3(-400,200,-1450),new THREE.Vector3(-400,200,-1020),new THREE.Vector3(200,200,-1450)],
    [new THREE.Vector3(200,200,-1020),new THREE.Vector3(200,200,-1450),new THREE.Vector3(-400,200,-1020)],
    [new THREE.Vector3(-400,200,-1420),new THREE.Vector3(-80,200,-1420),new THREE.Vector3(-80,200,-1720)],
    [new THREE.Vector3(-400,200,-1420),new THREE.Vector3(-80,200,-1720),new THREE.Vector3(-400,200,-1720)],
    [new THREE.Vector3(-700,200,850),new THREE.Vector3(-100,200,850),new THREE.Vector3(-100,200,200)],
    [new THREE.Vector3(-700,200,850),new THREE.Vector3(-100,200,200),new THREE.Vector3(-700,200,200)]
  ];

  var ramp_array = [
    //ccw
    [new THREE.Vector3(980,0,-1200), new THREE.Vector3(700,0,-1200), new THREE.Vector3(700,200,-1450), new THREE.Vector3(980,200,-1450)],
    [new THREE.Vector3(700,floor1_h,150), new THREE.Vector3(700,floor1_h,550), new THREE.Vector3(450,0,550), new THREE.Vector3(450,0,150)],
    [new THREE.Vector3(-400,200,-1500), new THREE.Vector3(-400,200,-1300), new THREE.Vector3(-700,0,-1300), new THREE.Vector3(-700,0,-1500)],
    [new THREE.Vector3(-500,200,200), new THREE.Vector3(-700,200,200), new THREE.Vector3(-700,0,-150), new THREE.Vector3(-500,0,-150)],

  ];

  //strictly ceilings
  var ceils = [
    [new THREE.Vector3(200,200,-1850), new THREE.Vector3(500,200,-1850), new THREE.Vector3(500,200,-1830)],
    [new THREE.Vector3(200,200,-1850), new THREE.Vector3(500,200,-1830), new THREE.Vector3(200,200,-1830)]
  ];

  //strictly floors
  var platforms = [
    [new THREE.Vector3(1000,300,-1450),new THREE.Vector3(1000,300,-1020),new THREE.Vector3(980,300,-1020)],
    [new THREE.Vector3(1000,300,-1450),new THREE.Vector3(980,300,-1020),new THREE.Vector3(980,300,-1450)],
    [new THREE.Vector3(700,198,-1450),new THREE.Vector3(700,198,-1200),new THREE.Vector3(680,198,-1200)],
    [new THREE.Vector3(700,198,-1450),new THREE.Vector3(680,198,-1200),new THREE.Vector3(680,198,-1450)]
  ];

  for (var b in walls){
    cw = new collisionWall(walls[b].ul, walls[b].lr);
    cw.addTo(boundaries);
    var toRend = cw.render(material);
    scene.add(toRend[0] );
    scene.add(toRend[1] );
  }

  for (var p in horiz_bounds){
    var pl = new platform(horiz_bounds[p]);
    var cl = new ceiling(horiz_bounds[p]);
    ground.push(pl);
    ceil.push(cl);
    scene.add(new THREE.Mesh( pl.render(), material));
    scene.add(new THREE.Mesh( cl.render(), material));
  }

  for(var p in platforms){
    var pl = new platform(platforms[p]);
    ground.push(pl);
    scene.add(new THREE.Mesh( pl.render(), material));
  }

  for(var c in ceils){
    var cl = new ceiling(ceils[c]);
    ceil.push(cl);
    scene.add(new THREE.Mesh( cl.render(), material));
  }

  for (var g in grasses){
    var gr = new platform(grasses[g]);
    ground.push(gr);
    scene.add(new THREE.Mesh(gr.render(), material));
  }

  for (var r in ramp_array){
    var slope = new ramp(ramp_array[r]);
    ground.push(slope);
    ramps.push(slope);
    scene.add(new THREE.Mesh( slope.render(), material));
  }

  // Lights

  var ambientLight = new THREE.AmbientLight( Math.random() * 0x10 );
  scene.add( ambientLight );

  var dir_colors = [ 0x008000, 0x0000ff, 0x0099cc0, 0xff0000, 0xdddddd, 0xffd700];
  for(var i = 0; i < 6; i++){
    var directionalLight = new THREE.DirectionalLight( dir_colors[i] );
    directionalLight.position.x = (i % 3 == 0 ? (i - 1.5)/1.5 : 0);
    directionalLight.position.y = (i % 3 == 1 ? (i - 2.5)/1.5 : 0);
    directionalLight.position.z = (i % 3 == 2 ? (i - 3.5)/1.5 : 0);
    directionalLight.position.normalize();
    scene.add( directionalLight );
  }

  //can castShadow = true but expensive?

  var imagePrefix = "images/dawnmountain-";
  var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
  var imageSuffix = ".png";
  var skyGeometry = new THREE.CubeGeometry( 7000, 7000, 7000 ); 
  
  var materialArray = [];
  for (var i = 0; i < 6; i++)
    materialArray.push( new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
      side: THREE.BackSide
    }));
  var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
  var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
  scene.add( skyBox );

  var ballTexture = THREE.ImageUtils.loadTexture( 'images/gun.png' );
  
  var ballMaterial = new THREE.SpriteMaterial( { map: ballTexture, useScreenCoordinates: true  } );
  sprite = new THREE.Sprite( ballMaterial );
  sprite.position.set( 150, 150, -150 );
  sprite.scale.set( 100, 64, 1.0 ); // imageWidth, imageHeight
  scene.add( sprite );

  renderer = new THREE.WebGLRenderer({ antialias: true });
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
  if(shots)
    shots.update();

    if(true){//for when the player is dead etc.

      character.act();
      camera.position.copy(character.position);
      camera.position.y += character.thickness.y;


      tmpVec.copy(pointed);
      tmpVec.multiplyScalar(30);
      sprite.position.copy(tmpVec.add(camera.position));
      //plane.rotation.setFromRotationMatrix( camera.matrix );
      

      if(Math.abs(character.position.x) > 2000 || Math.abs(character.position.y) > 2000 || Math.abs(character.position.z) > 2000){
        socket.emit('death', {
          hash : p_hash
        });
        character.kill();
      }

    	socket.emit('m', {
    	//	hash : p_hash,
    		x : character.position.x,
    		y : character.position.y,
    		z : character.position.z
    	});
    }
    renderer.render( scene, camera );
}