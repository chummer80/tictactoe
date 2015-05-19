angular.module('tictactoe', ['firebase']);

var clickAudio = document.getElementById('click_sound');

function debug(msg) {
	console.log(msg);
}

function playClick() {
	clickAudio.play();
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