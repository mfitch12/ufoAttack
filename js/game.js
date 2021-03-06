
var projectileArray = [];
var ufo1Array = [];
var aliensKilled = 0;
var incomingInterval = 5000;

function initialize(lat, lon) {
	var mapOptions = {
		center: { lat: lat, lng: lon},
		zoom: 18,
		disableDefaultUI: true,
		mapTypeId: google.maps.MapTypeId.SATELLITE
	};
	var map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);
}

$(document).ready(function(){
	var location;
	$('#addressButton').click(function(){
		var address = $('#addressInput').prop('value');
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': address}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK){
				location = results[0].geometry.location;
				var lat = location['A'];
				var lon = location['F'];
				initialize(lat, lon);
				$('.addressSearch').hide();
				$('.footer').hide();
				$('#map-canvas').show();
				$('#gameBoard').show();
				$('#scoreBox').show();
				$('#instructions').show();
			}
			else{
				alert("Unable to find location: " + status);
			}
		});
	});
	$('.preselectedLocation').click(function(){
		var address = $(this).attr('data-loc');
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': address}, function(results, status){
			if(status == google.maps.GeocoderStatus.OK){
				location = results[0].geometry.location;
				var lat = location['A'];
				var lon = location['F'];
				initialize(lat, lon);
				$('.addressSearch').hide();
				$('.footer').hide();
				$('#map-canvas').show();
				$('#gameBoard').show();
				$('#scoreBox').show();
				$('#instructions').show();
			}
			else{
				alert("Geocode was not successful for the following reason: " + status);
			}
		});
	});
	
});

var Ufo1 = function(jObject){
	this.speed = Math.floor(Math.random() * 5000) + 2000;
	this.top = 700;
	this.left = Math.floor(Math.random() * 1300) + -100;
	$('#gameBoard').append("<div class='ufo1' data-speed='"+this.speed+"'style='left: "+this.left+"px; top: "+this.top+"px;'></div>");
};


var start = false;
var down = false;

$('#addressInput').keypress(function(e){
	if(e.keyCode == 13){
		$('#addressButton').click();
	}
});

$('#playButton').mousedown(function(){
	$(this).hide();
	$('#gameOver').hide();
	start = true;
});

$('#resetButton').mousedown(function(){
	$(this).hide();
	$('#gameOver').hide();
	resetGame();
});

$('#newLocation').mousedown(function(){
	window.location.href = "index.html";
});

$('#gameBoard').mousemove(fireWeapon);
$('#gameBoard').mousedown(moveShipClick);


$(document).keydown(function(e){
	if(e.keyCode == 16){
		down = true;
		$('#gameBoard').css('cursor', 'crosshair');
	}
});
$(document).keyup(function(key) {
	if(key.keyCode == 16){
		down = false;
		$('#gameBoard').css('cursor', 'move');
	}
});

function resetGame(){
	$('#newLocation').hide();
	ufo1Array = [];
	start = false;
	$('.ufo1').remove();
	aliensKilled = 0;
	$('#aliensKilled')[0].innerHTML = aliensKilled;
	$('.userShip').css({left: '550px', top: '-100px', transform: 'rotate(0deg)'});
	$('#playButton').show();
}


function fireWeapon(evt){
	//check to see if game started
	if(start == true)
	{
		if(down == true){
			var parentOffset = $(this).offset();
			shipX = parseFloat($('.userShip').position()['left']) + 50;
			shipY = parseFloat($('.userShip').position()['top']) + 50;
			var mouseX = evt['pageX'] - parentOffset.left;
			var mouseY = evt['pageY'] - parentOffset.top;
			var angleDeg = Math.atan2(mouseY - shipY, mouseX - shipX) * 180 / Math.PI + 90;
			//angle ship towards mouse location
			$('.userShip').css('transform', 'rotate(' + angleDeg + 'deg)')
		}
	}
}

