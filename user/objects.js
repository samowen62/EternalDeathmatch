var Controller = {
  keyIsDown: [],
    
  add: function (key, down, up) {
    $(document).keydown(function(e) {
      if(e.keyCode === key && !Controller.keyIsDown[key]) {
        down();
        Controller.keyIsDown[key] = true;
        return false;
      }
    })

    $(document).keyup(function(e) {
      if(e.keyCode === key) {
        if(up) up();
        Controller.keyIsDown[key] = false;
        return false;
      };
    });
  }
}

var calcVec = new THREE.Vector3(),
    calcVec2 = new THREE.Vector3(),
    tmpPos = new THREE.Vector3();

var collisionWall = function (upperLeft, lowerRight) {
  var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();
  var ly = lowerRight.y;

  tmp1.addVectors(upperLeft, lowerRight).multiplyScalar(0.5);
  this.center = tmp1;

  tmp2.subVectors(upperLeft, lowerRight);
  this.halfHeight = (upperLeft.y - ly) / 2;
  lowerRight.y = upperLeft.y;
  tmp3.subVectors(upperLeft, lowerRight);
  tmp3.crossVectors(tmp2, tmp3);
  tmp3.normalize();

  this.normal = tmp3;
  this.next = null,this.prev = null;
  

  lowerRight.y = ly,
  this.verts = {ul : upperLeft, lr : lowerRight},
  this.verts.ll = new THREE.Vector3(upperLeft.x, ly, upperLeft.z),
  this.verts.ur = new THREE.Vector3(lowerRight.x, upperLeft.y, lowerRight.z);

  if(this.verts.ul.x > this.verts.lr.x){
    this.max_x = this.verts.ul.x;
    this.min_x = this.verts.lr.x;
  }else{
    this.min_x = this.verts.ul.x;
    this.max_x = this.verts.lr.x;
  }

  if(this.verts.ul.z > this.verts.lr.z){
    this.max_z = this.verts.ul.z;
    this.min_z = this.verts.lr.z;
  }else{
    this.min_z = this.verts.ul.z;
    this.max_z = this.verts.lr.z;
  }

  this.normal_ul = new THREE.Vector3(tmp3.z,0,-tmp3.x);
  this.normal_lr = new THREE.Vector3(-tmp3.z,0,tmp3.x);
}

