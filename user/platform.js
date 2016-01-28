
//platform.js

//points should be specified in clockwise directions
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