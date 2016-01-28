
//ceiling.js

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