
//projectiles.js

function projectiles(){
  var bullets = [];

  this.add = function (line, color, duration){
    //in this function check the entity list for hits
    var lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(line[0]);
    lineGeo.vertices.push(line[1]);

    var lineMat = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 3,
    });


    var rend_line = new THREE.Line(lineGeo, lineMat);

    scene.add( rend_line);

    bullets.push({
      'line' : rend_line,
      'time_left' : duration
    });
  },

  this.update = function (){
    for(var b in bullets){
      bullets[b]['time_left']--;
      if(bullets[b]['time_left'] == 0){
        scene.remove(bullets[b]['line']);  
        bullets.splice(b, 1);
      }
    }
  }
}

var shots = new projectiles();