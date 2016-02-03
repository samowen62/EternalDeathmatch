
//projectiles.js

function projectiles(){
  var bullets = [];

  this.start = function (line, color, duration){
    //in this function check the entity list for hits
    socket.emit('projectile', {
      line      : {
        start : {
          x : line[0].x,
          y : line[0].y,
          z : line[0].z
        },
        end   : {
          x : line[1].x,
          y : line[1].y,
          z : line[1].z
        }
      },
      color     : color,
      duration  : duration
    });
  },

  this.add = function(line, color, duration){
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
  }

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