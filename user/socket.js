
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

      update_game_stats(data.players);
  	}
  }
});

socket.on('id', function (data) {
  if(p_hash == null){
    p_hash = data.id;
  
    player_alloc[0] = true;
    player_stats[p_hash] = {
      num     : 0,
      deaths  : 0,
      kills   : 0
    }

    update_game_stats(data.players);
  }
});

socket.on('projectile', function (data) {
  shots.add([new THREE.Vector3(data.start.x, data.start.y, data.start.z), new THREE.Vector3(data.end.x, data.end.y, data.end.z)], data.color, data.duration);
});

socket.on('damage', function (data) {
	//server says player has been damaged
  console.log(data)
	if(data.id == p_hash && !character.dead){
  		character.damage(data.amount, data.attacker);
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
    if(p_hash == data.id){
      character.respawn(data.pos)
    }else{
      players[data.id].respawn(data.pos);
    }
  }
});

socket.on('left', function(data){
  players[data.id].current_sprite.visible = false;
  player_alloc[player_stats[data.id].num] = false;
  delete player_stats[data.id];
  delete players[data.id];

  update_stats_html();
});

socket.on('stats', function(data){
  update_game_stats(data.players);
});

//coll. pg 87 for lines & a bit before for rays is a good resource for triangle collisions
//this is for the entire triangle/square not just a line intersection
