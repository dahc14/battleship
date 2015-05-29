$(document).ready(function() {
	'use strict';

	var	output = $('#output'),
	url = 'ws://127.0.0.1:8186/',
	websocket = null;
	
	function outputLog(message) {
		$(output).append(new Date().toLocaleTimeString() + ' ' + message + '<br/>').scrollTop(output[0].scrollHeight);
	}
	
	function updateMap(map, mapId) {
		$("#" + mapId).html("");
		
		for(var i = 0; i < map.length; i++) {
			if(i != 0 && i % 9 == 0)
				$("#" + mapId).append("<br>");
			
			$("#" + mapId).append(map[i]);
		}
	}
	
	$('#close').on('click', function() {
		websocket.close();
	});
	
	$('#connect').on('click', function(event) {
		url = $('#connect_url').val();
		
		if(websocket) {
			websocket.close();
			websocket = null;
		}
		
		websocket = new WebSocket(url, 'battleship-protocol');
		websocket.onclose = function() {
			outputLog('Websocket closed.');
		}
		websocket.onmessage = function(event) {
			if(event.data.indexOf("GameArea:") != -1)
				updateMap($.parseJSON(event.data.replace("GameArea:", "")), "gamePlan");
			else if(event.data.indexOf("GameAreaUsed:") != -1)
				updateMap($.parseJSON(event.data.replace("GameAreaUsed:", "")), "gamePlanOpponent");
			else if(event.data.indexOf("Shots:") != -1) {
				$("#coordinate").empty();
				
				$.each($.parseJSON(event.data.replace("Shots:", "")), function(key, value) {   
					$('#coordinate').append($("<option></option>").attr("value", value.id).text(value.name)); 
				});
			} else
				outputLog(event.data);
		}
		websocket.onopen = function() {
			outputLog('Websocket opened.');
		}
	});
	
	$('#connect_url').val(url);
	
	$('#fire').on('click', function(event) {
		if(!websocket || websocket.readyState === 3)
			outputLog('The websocket is not connected to a server.');
		else
			websocket.send("Fire:" + $('#coordinate').val());
	});
	
	$('#send_message').on('click', function(event) {
		if(!websocket || websocket.readyState === 3)
			outputLog('The websocket is not connected to a server.');
		else
			websocket.send(": " + $('#message').val());
	});
});