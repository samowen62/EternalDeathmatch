socket.on('o', function (data) {

  for(var k in data){
  	if(k == p_hash)//self
  		continue;

  	if(players[k] && data[k].pos){
  		players[k].position(new THREE.Vector3(data[k].pos.x ,data[k].pos.y, data[k].pos.z));
  	}
  	else{
  		console.log("new player");
  		players[k] = new pEntity(k); 
  		scene.add(players[k].geo);
  	}
  }
});

socket.on('id', function (data) {
  if(p_hash == null)
    p_hash = data.id;
});

//coll. pg 87 for lines & a bit before for rays is a good resource for triangle collisions
//this is for the entire triangle/square not just a line intersection
