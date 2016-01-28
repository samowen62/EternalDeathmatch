
//socket.js

socket.on('o', function (data) {
  for(var k in data){

  	if(k == p_hash)
  		continue;

  	if(players[k]){
      if(data[k].pos && players[k].alive){
    		players[k].position(
    			new THREE.Vector3(data[k].pos.x ,data[k].pos.y + PLAYER_HEIGHT, data[k].pos.z),
  	 	   	new THREE.Vector2(data[k].pnt.x ,data[k].pnt.z).normalize()
  	   	);
      }
  	}
  	else if(!players[k]){
  		console.log("new player "+k+" entered");
  		players[k] = new pEntity(k); 
  		scene.add(players[k].current_sprite);
  	}
  }
});

socket.on('id', function (data) {
  if(p_hash == null)
    p_hash = data.id;
});

socket.on('damage', function (data) {
	//server says player has been damaged

	if(data.id == p_hash){
  		character.damage(data.amount);
  		ui_health.innerHTML = character.health <= 0 ? 0 : character.health;
  	}
});

socket.on('kill', function (data) {
	//server says player is dead
	if(data.id == p_hash){
	  	console.log("you died >:)");
  		character.kill();
  	}else{
      players[data.id].kill();
  		//play sprite death sequence
  	}
});

socket.on('respawn', function (data) {
  //the player is ressurected!
  console.log("ressurection!");
  for(var p in players){
    if(players[p] == data.id){
      players[p].respawn(data.pos);
    }else if(p_hash == data.id){
      character.respawn(data.pos)
    }
  }
});

//coll. pg 87 for lines & a bit before for rays is a good resource for triangle collisions
//this is for the entire triangle/square not just a line intersection
