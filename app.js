console.log('app!');
angular
	.module('app', ['cli'])
	.controller('main', function($scope) {
		console.log('main run');
	});
console.log('app second!');
