# WebGL NetGame
This is an example fps game written using the three.js library built on top of WebGL. Standard WASD and mouse controls for movement. Space to jump.

Gulp precompiles the assets and running <pre>node index.js</pre> on the root runs the server.

![screenshot](https://github.com/samowen62/webGLnetGame/blob/master/images/game.png)

##TODO
* Handle players who've left by broadcasting the disconnect serverside
* Add more non-collideable scenery to the map.
* More sounds on special events.
* Fix multiple sound issue (maybe just use howler).
* Fix reticule and tweak weapon range.
* The corner clipping issue is still persisting

#BIG TODO
* Migrate all the code to the server side except button pushes to avoid hacking