function moveShipClick(evt){
	if(start == true)
	{
		var parentOffset = $(this).offset();
		var shipX = parseFloat($('.userShip').position()['left']) + 50;
		var shipY = parseFloat($('.userShip').position()['top']) + 50;
		var mouseX = evt['pageX'] - parentOffset.left;
		var mouseY = evt['pageY'] - parentOffset.top;
		var angleDeg = Math.atan2(mouseY - shipY, mouseX - shipX) * 180 / Math.PI + 90;
		if(down == false){
			$('.userShip').stop();

			//angle ship towards mouse location
			$('.userShip').css('transform', 'rotate(' + angleDeg + 'deg)')

			//move ship to mouse location
			$('.userShip').animate({left: mouseX-50, top: mouseY-50});

			//move enemy ship to ship location
			$('.ufo1').each(function(i){
				var tempThis = this;
				var speed = parseFloat($(this).attr('data-speed'));
					$(tempThis).stop();
					$(tempThis).animate({left: mouseX-50, top: mouseY-50}, speed, 'linear');
			});	
		}
		else{
			$('.userShip').stop();
			var x1 = shipX;
			var y1 = shipY;
			var x2 = mouseX;
			var y2 = mouseY;
			var yChange = (y2-y1);
			var xChange = (x2-x1);
			var newX = xChange * 10 + x1;
			var newY = yChange * 10 + y1;
			$('#gameBoard').append("<div class='missile' style='left: "+shipX+"px; top: "+shipY+"px;'></div>");
			$('.missile').animate({left: newX, top: newY}, 4000, 'linear');
		}
	}
}


function attackShip(){
	if(start == true){
		var shipX = parseFloat($('.userShip').position()['left']);
		var shipY = parseFloat($('.userShip').position()['top']);
		$('.ufo1').each(function(i){
			var speed = parseFloat($(this).attr('data-speed'));
			$(this).stop();
			$(this).animate({left: shipX, top: shipY}, speed, 'linear');
		});
	}
}


(function collisionDetection(){
	setInterval(function(){
		if(start == true){
			$('.ufo1').each(function(){
				var shipX = parseFloat($('.userShip').position()['left']) + 50;
				var shipY = parseFloat($('.userShip').position()['top']) + 50;
				var ufo1X = parseFloat($(this).position()['left']) + 50;
				var ufo1Y = parseFloat($(this).position()['top']) + 50;
				if( (Math.abs(ufo1X - shipX) < 70) && (Math.abs(ufo1Y - shipY) < 70) ){
					$('.userShip').stop();
					$('.ufo1').stop();
					start = false;
					$('#gameOver').show();
					$('#resetButton').show();
					$('#newLocation').show();
				}

			});

		}
	}, 50);
})();

(function missileDetection(){
	setInterval(function(){
		if(start == true){
			$('.missile').each(function(){
				var missileX = parseFloat($(this).position()['left']) + 10;
				var missileY = parseFloat($(this).position()['top']) + 10;
				var tempThis = this;
				if(missileX>1200 || missileX < -20 || missileY>700 || missileY < -20){
					this.remove();
				}
				$('.ufo1').each(function(){
					if($(this).css('display') != 'none'){
						var ufoX = parseFloat($(this).position()['left']) + 50;
						var ufoY = parseFloat($(this).position()['top']) + 50;
						if( (Math.abs(ufoX - missileX) < 50) && (Math.abs(ufoY - missileY) < 50) ){
							$(tempThis).remove();
							$(this).remove();
							aliensKilled++;
							$('#aliensKilled')[0].innerHTML = aliensKilled;
						}
					}
				});
				
			});
		}
	}, 50);
})();


(function incomingUfo(){
	if(start == true){
		var rando = Math.floor(Math.random() * 5) + 1;
		var length = ufo1Array.length;

		for(var i = length; i < length + rando; i++){
			ufo1Array[ufo1Array.length] = new Ufo1;
		}
		attackShip();
		if(incomingInterval>1000){
			incomingInterval = incomingInterval - 200;
		}
		
	}
	setTimeout(incomingUfo, incomingInterval);
})();






















