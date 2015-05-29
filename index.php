<?php
	$title = 'Battleship';
	
	include(__DIR__ . '/../mall/header.php');
?>
<div id='flash'>
	<h1>Battleship</h1>
	<form>
		<div style="overflow: hidden;">
			<div style="float: left; margin-right: 50px;">
				<p>
					<label for="connect_url">Connect:</label><br>
					<input id='connect_url'><br>
					<input id='connect' type='button' value='Connect'>
					<input id='close' type='button' value='Close connection'>
				</p>
				<p>
					<label for="coordinate">Coordinate:</label><br>
					<select id="coordinate">
					</select><br>
					<input id='fire' type='button' value='Fire'>
				</p>
				<p>
					<label>Send message:</label><br>
					<input id='message'>
					<input id='send_message' type='button' value='Send message'>
				</p>
			</div>
			<div style="float: right; ">
				<div style="overflow: hidden;">
					<div style="float: left; margin-right: 10px;">
						<p style="width: 200px;">
							<label for="gamePlan">Your game plan</label><br>
							<div id='gamePlan'></div>
						</p>
					</div>
					<div style="float: left;">
						<p style="width: 200px;">
							<label for="gamePlanOpponent">Opponents game plan</label><br>
							<div id='gamePlanOpponent'></div>
						</p>
					</div>
				</div>
			</div>
		</div>
		<p>
			<label>Messages:</label><br>
			<div class='output' id='output'></div>
		</p>
	</form>
</div>
<?php
	$path=__DIR__;
	
	include(__DIR__ . '/../mall/footer.php');
?>