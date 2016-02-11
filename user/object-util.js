var Controller = {
  keyIsDown: []
}

document.onkeydown = function(e) {
  Controller.keyIsDown[e.keyCode] = true;
  return false;
}

document.onkeyup = function(e) {
  Controller.keyIsDown[e.keyCode] = false;
  return false;
}

var calcVec = new THREE.Vector3(),
calcVec2 = new THREE.Vector3(),
tmpPos = new THREE.Vector3();

function find_open_num(){
  for(var i in player_alloc){
    if(!player_alloc[i]){
      player_alloc[i] = true;
      return i;
    }
  }
}

function update_game_stats(data){
  for(var d in data){
    if(d in player_stats){
      player_stats[d].deaths = data[d].deaths;
      player_stats[d].kills = data[d].kills;
    }
    else{
      player_stats[d] = {
        num     : find_open_num(),
        deaths  : data[d].deaths,
        kills   : data[d].kills
      }
    }
  }

  update_stats_html();
}

function update_stats_html(){
  var html = "";

  for(var i in player_stats){
    if(i == p_hash){
      html += "<tr class='highlight'>";
      html += "<td>You</td>";
    }else{
      html += "<tr>";
      html += "<td>Player "+(parseInt(player_stats[i].num) + 1)+"</td>";
    }
    html += "<td>"+player_stats[i].kills+"</td>";
    html += "<td>"+player_stats[i].deaths+"</td>";
    html += "</tr>";
  }

  ui_player_stats.innerHTML = html;
}