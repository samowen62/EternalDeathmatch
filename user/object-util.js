var Controller = {
  keyIsDown: [],

  add: function (key, down, up) {
    $(document).keydown(function(e) {
      if(e.keyCode === key && !Controller.keyIsDown[key]) {
        down();
        Controller.keyIsDown[key] = true;
        return false;
      }
    })

    $(document).keyup(function(e) {
      if(e.keyCode === key) {
        if(up) up();
        Controller.keyIsDown[key] = false;
        return false;
      };
    });
  }
}

var calcVec = new THREE.Vector3(),
calcVec2 = new THREE.Vector3(),
tmpPos = new THREE.Vector3();
