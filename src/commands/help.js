angular.module('cli').controller('help', function($cli) {
	console.log( angular.mode('cli')._invokeQueue );
});