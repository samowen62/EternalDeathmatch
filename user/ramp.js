
//ramp.js

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

    return this.center.y + p_down * this.down_ramp.y;
  },

  /*
   *  I'm just skipping this since it doesn't matter
   */
  rayDetect: function () {
    return null;
  }

};
