var Controller = {
    keyIsDown: [],
    
    add: function (key, down, up) {
        $(document).keydown(function(e) {
            if(e.keyCode === key && !Controller.keyIsDown[key]) {
                    down()
                Controller.keyIsDown[key] = true
                return false
            }
        })

        $(document).keyup(function(e) {
            if(e.keyCode === key) {
                if(up) up()
                Controller.keyIsDown[key] = false
                return false
            }
        })
    },
}

var calcVec = new THREE.Vector3()
var tmpPos = new THREE.Vector3()
var collisionWall = class {

  /*
   * looking at normal this is upper left and lower right
   * make sure upperLeft has higher y coord
   *
   * this will create a vertical collision wall
   */
  constructor(upperLeft, lowerRight) {
  	var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();
    var ly = lowerRight.y

    tmp1.addVectors(upperLeft, lowerRight).multiplyScalar(0.5)
    this.center = tmp1

    tmp2.subVectors(upperLeft, lowerRight);
    this.halfHeight = (upperLeft.y - ly) / 2;
    lowerRight.y = upperLeft.y;
    tmp3.subVectors(upperLeft, lowerRight);
    tmp3.crossVectors(tmp2, tmp3);
    tmp3.normalize();

    this.normal = tmp3
    this.next = null,this.prev = null
    

    lowerRight.y = ly,
    this.verts = {ul : upperLeft, lr : lowerRight},
    this.verts.ll = new THREE.Vector3(upperLeft.x, ly, upperLeft.z),
    this.verts.ur = new THREE.Vector3(lowerRight.x, upperLeft.y, lowerRight.z),

    this.normal_ul = new THREE.Vector3(tmp3.z,0,-tmp3.x),
    this.normal_lr = new THREE.Vector3(-tmp3.z,0,tmp3.x);
  }

  render(mat){
    var geometry = new THREE.Geometry();

    geometry.vertices.push( new THREE.Vector3( this.verts.ul.x,  this.verts.ul.y, this.verts.ul.z ) );
    geometry.vertices.push( new THREE.Vector3( this.verts.ll.x,  this.verts.ll.y, this.verts.ll.z ) );
    geometry.vertices.push( new THREE.Vector3( this.verts.lr.x,  this.verts.lr.y, this.verts.lr.z ) );
    geometry.vertices.push( new THREE.Vector3( this.verts.ur.x,  this.verts.ur.y, this.verts.ur.z ) );

    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) ); // counter-clockwise winding order
    geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return new THREE.Mesh(geometry, mat);
  }

  addNext(next) {
  	this.next = next
  }

  addNext(prev) {
  	this.prev = prev
  }

  /*
   * adds collision wall to the necessary locations in the array of boundaries
   *
   * arr: 3d boundary array
   */
  addTo(arr){
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
  }

  /*
	 * returns positive values if 'inside' (side normal points to),
	 * negative values if on the outside, and 0 if point is inline
	 * with this boundary wall that extends to infinity in y
   */
  whichSideAbsolute(point){
  	calcVec.subVectors(point,this.center)
  	return calcVec.dot(this.normal);// > 0 ? 'inside' : 'outside';
  }

  //will return 0 if the point is above or below the wall
  whichSide(point){
    calcVec.subVectors(point,this.center)
    //look at this line closer later
    
      //the real player center is on the ground so the equals sign is necessary on
      //the first half but harmful on the second
      if(point.y >= this.center.y + this.halfHeight || point.y < this.center.y - this.halfHeight ){
        return 0;
      }
    return calcVec.dot(this.normal);// > 0 ? 'inside' : 'outside';
  }

  /*
   * Sees if either of the two vectors are even in a position within the edges
   *
   * returns true if there is a collision
   */
  inScope(a,b){
    var c,d;
    calcVec.subVectors(a,this.verts.ul);
    c = calcVec.dot(this.normal_ul) > 0;
    calcVec.subVectors(a,this.verts.lr);
    d = calcVec.dot(this.normal_lr) > 0;
    return c && d;
  }

//check bookmark and try alt implementation of collision
  collides(pres, fut){
    var a = this.whichSide(pres) > 0,
    b = this.whichSide(fut) > 0;

    if((!a && b)||(a&& !b)){ //not sure if && would be faster to consolidate next  or test if in scope first?

      return this.inScope(pres,fut);
    }

    return false;
  }

  //statics take 2 objs as input
  static distance(a, b) {
    return 0
   }
};