collisionWall.prototype = {

  /*
   * looking at normal this is upper left and lower right
   * make sure upperLeft has higher y coord
   *
   * this will create a vertical collision wall
   */
  constructor: collisionWall,

  render: function (mat){
    var geometry = new THREE.Geometry();

    geometry.vertices.push( new THREE.Vector3( this.verts.ul.x,  this.verts.ul.y, this.verts.ul.z ) );
    geometry.vertices.push( new THREE.Vector3( this.verts.ll.x,  this.verts.ll.y, this.verts.ll.z ) );
    geometry.vertices.push( new THREE.Vector3( this.verts.lr.x,  this.verts.lr.y, this.verts.lr.z ) );
    geometry.vertices.push( new THREE.Vector3( this.verts.ur.x,  this.verts.ur.y, this.verts.ur.z ) );

    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) ); // counter-clockwise winding order
    geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var lineMat = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 3,
    });
    var lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(this.verts.ul);
    lineGeo.vertices.push(this.verts.ur);
    lineGeo.vertices.push(this.verts.lr);
    lineGeo.vertices.push(this.verts.ll);
    lineGeo.vertices.push(this.verts.ul);


    return [new THREE.Mesh(geometry, mat), new THREE.Line(lineGeo, lineMat)];
  },

  /*
   * adds collision wall to the necessary locations in the array of boundaries
   *
   * arr: 3d boundary array
   */
  addTo: function (arr){
    var t = 2*sqThick,
    wxMax = Math.max(this.verts.ul.x,this.verts.lr.x),
    wxMin = Math.min(this.verts.ul.x,this.verts.lr.x),
    wzMax = Math.max(this.verts.ul.z,this.verts.lr.z),
    wzMin = Math.min(this.verts.ul.z,this.verts.lr.z),
    wxMax = (wxMax - wxMax % t) + t,
    wxMin = (wxMin - wxMin % t) - t,
    wzMax = (wzMax - wzMax % t) + t,
    wzMin = (wzMin - wzMin % t) - t;

    for(var j=wxMin;j<=wxMax;j+=t)
      for(var k = wzMin;k<wzMax;k+=t)
        boundaries[j/t + 11][k/t + 11].push(this);
  },

  /*
	 * returns positive values if 'inside' (side normal points to),
	 * negative values if on the outside, and 0 if point is inline
	 * with this boundary wall that extends to infinity in y
   */
  whichSideAbsolute: function (point){
  	calcVec.subVectors(point,this.center);
  	return calcVec.dot(this.normal);// > 0 ? 'inside' : 'outside';
  },

  //will return 0 if the point is above or below the wall
  whichSide: function (point){
    calcVec.subVectors(point,this.center);
    //look at this line closer later
    
      //the real player center is on the ground so the equals sign is necessary on
      //the first half but harmful on the second
      if(point.y >= this.center.y + this.halfHeight || point.y < this.center.y - this.halfHeight ){
        return 0;
      }
    return calcVec.dot(this.normal);// > 0 ? 'inside' : 'outside';
  },

  /*
   * Sees if either of the two vectors are even in a position within the edges
   *
   * returns true if there is a collision
   */
  inScope: function (a,b){
    var c,d;
    calcVec.subVectors(a,this.verts.ul);
    c = calcVec.dot(this.normal_ul) > 0;
    calcVec.subVectors(a,this.verts.lr);
    d = calcVec.dot(this.normal_lr) > 0;
    return c && d;
  },

  //check bookmark and try alt implementation of collision
  collides: function (pres, fut){
    var a = this.whichSide(pres) > 0,
    b = this.whichSide(fut) > 0;

    if((!a && b)||(a&& !b)){ //not sure if && would be faster to consolidate next  or test if in scope first?

      return this.inScope(pres,fut);
    }

    return false;
  },

  rayDetect: function (start, pointer){
    var tmp = new THREE.Vector3();
    tmp.subVectors(this.center, start);
    var num = tmp.dot(this.normal),
        den = pointer.dot(this.normal);

    if(den != 0){
      var dist = num / den;
      var ray = new THREE.Vector3();
      ray.copy(pointer);
      ray.multiplyScalar(dist);
      start.add(ray);

      if(Math.abs(start.y - this.center.y) < this.halfHeight){
        if(!(start.x > this.max_x || start.x < this.min_x)){
          if(!(start.z > this.max_z || start.z < this.min_z)){            
            return ({cw : this, spot: start, len: Math.abs(dist)});
          }
        }
      }
        
      return null;
      
    }
  }

};

//points in clockwise directions
var platform = function(points) {
  this.points = points;

  //the following for generalized triangles
  if(points.length != 3)
    return;
  this.flat = (points[0].y == points[1].y) && (points[1].y == points[2].y);
  this.v0 = new THREE.Vector3(points[1].x - points[0].x,points[1].y - points[0].y,points[1].z - points[0].z);
  this.v1 = new THREE.Vector3(points[2].x - points[0].x,points[2].y - points[0].y,points[2].z - points[0].z);
  this.d00 = this.v0.dot(this.v0);
  this.d01 = this.v1.dot(this.v0);
  this.d11 = this.v1.dot(this.v1);
  this.den = this.d00 * this.d11 - this.d01 * this.d01;
  if(this.den == 0)
    this.den = 1;//invalid


  var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();

  tmp1.subVectors(points[0], points[1])
  tmp2.subVectors(points[0], points[2])
  tmp3.crossVectors(tmp2, tmp1)
  tmp3.normalize()

  if(tmp3.y < 0) tmp3.multiplyScalar(-1.0)

  this.normal = tmp3, this.d = points[0].dot(tmp3)
}

