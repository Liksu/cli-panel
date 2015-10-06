angular.module('cli').run(function($cli) {
	$cli.command('help', 'Display this list of available commands', function(commandObject) {
		console.log('in help', commandObject);
	});
	//console.log( 'help', angular.mode('cli')._invokeQueue );
});