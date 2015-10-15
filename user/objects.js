var calcVec = new THREE.Vector3()
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
	 * with this boundary wall
   */
  whichSide(point){
  	calcVec.subVectors(point,this.center)
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
      return

    var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();

    tmp1.subVectors(points[0], points[1])
    tmp2.subVectors(points[0], points[2])
    tmp3.crossVectors(tmp2, tmp1)
    tmp3.normalize()

    if(tmp3.y < 0) tmp3.multiplyScalar(-1.0)

    this.normal = tmp3, this.d = points[0].dot(tmp3)
  }

  //not really above, but tells which side of the plane it's on, 
  //maybe subtract a little from d and see if the point is above the this.HIGHEST_Y_COORD
  //might want to call below to make more clear?
  above(point){
    return point.dot(this.normal) > this.d
  }

};