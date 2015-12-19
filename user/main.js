socket.on('o', function (data) {
  //testSphere.position.setX(data.x)
  //testSphere.position.setY(data.y)
  //testSphere.position.setZ(data.z)
  console.log(data);
});

socket.on('id', function (data) {
  if(p_hash == null)
    p_hash = data.id
});

//coll. pg 87 for lines & a bit before for rays is a good resource for triangle collisions
//this is for the entire triangle/square not just a line intersection
