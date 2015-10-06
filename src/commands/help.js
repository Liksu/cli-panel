angular.module('cli').run(function($cli) {
	$cli.command('help', 'Display this list', function(commandObject) {
		$cli.print('List of available commands:');
		Object.keys($cli.workers.commands)
			.sort()
			.forEach(function(command) {
				var descr = $cli.workers.commands[command].description;
				$cli.print(['\t', command, descr ? '- ' + descr : ''].join(' '));
			});

		console.log('in help', commandObject);
	});
	//console.log( 'help', angular.mode('cli')._invokeQueue );
});