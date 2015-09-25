socket.on('o', function (data) {
  console.log("rec'd")//
  testSphere.position.setX(data.x)
  testSphere.position.setY(data.y)
  testSphere.position.setZ(data.z)
});

socket.on('id', function (data) {
  if(p_hash == null)
    p_hash = data.id
});