platform.prototype = {
  
  constructor: platform,

  sign: function (p1,p2,p3)
  {
    return ((p1.x - p3.x) * (p2.z - p3.z)) - ((p2.x - p3.x) * (p1.z - p3.z));
  },

  //WONT WORK FOR SLANTED HILL PLATFORMS SINCE THE PLANE TAKES UP THE ENTIRE ENVIREONMENT
  //SO ONLY LOOK AT IT IF THE USER IS OVER IT
  //false if underneath
  above: function (point){
    return point.dot(this.normal) >= this.d;
  },

  /*
   * Checks if we are even within the x/z triangle in question
   */
  over: function (point){
    var pt = {x : point.x, z: point.z},
        b1 = this.sign(point, this.points[0], this.points[1]) < 0,
        b2 = this.sign(point, this.points[1], this.points[2]) < 0,
        b3 = this.sign(point, this.points[2], this.points[0]) < 0;

    return ((b1 == b2) && (b2 == b3));
  },

  render: function (){
    var geometry = new THREE.Geometry();

    geometry.vertices.push( this.points[0]);
    geometry.vertices.push( this.points[1]);
    geometry.vertices.push( this.points[2]);

    geometry.faces.push( new THREE.Face3( 0, 2, 1 ) );
    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  baryCoords: function (pos){
    var v2 = new THREE.Vector3(0,0,0);
    v2.subVectors(pos,this.points[0]);

    var d20 = v2.dot(this.v0),
        d21 = v2.dot(this.v1);
        
    //u,v bary for points 0 and 1
    var v = (this.d11 * d20 - this.d01 * d21) / this.den,
        u = 1 - v - ((this.d00 * d21 - this.d01 * d20) / this.den);

    return u * this.points[0].y + v * this.points[1].y;

  },

  yAt: function (pos){
    return this.points[0].y;
  },

  rayDetect: function (start, pointer){
    var tmp = new THREE.Vector3();
    tmp.subVectors(this.points[0], start);
    var num = tmp.dot(this.normal),
        den = pointer.dot(this.normal);

    if(den != 0){
      var dist = num / den;
      //console.log(dist);
      if(dist < 0)
        return null;

      var ray = new THREE.Vector3();
      ray.copy(pointer);
      ray.multiplyScalar(dist);
      start.add(ray);

      if(this.over(start)){
        return ({cw : this, spot: start, len: dist});
      }      
    }

    return null;
  }

};


var ramp = function(points) {
  if(points.length != 4)
    return;
  if(points[0].y != points[1].y || points[2].y != points[3].y)
    return;
  this.points = points;

  var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();

  //used for determining if a point is inside the range
  tmp1.subVectors(points[1], points[0]);
  this.AB = new THREE.Vector2(tmp1.x, tmp1.z);
  this.AB_Sqared = this.AB.dot(this.AB);
  tmp1.subVectors(points[3], points[0]);
  this.AD = new THREE.Vector2(tmp1.x, tmp1.z);
  this.AD_Sqared = this.AD.dot(this.AD);

  tmp1.subVectors(points[0], points[1]);
  tmp2.subVectors(points[0], points[2]);
  tmp3.crossVectors(tmp2, tmp1);
  tmp3.normalize();
  if(tmp3.y < 0) tmp3.multiplyScalar(-1.0);
  this.normal = tmp3, this.d = points[0].dot(tmp3);

  tmp1.addVectors(points[0],points[1]);
  tmp2.addVectors(points[2], points[3]);
  tmp1.add(tmp2);
  tmp1.multiplyScalar(0.25);
  this.center = tmp1;//average of all points

  //assume first two points are lowest? for now
  tmp1 = new THREE.Vector3((points[2].x+points[3].x)*0.5 - this.center.x,points[2].y - this.center.y,(points[2].z+points[3].z)*0.5 - this.center.z)
  tmp1.normalize();
  this.down_ramp = tmp1;
  this.side_ramp = new THREE.Vector3(-this.down_ramp.z, 0,this.down_ramp.x);//90 deg ccw (+90)
  //down/side and normal make ortho basis for this ramp

  this.len_across = Math.pow(points[0].x-points[1].x,2)+Math.pow(points[0].z-points[1].z,2);
  this.len_down = Math.pow(points[0].x-points[3].x,2)+Math.pow(points[0].z-points[3].z,2);

}

ramp.prototype = {
  /*
   * input in clockwise order
   * first and last two should have same y coordinate
  */
  constructor: ramp,

  above: function (point){
    return point.dot(this.normal) >= this.d;
  },

  /*
   * Checks if we are even within the x/z triangle in question
   * and returns appropriate y
   */
  over: function (point){
    var AM = new THREE.Vector2(point.x - this.points[0].x, point.z - this.points[0].z),
        AMdAB = AM.dot(this.AB),
        AMdAD = AM.dot(this.AD);

    var ret = ((0 < AMdAB) && (AMdAB < this.AB_Sqared) && (0 < AMdAD) && (AMdAD < this.AD_Sqared));
    //if(ret){
     // console.log(point.y, this.points[0].y, this.above(point));

    //}
    return ret;
  
  },

  render: function (){
    var geometry = new THREE.Geometry();

    geometry.vertices.push( this.points[0]);
    geometry.vertices.push( this.points[1]);
    geometry.vertices.push( this.points[2]);
    geometry.vertices.push( this.points[3]);

    geometry.faces.push( new THREE.Face3( 0, 2, 1) );
    geometry.faces.push( new THREE.Face3( 0, 3, 2 ) );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  yAt: function (pos){
    var tmp2Vec = new THREE.Vector3();
    tmp2Vec.subVectors(pos, this.center);

    var p_down = tmp2Vec.dot(this.down_ramp),
        p_side = tmp2Vec.dot(this.side_ramp);//component sideways

    return this.center.y + p_down * this.down_ramp.y + 3;
  },

  /*
   *  I'm just skipping this since it doesn't matter
   */
  rayDetect: function () {
    return null;
  }

};

var ceiling = function(points) {
  this.points = points;

  //the following for generalized triangles
  if(points.length != 3)
    return;

  var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();

  tmp1.subVectors(points[0], points[1]);
  tmp2.subVectors(points[0], points[2]);
  tmp3.crossVectors(tmp2, tmp1);
  tmp3.normalize();

  //normal is down not up
  if(tmp3.y > 0) tmp3.multiplyScalar(-1.0);

  this.normal = tmp3, this.d = points[0].dot(tmp3);
}

ceiling.prototype = {
  
  constructor: ceiling,

  sign: function (p1,p2,p3)
  {
    return ((p1.x - p3.x) * (p2.z - p3.z)) - ((p2.x - p3.x) * (p1.z - p3.z));
  },

  //true if below
  below: function (point){
    return point.dot(this.normal) > this.d;
  },

  /*
   * Checks if we are even within the x/z triangle in question
   */
  over: function (point){
    var pt = {x : point.x, z: point.z},
        b1 = this.sign(point, this.points[0], this.points[1]) < 0,
        b2 = this.sign(point, this.points[1], this.points[2]) < 0,
        b3 = this.sign(point, this.points[2], this.points[0]) < 0;
    return ((b1 == b2) && (b2 == b3));
  },

  render: function (){
    var geometry = new THREE.Geometry();

    geometry.vertices.push( this.points[0]);
    geometry.vertices.push( this.points[1]);
    geometry.vertices.push( this.points[2]);

    //reverse order than floor so we can use same verticies
    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  },

  yAt: function (pos){
    return this.points[0].y;
  }

};

var projectile_singleton = function(){
  this.bullets = [];
}

projectile_singleton.prototype = {
  constructor: projectile_singleton,

  add: function (line, color, duration){
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

    this.bullets.push({
      'line' : rend_line,
      'time_left' : duration
    });
  },

  update: function (){
    for(var b in this.bullets){
      this.bullets[b]['time_left']--;
      if(this.bullets[b]['time_left'] == 0){
        scene.remove(this.bullets[b]['line']);  
        this.bullets.splice(b, 1);
      }
    }
  }
}

var shots = new projectile_singleton();

var cEntity = function(pos){
  //should only have y component for testing ceiling collision
  this.thickness = new THREE.Vector3(0,45,0);
  pos.y = this.thickness.y + 5;
  this.position = pos;

  this.stepFoot = BASE_STEP_FOOT;
  this.speed = BASE_SPEED;

  //have to insert in mid-air?
  this.grounded = false;
  this.jumping = false;

  this.air_o = 0;
  this.air_v =  0;
  this.start_t = -1;

  //to stop from firing too fast
  this.last_shot = new Date().getTime() + 3000;

}

cEntity.prototype = {

  constructor: cEntity,

  act: function (){
    this.move();
  },
  
  aim: function (e){
    var movementX = e.movementX ||
      e.mozMovementX          ||
      e.webkitMovementX       ||
      0;

    var movementY = e.movementY ||
        e.mozMovementY      ||
        e.webkitMovementY   ||
        0;


    pointed.applyAxisAngle (up,-mouseSensitivity*movementX);
    left.x = pointed.z;
    left.z = (-1) * pointed.x;
    left.normalize();
    pointed.applyAxisAngle (left,mouseSensitivity*movementY);
    camera.lookAt(tmpVec.addVectors(camera.position, pointed));
  },

  shoot: function (){

    var curr_time = new Date().getTime();
    if(curr_time - this.last_shot < 1500){
      return;
    }else{
      this.last_shot = curr_time;
    }
  
    effects['shotgun'].play();

    calcVec.addVectors(this.position, this.thickness);
    var end_vec = new THREE.Vector3();
    end_vec.copy(pointed);
    end_vec.multiplyScalar(3*MAX_MAP_WIDTH);
    end_vec.add(calcVec);


    //this must detect the first wall that this ray hits
    //need to do floors and ceilings as well in a later loop    

    var wxStart,wxEnd,wzStart,wzEnd,t = 2*sqThick,

    wxStart = calcVec.x;
    wxEnd = end_vec.x;
    wzStart = calcVec.z;
    wzEnd = end_vec.z;

    if(wxStart >= wxEnd){
      wxStart = (wxStart - wxStart % t) + t;
      wxEnd = (wxEnd - wxEnd % t) - t;
    }else{
      wxStart = (wxStart - wxStart % t) - t;
      wxEnd = (wxEnd - wxEnd % t) + t;
    }

    if(wzStart >= wzEnd){
      wzStart = (wzStart - wzStart % t) + t;
      wzEnd = (wzEnd - wzEnd % t) - t;
    }else{
      wzStart = (wzStart - wzStart % t) - t;
      wzEnd = (wzEnd - wzEnd % t) + t;
    }

    wxEnd = (wxEnd > MAX_MAP_WIDTH) ? MAX_MAP_WIDTH : (wxEnd < -MAX_MAP_WIDTH) ? -MAX_MAP_WIDTH : wxEnd;
    wzEnd = (wzEnd > MAX_MAP_WIDTH) ? MAX_MAP_WIDTH : (wzEnd < -MAX_MAP_WIDTH) ? -MAX_MAP_WIDTH : wzEnd;

    var start_Vec = new THREE.Vector3();
    start_Vec.copy(calcVec);

    /*  
     *  I tried to make this next series of control statements as simple as 
     *  possible. Of course there's a million other ways of doing this that are shorter, 
     *  but I didn't want to make it confusing. Also this God awful language combined with
     *  the unpredictable three.js library forced me to add ugly, odd looking code I feel
     *  ashamed as a programmer for writing.
     */
    var pt, min_dist = MAX_MAP_WIDTH, min_wall = null, tmp_v = new THREE.Vector3();

    if(wxStart >= wxEnd){
      if(wzStart >= wzEnd){

        for(var j=wxStart;j>=wxEnd;j-=t){
          for(var k=wzStart;k>=wzEnd;k-=t){
            for(var i in boundaries[j/t + 11][k/t + 11]){
              calcVec.copy(start_Vec);
              pt = boundaries[j/t + 11][k/t + 11][i].rayDetect(calcVec, pointed);
              if(pt != null){
                if(pt.len <= min_dist){
                  min_dist = pt.len;
                  end_vec.copy(pt.spot);
                }
              }
            }
          }
        }

      }else{

        for(var j=wxStart;j>=wxEnd;j-=t){
          for(var k=wzStart;k<=wzEnd;k+=t){
            for(var i in boundaries[j/t + 11][k/t + 11]){
              calcVec.copy(start_Vec);
              pt = boundaries[j/t + 11][k/t + 11][i].rayDetect(calcVec, pointed);
              if(pt != null){
                if(pt.len <= min_dist){
                  min_dist = pt.len;
                  end_vec.copy(pt.spot);
                }
              }
            
            }
          }
        }

      }
    }else{
      if(wzStart >= wzEnd){

        for(var j=wxStart;j<=wxEnd;j+=t){
          for(var k=wzStart;k>=wzEnd;k-=t){
            for(var i in boundaries[j/t + 11][k/t + 11]){
              calcVec.copy(start_Vec);
              pt = boundaries[j/t + 11][k/t + 11][i].rayDetect(calcVec, pointed);
              if(pt != null){
                if(pt.len <= min_dist){
                  min_dist = pt.len;
                  end_vec.copy(pt.spot);
                }
              }
              
            }
          }
        }

      }else{

        for(var j=wxStart;j<=wxEnd;j+=t){
          for(var k=wzStart;k<=wzEnd;k+=t){
            for(var i in boundaries[j/t + 11][k/t + 11]){
              calcVec.copy(start_Vec);
              pt = boundaries[j/t + 11][k/t + 11][i].rayDetect(calcVec, pointed);
              if(pt != null){
                if(pt.len <= min_dist){
                  min_dist = pt.len;
                  end_vec.copy(pt.spot);
                }
              }
               
            }
          }
        }

      }
    }

    //check the ground too, but not ceilings
    for(var g in ground){
      calcVec.copy(start_Vec);
      pt = ground[g].rayDetect(calcVec, pointed);
      if(pt != null){
        if(pt.len <= min_dist){
          min_dist = pt.len;
          end_vec.copy(pt.spot);
        }
      }
    }

    shots.add([start_Vec, end_vec], 0xff0000, 8);

  },

  move: function (){
    if(!Controller)
      return

    var s = this.stepFoot * this.speed;
    var diagS = s / Math.sqrt(2);
    this.position.y = isNaN(this.position.y) ? 0: this.position.y;
    var new_y = this.position.y;

    if(mouseDown){
      this.shoot();
      mouseDown = 0;
    }

    if(Controller.keyIsDown[32] && this.grounded){
      var d = new Date();
      console.log('jumping');
      this.jumping = true;
      this.grounded = false;
      this.ground = null; //redundant

      this.air_v = 100;
      this.start_t = d.getTime();
      this.air_o = this.position.y;
      s *= 0.4;
    }

    else if(this.grounded){
      new_y = this.ground.yAt(this.position);

      //walked off ledge or switching platforms

      //check if walked onto ramp here

      for(var r in ramps){
        if(ramps[r].over(this.position)){
          var r_y = ramps[r].yAt(this.position);
          if(Math.abs(new_y - r_y) < 8){//for slight error. It was 5 but yAt is given an artificial offset of 3
            this.ground = ramps[r];
            new_y = r_y;
          }
        }
      }

      if(!this.ground.over(this.position)){
        //happening here of course
        console.log('falling');
        
        this.grounded = false;

        for(var g in ground){
          if(ground[g].over(this.position)){
            //changing platforms
            if(Math.abs(this.position.y - ground[g].points[0].y) < 3){
              this.grounded = true;
              this.jumping = false;
              this.ground = ground[g];
              break;
            }      
          }
        }

        if(!this.grounded){
          var d = new Date();
          this.jumping = false;
          this.ground = null;


          this.air_v = 0;
          this.start_t = d.getTime();
          this.air_o = this.position.y;// - this.thickness.y;
        }
      }
    }
    else if(!this.grounded){

      var d = new Date();
      var dt = (d.getTime() - this.start_t) / 100;       
      new_y = -5 * (dt*dt) + this.air_v*dt + this.air_o;
      var hit = false;

      var new_pos = new THREE.Vector3(this.position.x, new_y, this.position.z);

      if(this.jumping){

        for(var c in ceil){
          if(ceil[c].over(this.position)){
            var a = ceil[c].below(tmpVec.addVectors(this.position, this.thickness));
            var b = ceil[c].below(tmpVec.addVectors(new_pos, this.thickness));

            if((!a && b)||(a && !b)){
              var d = new Date();
              this.start_t = d.getTime();
              new_y = this.position.y;
              this.air_o = this.position.y;
              this.air_v = 0;
              hit = true;
              break;
            }
          }
        }

        //ramps here too
        for(var g in ground){
          if(ground[g].over(this.position)){
            if(Math.abs(ground[g].yAt(this.position) - new_pos.y) < 3){
              var a = ground[g].above(this.position), b = ground[g].above(new_pos);
              if((!a && b)||(a && !b)){
                new_y = ground[g].yAt(this.position);
                this.grounded = true;
                this.jumping = false;
                this.ground = ground[g];
                break;
              }
            }
          }
        }

      }

      if(!hit){
        for(var g in ground){
          if(ground[g].over(this.position)){

              var a = ground[g].above(this.position), b = ground[g].above(new_pos);
              if((!a && b)||(a && !b)){
                new_y = ground[g].yAt(this.position);
                this.grounded = true;
                this.jumping = false;
                this.ground = ground[g];
                break;
              }

          }
        }
      }
    }

    this.position.y = new_y;
    tmpVec.copy(this.position);
    tmpPos.copy(this.position);


    if((Controller.keyIsDown[87] && Controller.keyIsDown[83]) || (Controller.keyIsDown[68] && Controller.keyIsDown[65]))
      1
    else if(Controller.keyIsDown[87] && Controller.keyIsDown[65]) //w + a
    {
      tmpVec.x += diagS * (pointed.z + pointed.x);
      tmpVec.z += diagS * (pointed.z - pointed.x);
    }
    else if(Controller.keyIsDown[87] && Controller.keyIsDown[68]) //w + d
    {
      tmpVec.x += diagS * (pointed.x - pointed.z);
      tmpVec.z += diagS * (pointed.x + pointed.z);
    }
    else if(Controller.keyIsDown[83] && Controller.keyIsDown[65]) //s + a
    {
      tmpVec.x += diagS * (pointed.z - pointed.x);
      tmpVec.z += diagS * ( -1 * pointed.x - pointed.z);
    }
    else if(Controller.keyIsDown[83] && Controller.keyIsDown[68]) //s + d
    {
      tmpVec.x += diagS * (pointed.z - pointed.x);
      tmpVec.z += diagS * (pointed.x - pointed.z);
    }
    else if(Controller.keyIsDown[87]){ //w
        tmpVec.x += s * pointed.x;
        tmpVec.z += s * pointed.z;
    }
    else if(Controller.keyIsDown[65]){ //a
        tmpVec.x += s * pointed.z;
        tmpVec.z -= s * pointed.x;
    }
    else if(Controller.keyIsDown[83]){ //s
        tmpVec.x -= s * pointed.x;
        tmpVec.z -= s * pointed.z;
    }
    else if(Controller.keyIsDown[68]){ //d
        tmpVec.x -= s * pointed.z;
        tmpVec.z += s * pointed.x;
    }
    else if(Controller.keyIsDown[90]){ //z
        camera.translateY(-10);
    }
    else if(Controller.keyIsDown[88]){ //x
        camera.translateY(10);
    }
    
    tmpVec.y = new_y;
    tmpVec.copy(this.detectCol(tmpPos,tmpVec));

    this.position.copy(tmpVec);
  },

  detectCol: function (present,future){
    if (present.equals(future))
      return present;

    var wxMax,wxMin,wzMax,wzMin,t = 2*sqThick;

    wxMax = Math.max(present.x,future.x);
    wxMin = Math.min(present.x,future.x);
    wzMax = Math.max(present.z,future.z);
    wzMin = Math.min(present.z,future.z);
    wxMax = (wxMax - wxMax % t) + t;
    wxMin = (wxMin - wxMin % t) - t;
    wzMax = (wzMax - wzMax % t) + t;
    wzMin = (wzMin - wzMin % t) - t;

    for(var j=wxMin;j<=wxMax;j+=t){
      for(var k = wzMin;k<wzMax;k+=t){
        for(var i in boundaries[j/t + 11][k/t + 11]){
          if( boundaries[j/t + 11][k/t + 11][i].collides(present, future)){
            //later will want to subtract the 'bad' part of the vector so that the 
            //user may 'slide' along the wall
            return present;
          }
        }
      }
    }

    return future;
   }

};