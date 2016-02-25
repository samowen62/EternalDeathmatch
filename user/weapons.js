//weapons.js

var weapon = function(name, range, sprites, duration, effect){
  this.duration = duration;
  this.name = name;
  this.range = range;
  this.effect = effect;
  this.sprites = sprites;
}

weapon.prototype = {

  constructor: weapon,

  open: function(){
    this.sprites[0].style.display = "block";
  },

  close: function(){
    this.sprites[0].style.display = "none";
  },

  animate: function(){
    this.effect.play();

    var num_s = this.sprites.length;
    if(num_s == 1)
      return;

    //time for each frame
    var seg = this.duration / (num_s - 1);

    for( var s = 1; s <= num_s; s++){
      setTimeout(this.swapFrames, (s - 1) * seg, s, this.sprites, this.name);
    }

    this.sprites[this.sprites.length - 1].style.display = "none";
    this.sprites[0].style.display = "block";
  },

  swapFrames: function(frame, sprites, name){

    var first = (frame - 1) % sprites.length;
    frame = frame % sprites.length;
    
    sprites[first].style.display = "none";
    sprites[frame].style.display = character.weapon.name != name ? "none" : "block";
  
    if(character.weapon.name == name)
      current_sprite = sprites[frame];

  },
}