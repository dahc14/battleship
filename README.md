This is a version of Battleship that can be played by 2 players.

Battleship is a game where you have to figure out where your enemy have there battleships and sink them! The game is turn-based and is based on the classic boardgame Battleship.
So, whats the reason for develop this game? Well, I always liked this game and I couldn't find a game that you can download and play locally with a friend (LAN). This game is perfect for that if you don't have a internet connection but still want to play a fun game on your computer with a friend. It's also possible to play online if you preffer that.

To install it, simply clone the repository and go to the index.php page.

To be able to run the server, please use NodeJS to start server.js which is located at the same place as index.php.

To configure the game to be able to run it locally, you have to modify the port (if you don't want to use the default). This is done in server.js.
If you go to row 3, you can see the variable port. Change the value and you're good to go!
You can also modify the main.js to change the default value of the text-field for the both host and port. This is done by changing the value of the variable url on row 5.

Need a bigger game plan? Easy, just configure server.js again. On row 1 you have to variables for rows and cols. Nothing else is needed to expand the game. Great!

You should now be able to start the server and try to connect to it.

For game-rules, I suggest google Battleship rules.

Why should you play this game instead of others like http://www.mathplayground.com/battleship.html ?
Well, there is several adventages with the game I just liked too. That game is more developed, has more graphic and you can play against a computer.
What you can't do is to play it locally, that game requires a internet connection that many people lack.
Since this game is downloadable, you can play it locally. No more need for a intenret connection.
Another reason is that you can play it against a friend. What's the fun of playing against a computer you can't laugh in the face after the victory?
My game works both online and offline which is a huge adventage.

Another game is available at: http://en.battleship-game.org/
This game is more look alike like mine.
They have the adventage to be able to move your own ships. Which you can't in my game yet.
This game also let you play against a computer or a friend.
The only adventage I can find is that you can play offline with my game.

What's the plan for the future?
The first thing that could be added is graphic. That would lift up the user experience a lot.
Another thing is to be able to arrange your ship by yourself instead of having them arrange randomly.
Last thing I could think about is to be able to play it against a computer.

==================================

By Daniel Henrysson (dahc14@student.bth.se)

License
----------------------------------

This software is free software and carries a MIT license.

Todo
----------------------------------

History
----------------------------------

v1.0.0 (latest)

* Created

```
 .   
..:  Copyright 2015 by Daniel Henrysson (dahc14@student.bth.se)
```