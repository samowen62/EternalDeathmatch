
//pentity.js

var pEntity = function(hash){
  this.id = hash;
  this.radius = PLAYER_HEIGHT;
  this.index = 0;
  this.sprites = [];
  this.alive = true;
  
  for(var s in sprite_list){
    var sprite = new THREE.Sprite( new THREE.SpriteMaterial({
      map: THREE.ImageUtils.loadTexture( sprite_list[s] ), 
      useScreenCoordinates: true 
    }));

    sprite.position.set( 0, this.radius + PLAYER_HEIGHT, 0 );
    sprite.scale.set( 64, 64, 1.0 ); // imageWidth, imageHeight
    sprite.visible = false;
    
    this.sprites.push(sprite);
    scene.add( sprite );
  }

  this.current_sprite = this.sprites[this.index];
  this.current_sprite.visible = true;
}

pEntity.prototype = {

  constructor: pEntity,

  position: function(pos, pnt){
    this.current_sprite.position.copy(pos);

    var c_pnt = new THREE.Vector2(character.pointed.x, character.pointed.z).normalize();
    var num = (c_pnt.x*pnt.x + c_pnt.y*pnt.y);
    num = num < 0 ? -num * num : num*num;

    var cos_2 = (c_pnt.x*c_pnt.x + c_pnt.y*c_pnt.y) * (pnt.x*pnt.x + pnt.y*pnt.y);
    cos_2 = num / cos_2;
    
    //gave offset here (pi/8)^2
    cos_2 = parseInt(2*(cos_2 + 1.1542126));

    var side = c_pnt.x*pnt.y - c_pnt.y*pnt.x < 0;

    if(!side)
      cos_2 = 7 - cos_2;

    this.setSprite(cos_2);    

  },

  setSprite: function(index){
    if(index != this.index){
      this.current_sprite.visible = false;
      this.sprites[index].position.copy(this.current_sprite.position);
    
      this.current_sprite = this.sprites[index];
      this.current_sprite.visible = true;
      
      this.index = index;
    }
  },

  rayDetect: function (start, pointer){
    var ray = new THREE.Vector3();
    ray.subVectors(start, this.current_sprite.position);

    var ray_comp = pointer.dot(ray);
    var discriminant = ray_comp * ray_comp - ray.dot(ray) + (this.radius * this.radius);

    if(discriminant > 0){
      var end = new THREE.Vector3(),
      scalar = -ray_comp - Math.sqrt(discriminant);
      end.copy(pointer);
      end.multiplyScalar(scalar);
      start.add(end);

      return ({cw : this, spot: start, len: scalar});
    }

    return null;
  },

  respawn: function(pos){
    this.alive = true;
    this.position.copy(pos);
  },

  kill: function(){
    console.log('he is dead');
    this.alive = false;
  }
  
}