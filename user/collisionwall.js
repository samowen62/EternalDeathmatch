
//collisionwall js

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
  

  lowerRight.y = ly;
  var verts = {ul : upperLeft, lr : lowerRight};
  verts.ll = new THREE.Vector3(upperLeft.x, ly, upperLeft.z),
  verts.ur = new THREE.Vector3(lowerRight.x, upperLeft.y, lowerRight.z);

  if(verts.ul.x > verts.lr.x){
    this.max_x = verts.ul.x;
    this.min_x = verts.lr.x;
  }else{
    this.min_x = verts.ul.x;
    this.max_x = verts.lr.x;
  }

  if(verts.ul.z > verts.lr.z){
    this.max_z = verts.ul.z;
    this.min_z = verts.lr.z;
  }else{
    this.min_z = verts.ul.z;
    this.max_z = verts.lr.z;
  }

  this.line_verts = verts;

  var ul = new THREE.Vector3(tmp3.z,0,-tmp3.x);
  var lr = new THREE.Vector3(-tmp3.z,0,tmp3.x);

  this.normal_ul = ul;
  this.normal_lr = lr;

  ul.multiplyScalar(3);
  lr.multiplyScalar(3);

  this.verts = {};

  this.verts.ul = (new THREE.Vector3()).copy(verts.ul);
  this.verts.ll = (new THREE.Vector3()).copy(verts.ll);
  this.verts.ur = (new THREE.Vector3()).copy(verts.ur);
  this.verts.lr = (new THREE.Vector3()).copy(verts.lr);


  this.verts.ul.add(lr);
  this.verts.ll.add(lr);
  this.verts.ur.add(ul);
  this.verts.lr.add(ul);

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

    geometry.vertices.push( new THREE.Vector3( this.line_verts.ul.x,  this.line_verts.ul.y, this.line_verts.ul.z ) );
    geometry.vertices.push( new THREE.Vector3( this.line_verts.ll.x,  this.line_verts.ll.y, this.line_verts.ll.z ) );
    geometry.vertices.push( new THREE.Vector3( this.line_verts.lr.x,  this.line_verts.lr.y, this.line_verts.lr.z ) );
    geometry.vertices.push( new THREE.Vector3( this.line_verts.ur.x,  this.line_verts.ur.y, this.line_verts.ur.z ) );

    geometry.faces.push( new THREE.Face3( 0, 1, 2 ) ); // counter-clockwise winding order
    geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var lineMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 3,
    });
    var lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(this.line_verts.ul);
    lineGeo.vertices.push(this.line_verts.ur);
    lineGeo.vertices.push(this.line_verts.lr);
    lineGeo.vertices.push(this.line_verts.ll);
    lineGeo.vertices.push(this.line_verts.ul);


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