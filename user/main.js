socket.on('o', function (data) {

  testSphere.position.setX(-data.x)
  testSphere.position.setY(data.y)
  testSphere.position.setZ(-data.z)
});
