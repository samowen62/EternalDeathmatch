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

    tmp2.subVectors(upperLeft, lowerRight)
    this.halfHeight = upperLeft.y - lowerRight.y
    lowerRight.y = upperLeft.y
    tmp3.subVectors(upperLeft, lowerRight)
    tmp3.crossVectors(tmp2, tmp3)
    tmp3.normalize()

    this.normal = tmp3
    this.next = null,this.prev = null
    

    lowerRight.y = ly
    this.verts = {ul : upperLeft, lr : lowerRight}
    this.verts.ll = new THREE.Vector3(upperLeft.x, ly, upperLeft.z)
    this.verts.ur = new THREE.Vector3(lowerRight.x, upperLeft.y, lowerRight.z)
  }

  render(){
    var geometry = new THREE.Geometry();

    geometry.vertices.push( new THREE.Vector3( this.verts.ul.x,  this.verts.ul.y, this.verts.ul.z ) );
    geometry.vertices.push( new THREE.Vector3( this.verts.ur.x,  this.verts.ur.y, this.verts.ur.z ) );
    geometry.vertices.push( new THREE.Vector3( this.verts.lr.x,  this.verts.lr.y, this.verts.lr.z ) );
    geometry.vertices.push( new THREE.Vector3( this.verts.ll.x,  this.verts.ll.y, this.verts.ll.z ) );

    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) ); // counter-clockwise winding order
    geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    return geometry;
  }

  addNext(next) {
  	this.next = next
  }

  addNext(prev) {
  	this.prev = prev
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
      if(point.y > this.center.y + this.halfHeight || point.y < this.center.y - this.halfHeight ){
        return 0;
      }
    return calcVec.dot(this.normal);// > 0 ? 'inside' : 'outside';
  }

  //statics take 2 objs as input
  static distance(a, b) {
    return 0
   }
};

//might not work on js?
var platform = class {
  //need plane normal and d s.t. the plane is {x : n * x = d}
  //specify verticies of three pts
  //variable on player whether grounded or not for physics

  /*
   * constructor takes array of 3 Vector3's
   */
  constructor(points) {
    if(points.length != 3)
      return;

    this.points = points;
//    this.points = [new THREE.Vector2(points[0].x, points[0].z),new THREE.Vector2(points[1].x, points[1].z),new THREE.Vector2(points[2].x, points[2].z)]
    //for barycentric coordinates
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

  //maybe just calculate barycentric coords
  sign (p1,p2,p3)
  {
    return (p1.x - p3.x) * (p2.z - p3.z) - (p2.x - p3.x) * (p1.z - p3.z);
  }

  //not really above, but tells which side of the plane it's on, 
  //maybe subtract a little from d and see if the point is above the this.HIGHEST_Y_COORD
  //might want to call below to make more clear?
  //
  //WONT WORK FOR SLANTED HILL PLATFORMS SINCE THE PLANE TAKES UP THE ENTIRE ENVIREONMENT
  //SO ONLY LOOK AT IT IF THE USER IS OVER IT
  above(point){
    return point.dot(this.normal) > this.d;
  }

  /*
   * Checks if we are even within the x/z triangle in question
   */
  over(point){
    var pt = new THREE.Vector2(point.x, point.z),
        b1 = this.sign(pt, this.points[0], this.points[1]) < 0,
        b2 = this.sign(pt, this.points[1], this.points[2]) < 0,
        b3 = this.sign(pt, this.points[2], this.points[0]) < 0;

    return ((b1 == b2) && (b2 == b3));
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
    return this.baryCoords(pos);
  }

};

var cEntity = class {

  constructor(pos) {
    this.thickness = new THREE.Vector3(45,45,45);
    this.position = pos;

    this.stepFoot = BASE_STEP_FOOT;
    this.speed = BASE_SPEED;

    //could insert in mid-air?
    this.grounded = true;

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
    
    tmpVec.y = 0;
    //console.log(camera.position, tmpVec);
    var s = this.stepFoot * this.speed;
    var diagS = s / Math.sqrt(2);
    

    if(Controller.keyIsDown[32] && this.grounded){
      console.log('jumping')
      var d = new Date();
      this.grounded = false;
      //this.air_v = 60;
      this.air_v = 100;
      this.start_t = d.getTime();
      this.air_o = this.position.y;
      s *= 0.4;
    }

    //check for landing and clunking head by looping through platforms
    if(!this.grounded){
      var d = new Date();
      var dt = (d.getTime() - this.start_t) / 100;       
      var new_y = -5 * (dt*dt) + this.air_v*dt + this.air_o


      //need to add character y thickness
      // or not?
      var new_pos = new THREE.Vector3(this.position.x, new_y, this.position.z);
      for(var g in ground){
        if(ground[g].over(this.position)){
          var a = ground[g].above(this.position), b = ground[g].above(new_pos);
          if((!a && b)||(a && !b)){
            this.grounded = true;
            break;
          }
        }
      }

      if(!this.grounded)
        this.position.y = new_y;
    }


    tmpVec.copy(this.position);
    tmpPos.copy(this.position);
    var tY = this.position.y;


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
    tmpVec.y = tY;
    tmpVec.copy(this.detectCol(tmpPos,tmpVec));

    if(this.grounded){
      for(var g in ground){
        if(ground[g].over(this.position)){
          tmpVec.y = ground[g].yAt(this.position);// + this.thickness.y; //for some reason crashes?
          break;
        }
      }
    }

    tmpVec.y = tmpVec.y + this.thickness.y;
    //console.log(tmpVec)
    //special camera effects could go here
    
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
        tiles.push(boundaries[j/t + 11][k/t + 11])

    for(t in tiles){
      for(var i in tiles[t]){
        a = tiles[t][i].whichSide(present) > 0
        b = tiles[t][i].whichSide(future) > 0
        if((!a && b)||(a&& !b)){
          //detected
          //later will want to subtract the 'bad' part of the vector so that the 
          //user may 'slide' along the wall
          return present
        }
      }
    }
    //lol check for the ground too


    return future
   }

};