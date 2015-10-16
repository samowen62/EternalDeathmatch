function onWindowResize() {

  camera.left = window.innerWidth / - 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = window.innerHeight / - 2;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

$("body").mousemove(function(e) {
  //logic could go here
  character.aim(e)

});

var character = new cEntity(new THREE.Vector3(45,45,45));

var keys = [65, 68, 83, 87, 88, 89, 90, 32];
for(var i in keys){
  Controller.add(keys[i],
      function () {},
      function () {})
}

