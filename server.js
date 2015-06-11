var MAP_DEFAULT_COLUMNS = 9, MAP_DEFAULT_ROWS = 9;

var players = [], port = 8186, runningGame = false;

var http = require('http');
var httpServer = http.createServer(function(request, response) {
	console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(200, {'Content-type': 'text/plain'});
	response.end('Hello world\n');
}).listen(port, function() {
	console.log((new Date()) + ' HTTP server is listening on port ' + port);
});
var webSocketServer = require('websocket').server;
var wsServer = new webSocketServer({
	httpServer: httpServer,
	autoAcceptConnections: false
});
wsServer.on('request', function(request) {
	for(var i = 0; i < request.requestedProtocols.length; i++)
		if(request.requestedProtocols[i] === 'battleship-protocol')
			acceptConnection(request);
});

/**
	This class descripes a ship.
*/
function Battleship() {
	this.id = id;
	this.name = name;
}

/**
	This class describes a map.
*/
function Map(columns, rows) {
	this.columns = columns || MAP_DEFAULT_COLUMNS;
	this.map = [];
	this.rows = rows || MAP_DEFAULT_ROWS;
}

/**
	This class describes a player.
*/
function Player(connection) {
	this.connection = connection;
	this.map = new Map();
	this.opponentMap = new Map();
	this.shots = [];
}

/**
	This class describes a shot.
*/
function Shot(id, name) {
	this.id = id;
	this.name = name;
}

Map.prototype = {
	/**
		This function adds a ship to the game map.
	*/
	addShip: function(size) {
		var direction = random(1, 4);
		var position;
		
		do position = random(0, this.columns * this.rows - 1);
		while(!this.createShip(direction, position, size))
	},
	/**
		This function creates the game map.
	*/
	create: function() {
		for(var i = 0; i < this.columns * this.rows; i++)
			this.map.push(0);
	},
	/**
		This function creates a ship. If the ship cannot be created, false will be returned, else true.
	*/
	createShip: function(direction, position, size) {
		var positionArray = [];

		/*
			Following is a couple of mathematic ways to prevent the ships from being created outside the game map.
			It's also calculates to ships doesn't overlap eachother.
			The directions is 1 = west, 2 = north, 3 = east, 4 = south.
			The mathematic calculations is pretty easy, we have a start position for the ship, the size and in what direction the ship
			should be facing. With this data together with the game map, we can easily calculate if the ship is outside the game plan
			or overlap another existing ship.
		*/
		
		if(direction == 1) {
			for(var i = 0; i < size; i++)
				positionArray.push(position - i);
			
			var beginColumn = Math.floor(positionArray[0] / MAP_DEFAULT_COLUMNS);
			var endColumn = Math.floor(positionArray[positionArray.length - 1] / MAP_DEFAULT_COLUMNS);
			
			if(beginColumn != endColumn)
				return false;
		} else if(direction == 2) {
			for(var i = 0; i < size; i++)
				positionArray.push(position - i * MAP_DEFAULT_ROWS);
			
			if(positionArray[positionArray.length - 1] < 0)
				return false;
		} else if(direction == 3) {
			for(var i = 0; i < size; i++)
				positionArray.push(position + i);
			
			var beginColumn = Math.floor(positionArray[0] / MAP_DEFAULT_COLUMNS);
			var endColumn = Math.floor(positionArray[positionArray.length - 1] / MAP_DEFAULT_COLUMNS);
			
			if(beginColumn != endColumn)
				return false;
		} else {
			for(var i = 0; i < size; i++)
				positionArray.push(position + i * MAP_DEFAULT_ROWS);
			
			if(positionArray[positionArray.length - 1] > MAP_DEFAULT_ROWS * MAP_DEFAULT_COLUMNS - 1)
				return false;
		}
		
		for(var i = 0; i < positionArray.length; i++)
			if(this.map[positionArray[i]] != 0)
				return false;
		
		for(var i = 0; i < positionArray.length; i++)
			this.map[positionArray[i]] = 1;
		
		return true;
	}
}

