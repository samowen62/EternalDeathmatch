# WebGL NetGame
This is an example fps game written using the three.js library built on top of WebGL. Standard WASD and mouse controls for movement. Space to jump.

Gulp precompiles the assets and running <pre>node index.js</pre> on the root runs the server.

![screenshot](https://github.com/samowen62/webGLnetGame/blob/master/images/game.png)

##TODO
* Handle players who've left by broadcasting the disconnect serverside
* Add more non-collideable scenery to the map.
* Fix multiple sound issue (maybe just use howler).
* Fix reticule on images.
* Jumping into the ramp glitch (adjust ramp.over function for this)
* Falling through cracks in ground on jump (think it's fixed, testing)
* replace jQuery with regular js. We don't need it all.

#BIG TODO
* Migrate all the code to the server side except button pushes to avoid hacking