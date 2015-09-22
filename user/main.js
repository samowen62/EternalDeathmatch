socket.on('o', function (data) {

  testSphere.position.setX(-data.x)
  testSphere.position.setY(data.y)
  testSphere.position.setZ(data.z)
});

socket.on('id', function (data) {
  p_hash = data.id
  console.log(p_hash)
});