Player.prototype = {
	/**
		Create a player.
	*/
	create: function() {
		this.map.create();
		// Create a ship with the size 3.
		this.map.addShip(3);
		this.map.addShip(2);
		
		this.opponentMap.create();
		
		this.generateShots();
	},
	/**
		Deletes the fired shot for available shots.
	*/
	deleteShot: function(shot) {
		for(var i = 0; i < this.shots.length; i++) {
			if(this.shots[i].id == shot) {
				this.shots.splice(i, 1);
				this.updateShots();
				
				break;
			}
		}
	},
	/**
		Describes what should happen when a shot is fired.
	*/
	fire: function(map, shot) {
		this.deleteShot(shot);
		
		var column = Math.floor(parseInt(shot) / this.map.columns),
		coordinate;
		
		for(var i = 0; i <= column; i++)
			coordinate = nextCharacter(coordinate);
			
		column = (parseInt(shot) + 1) - column * this.map.columns;
		
		sendMessage("Player" + (this.connection.id + 1) + " fired at: " + coordinate + column);
		
		var message;
		var newMapCharacter;
		
		// Update the map depending if it's a hit or not.
		if(map.map[shot] == 1) {
			message = "hit";
			newMapCharacter = "X";
		} else {
			message = "miss";
			newMapCharacter = "-";
		}
		
		this.opponentMap.map[shot] = newMapCharacter;
		map.map[shot] = newMapCharacter;
		
		sendMessage("It's a " + message + "!");
		
		var hasShipsLeft = false;
		
		for(var i = 0; i < map.map.length; i++)
			if(map.map[i] == 1) {
				hasShipsLeft = true;
				break;
			}
		
		// Game over?
		if(!hasShipsLeft) {
			sendMessage("Game over. Player" + (this.connection.id + 1) + " won the game!");
			
			runningGame = false;
		}
		
		updateMap()
	},
	/**
		Generates shots for the player.
	*/
	generateShots: function() {
		var character;
		
		for(var i = 0; i < this.map.columns; i++) {
			character = nextCharacter(character);
			
			for(var x = 0; x < this.map.rows; x++)
				this.shots.push(new Shot(i * this.map.columns + x, character + "" + (x + 1)));
		}
	},
	/**
		Update the available locations that you can fire at.
	*/
	updateShots: function() {
		this.connection.sendUTF("Shots:" + JSON.stringify(this.shots));
	}
}

/**
	Describes what will happen a player connects to the server.
*/
function acceptConnection(request) {
	var player = new Player(request.accept('battleship-protocol', request.origin));
	player.create();
	
	// Makes sure that a 3rd player can't join the game.
	if(players[0] == null || players[1] == null) {
		if(players[0] == null) {
			players[0] = player;
			
			player.connection.id = 0;
		} else {
			players[1] = player;
			
			player.connection.id = 1;
		}
		
		sendMessage("Player" + (player.connection.id + 1) + " has joined the game.");
		
		// TODO: Split up in more functions. This function is way to big!
		
		// Is the game ready to start?
		if(players[0] != null && players[1] != null) {
			updateMap();
			
			for(var i = 0; i < players.length; i++)
				players[i].updateShots();
			
			playersTurn = players[random(0, 1)];
			
			sendMessage("Player" + (playersTurn.connection.id + 1) + " is selected to begin the game.");
			
			runningGame = true;
		}
		
		// Bye bye player.
		player.connection.on('close', function(reasonCode, description) {
			var id = player.connection.id;
			
			players.splice(players.indexOf(player));
			
			sendMessage("Player" + (id + 1) + " disconnected.");
			
			// Let the other player know that the game is over.
			if(runningGame)
				sendMessage("Since the game already started, you won the game! If you want to play again, please disconnect and connect again.");
			
			players = [];
			
			runningGame = false;
		});
		player.connection.on('message', function(message) {
			// Is the player fire a shot or sending a message?
			if(message.utf8Data.indexOf("Fire:") != -1) {
				if(runningGame && playersTurn == player) {
					var id;
					
					if(player.connection.id == 1)
						id = 0;
					else
						id = 1;
				
					player.fire(players[id].map, message.utf8Data.replace("Fire:", ""));
					
					if(runningGame) {
						playersTurn = players[id];
						
						sendMessage("It's Player" + (playersTurn.connection.id + 1) + "'s turn.");
					}
				}
			} else
				sendMessage("Player" + (player.connection.id + 1) + "" + htmlEntities(message.utf8Data));
		});
	} else
		player.connection.sendUTF("There is already a game going on. Please wait until the game is finished and the players has disconnected.");
}

/**
	Escape the message.
*/
function htmlEntities(str) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
	Get the next character in the alphabet.
*/
function nextCharacter(character) {
	if(character == undefined)
		return "A";
	return String.fromCharCode(character.charCodeAt(0) + 1);
}

/**
	Create a random number.
*/
function random(min, max) {
	return Math.floor(Math.random() * (max + 1 - min) + min);
}

/**
	Send a message to all connected clients.
*/
function sendMessage(message) {
	for(var i = 0; i < players.length; i++)
		players[i].connection.sendUTF(message);
}

/**
	Update the map.
*/
function updateMap() {
	for(var i = 0; i < players.length; i++) {
		players[i].connection.sendUTF("GameArea:" + JSON.stringify(players[i].map.map));
		players[i].connection.sendUTF("GameAreaUsed:" + JSON.stringify(players[i].opponentMap.map));
	}
}