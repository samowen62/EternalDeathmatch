
//platform.js

//points should be specified in clockwise directions
var platform = function(points) {
  this.points = points;

  //the following for generalized triangles
  if(points.length != 3)
    return;

  var tmp1 = new THREE.Vector3(),tmp2 = new THREE.Vector3(),tmp3 = new THREE.Vector3();

  tmp1.subVectors(points[0], points[1])
  tmp2.subVectors(points[0], points[2])
  tmp3.crossVectors(tmp2, tmp1)
  tmp3.normalize()

  var mid = new THREE.Vector3();
  mid.addVectors(points[0], points[1])
  mid.add(points[2])
  mid.divideScalar(3)

  //the purpose is to extend the edges slightly so that there is no passing between cracks
  this.awningEdges = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  this.awningEdges[0].subVectors(points[0], mid).normalize().multiplyScalar(3);
  this.awningEdges[1].subVectors(points[1], mid).normalize().multiplyScalar(3);
  this.awningEdges[2].subVectors(points[2], mid).normalize().multiplyScalar(3);
  this.awningEdges[0].add(points[0]);
  this.awningEdges[1].add(points[1]);
  this.awningEdges[2].add(points[2]);

  if(tmp3.y < 0) tmp3.multiplyScalar(-1.0);

    this.normal = tmp3, this.d = points[0].dot(tmp3);
}

platform.prototype = {

  constructor: platform,

  sign: function (p1,p2,p3)
  {
    return ((p1.x - p3.x) * (p2.z - p3.z)) - ((p2.x - p3.x) * (p1.z - p3.z));
  },

  //false if underneath
  above: function (point){
    return point.dot(this.normal) >= this.d;
  },

  /*
   * Checks if we are even within the x/z triangle in question
   */
   over: function (point){
    var pt = {x : point.x, z: point.z},
    b1 = this.sign(point, this.awningEdges[0], this.awningEdges[1]) < 0,
    b2 = this.sign(point, this.awningEdges[1], this.awningEdges[2]) < 0,
    b3 = this.sign(point, this.awningEdges[2], this.awningEdges[0]) < 0;

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