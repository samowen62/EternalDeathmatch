# Eternal Deathmatch
This is an example fps game written using the three.js library built on top of WebGL. Standard WASD and mouse controls for movement. Space to jump.

Gulp precompiles the assets and running <pre>node index.js</pre> on the root runs the server.

![screenshot](https://github.com/samowen62/webGLnetGame/blob/master/images/game.png)

##TODO
* Handle players who've left by broadcasting the disconnect serverside
* Add more non-collideable scenery to the map.
* Fix reticule on images.
* replace jQuery with regular js. We don't need it all. (fixed)
* Might want to refactor the cEntity.move() method. It's a little messy at parts
* <span style="color:#bbb">Jumping into the ramp glitch</span> (fixed)
* <span style="color:#bbb">Falling through cracks in ground on jump</span> (fixed)
* <span style="color:#bbb">Fix multiple sound issue (maybe just use howler).</span> (fixed)
* TypeError: Cannot read property 'kills' of undefined
    at Socket.<anonymous> (/home/sam/Projects/webGLnetGame/index.js:168:49)
    at Socket.emit (events.js:107:17)



#BIG TODO
* Migrate all the code to the server side except button pushes to avoid hacking

Visit at www.eternaldeathmatch.com. Not completely finished yet.
