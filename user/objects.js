var collisionWall = class {

  /*
  	looking at normal this is upper left and lower right
  	make sure upperLeft has higher y coord
  */
  constructor(upperLeft, lowerRight) {
  	var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();

    tmp1.addVectors(upperLeft, lowerRight).multiplyScalar(0.5)
    this.center = tmp1

    tmp2.subVectors(upperLeft, lowerRight)
    lowerRight.y = upperLeft.y
    tmp3.subVectors(upperLeft, lowerRight)
    tmp3.crossVectors(tmp2, tmp3)
    tmp3.normalize()

    this.normal = tmp3
    this.next = null,this.prev = null
    console.log(this)
  }

  addNext(next) {
  	this.next = next
  }

  addNext(prev) {
  	this.prev = prev
  }

  /*
	returns positive values if 'inside' (side normal points to),
	negative values if on the outside, and 0 if point is inline
	with this boundary wall
  */
  whichSide(point){
  	point.subVectors(point,this.center)
  	return point.dot(this.normal);// > 0 ? 'inside' : 'outside';
  }

  //statics take 2 objs as input
  static distance(a, b) {
    return 0
   }
};