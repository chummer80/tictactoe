angular.module('tictactoe', ['firebase']);

function debug(msg) {
	console.log(msg);
}

function playClick() {
	document.getElementById('click_sound').play();
}

function getRandomName() {
	var nameList = [
		"Attila the Hun",
		"Hannibal Lecter",
		"Santa Claus",
		"Justin Bieber",
		"Miley Cyrus",
		"Kanye",
		"Homer Simpson",
		"Mister Rogers",
		"Hodor",
		"Guybrush Threepwood",
		"Queen Elizabeth II",
		"Kim Kardashian",
		"Oprah",
		"Gandhi",
		"Cleopatra"
	];

	var randomIndex = Math.floor(Math.random() * nameList.length);
	
	return nameList[randomIndex];
}

angular.element(document).ready(function () {
	var loadingImg = document.getElementById('loading-img');
	angular.element(loadingImg).addClass('animated fadeOut');

	setTimeout(function() {
		angular.element(loadingImg).css("display", "none");	
	}, 500);
});