//points in clockwise directions
var platform = class {
  
  constructor(points) {
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

  sign (p1,p2,p3)
  {
    return ((p1.x - p3.x) * (p2.z - p3.z)) - ((p2.x - p3.x) * (p1.z - p3.z));
  }

  //WONT WORK FOR SLANTED HILL PLATFORMS SINCE THE PLANE TAKES UP THE ENTIRE ENVIREONMENT
  //SO ONLY LOOK AT IT IF THE USER IS OVER IT
  //false if underneath
  above(point){
    return point.dot(this.normal) >= this.d;
  }

  /*
   * Checks if we are even within the x/z triangle in question
   */
  over(point){
    var pt = {x : point.x, z: point.z},
        b1 = this.sign(point, this.points[0], this.points[1]) < 0,
        b2 = this.sign(point, this.points[1], this.points[2]) < 0,
        b3 = this.sign(point, this.points[2], this.points[0]) < 0;
//console.log(b1,b2,b3)
    return ((b1 == b2) && (b2 == b3));
  }

  render(){
    var geometry = new THREE.Geometry();

    geometry.vertices.push( this.points[0]);
    geometry.vertices.push( this.points[1]);
    geometry.vertices.push( this.points[2]);

    geometry.faces.push( new THREE.Face3( 0, 2, 1 ) );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  }

  baryCoords(pos){
    var v2 = new THREE.Vector3(0,0,0);
    v2.subVectors(pos,this.points[0]);

    var d20 = v2.dot(this.v0),
        d21 = v2.dot(this.v1);
        
    //u,v bary for points 0 and 1
    var v = (this.d11 * d20 - this.d01 * d21) / this.den,
        u = 1 - v - ((this.d00 * d21 - this.d01 * d20) / this.den);

    return u * this.points[0].y + v * this.points[1].y;

  }

  yAt(pos){
    if(this.flat)
      return this.points[0].y;
    return this.baryCoords(pos);
  }

};

//var points = [new THREE.Vector3(2,10,4), new THREE.Vector3(5,10,0), new THREE.Vector3(1,0,-3), new THREE.Vector3(-2,0,1)]
//like collision wall but up is in x/y plane and walkable
var ramp = class {
  /*
   * input in clockwise order
   * first and last two should have same y coordinate
  */
  constructor(points) {
    if(points.length != 4)
      return;
    if(points[0].y != points[1].y || points[2].y != points[3].y)
      return;
    this.points = points;

    var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();

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

    //assume first two points are largest for now
    tmp1 = new THREE.Vector3((points[2].x+points[3].x)*0.5 - this.center.x,points[2].y - this.center.y,(points[2].z+points[3].z)*0.5 - this.center.z)
    tmp1.normalize();
    this.down_ramp = tmp1;
    this.side_ramp = new THREE.Vector3(-this.down_ramp.z, 0,this.down_ramp.x);//90 deg ccw (+90)
    //down/side and normal make ortho basis for this ramp

    this.len_across = Math.pow(points[0].x-points[1].x,2)+Math.pow(points[0].z-points[1].z,2);
    this.len_down = Math.pow(points[0].x-points[3].x,2)+Math.pow(points[0].z-points[3].z,2);
  
  }

  above(point){
    return point.dot(this.normal) >= this.d;
  }

  /*
   * Checks if we are even within the x/z triangle in question
   * and returns appropriate y
   */
  over(point){
    //might actually work
    var tmp2Vec = new THREE.Vector2(point.x-this.center.x, point.z-this.center.z); //put point relative to center

    var p_down = tmp2Vec.dot(this.down_ramp);//component down
    if(Math.pow(p_down,2) > this.len_down)
      return false;

    var p_side = tmp2Vec.dot(this.side_ramp);//component down
    if(Math.pow(p_side,2) > this.len_across)
      return false;

    var y = this.center.y + p_down * this.down_ramp.y;//need actual 3d y component for accuracy
    console.log(y);
    return y;

  }

  render(){
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
  }

  yAt(pos){
    
  }

};



var ceiling = class {
  
  constructor(points) {
    this.points = points;

    //the following for generalized triangles
    if(points.length != 3)
      return;

    var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();

    tmp1.subVectors(points[0], points[1])
    tmp2.subVectors(points[0], points[2])
    tmp3.crossVectors(tmp2, tmp1)
    tmp3.normalize()

    //normal is down not up
    if(tmp3.y > 0) tmp3.multiplyScalar(-1.0)

    this.normal = tmp3, this.d = points[0].dot(tmp3)
  }

  sign (p1,p2,p3)
  {
    return ((p1.x - p3.x) * (p2.z - p3.z)) - ((p2.x - p3.x) * (p1.z - p3.z));
  }

  //true if below
  below(point){
    return point.dot(this.normal) > this.d;
  }

  /*
   * Checks if we are even within the x/z triangle in question
   */
  over(point){
    var pt = {x : point.x, z: point.z},
        b1 = this.sign(point, this.points[0], this.points[1]) < 0,
        b2 = this.sign(point, this.points[1], this.points[2]) < 0,
        b3 = this.sign(point, this.points[2], this.points[0]) < 0;
    return ((b1 == b2) && (b2 == b3));
  }

  render(){
    var geometry = new THREE.Geometry();

    geometry.vertices.push( this.points[0]);
    geometry.vertices.push( this.points[1]);
    geometry.vertices.push( this.points[2]);

    //reverse order than floor so we can use same verticies
    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  }

  yAt(pos){
    return this.points[0].y;
  }

};


var triangleBd = class {
  
};

var cEntity = class {

  constructor(pos) {
    this.thickness = new THREE.Vector3(45,45,45);
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
  }

  act(){
    this.move();
  }
  
  aim(event){
    var angleX = mouseSensitivity * (centX - event.clientX) / winWidth;
    var angleY = mouseSensitivity * (event.clientY - centY) / winHeight;

    pointed.applyAxisAngle (up,angleX);
    left.x = pointed.z;
    left.z = (-1) * pointed.x;
    left.normalize();
    pointed.applyAxisAngle (left,angleY);
    tmpVec.addVectors(camera.position, pointed);
    camera.lookAt(tmpVec);
    lastMouse = [event.clientX, event.clientY];
  }

  move(){
    if(!Controller)
      return

    var s = this.stepFoot * this.speed;
    var diagS = s / Math.sqrt(2);
    this.position.y = isNaN(this.position.y) ? 0: this.position.y;
    var new_y = this.position.y;

    if(Controller.keyIsDown[32] && this.grounded){
      var d = new Date();
      console.log('jumping')
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
        var y = ramps[r].over(this.position);
        if(y > new_y){
          //switch to this new ramp as the ground
          new_y = y;
        }

      }

      if(!this.ground.over(this.position)){
        console.log('falling')
        
        this.grounded = false;
        for(var g in ground){
          if(ground[g].over(this.position)){
            //changing platforms
            if((this.position.y - ground[g].points[0].y) < 3){
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
            var a = ceil[c].below(this.position);
            var b = ceil[c].below(new_pos);

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
    


    //only if move() is called
    if(Controller.keyIsDown[89]){ //y
      if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      }
    
    //if grounded look at the platform we are over in the future and calculate the y value
    tmpVec.y = new_y;
    tmpVec.copy(this.detectCol(tmpPos,tmpVec));


    this.position.copy(tmpVec);
  }

  detectCol(present,future){
    if (present.equals(future))
      return present

    //must detect ground clipping here
    //only or all in ground if on HORIZON
    //if(!ground[0].above(this.position) || !ground[1].above(this.position)) console.log('underground')

    var wxMax,wxMin,wzMax,wzMin,tiles = [],t = 2*sqThick,a,b

    wxMax = Math.max(present.x,future.x)
    wxMin = Math.min(present.x,future.x)
    wzMax = Math.max(present.z,future.z)
    wzMin = Math.min(present.z,future.z)
    wxMax = (wxMax - wxMax % t) + t
    wxMin = (wxMin - wxMin % t) - t
    wzMax = (wzMax - wzMax % t) + t
    wzMin = (wzMin - wzMin % t) - t

    for(var j=wxMin;j<=wxMax;j+=t)
      for(var k = wzMin;k<wzMax;k+=t)
        tiles.push(boundaries[j/t + 11][k/t + 11]);
        //maybe just examine here instead of loop again

    for(t in tiles){
      for(var i in tiles[t]){
        if( tiles[t][i].collides(present, future)){
          //later will want to subtract the 'bad' part of the vector so that the 
          //user may 'slide' along the wall
          return present;
        }
      }
    }
    //lol check for the ground too


    return future
   }

};