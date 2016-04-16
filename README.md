# Eternal Deathmatch
This is an example fps game written using the three.js library built on top of WebGL. Standard WASD and mouse controls for movement. Space to jump.

Gulp precompiles the assets and running <pre>node index.js</pre> on the root runs the server.

![screenshot](https://github.com/samowen62/webGLnetGame/blob/master/images/game.png)

##TODO
* Handle players who've left by broadcasting the disconnect serverside.
* Adjust respawn to occur when player spawns initially as well.
* Add more non-collideable scenery to the map.
* Add more weapons with respawning power ups as well.
* Might want to refactor the cEntity.move() method. It's a little messy at parts
* Glitch when going up ramps with collision walls under them (with this we'll assume ramps do not end on collision walls)
* Better server and client logs

##Errors 
* TypeError: Cannot read property 'kills' of undefined
    at Socket.<anonymous> (/home/sam/Projects/webGLnetGame/index.js:168:49)
    at Socket.emit (events.js:107:17)


#BIG TODO
* Migrate all the code to the server side except button pushes to avoid hacking
* (alternative: change focus to single player game)

Visit at www.eternaldeathmatch.com. [Not completely finished yet]
