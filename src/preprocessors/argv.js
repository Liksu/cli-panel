angular.module('cli').run(function($cli) {
	$cli.preprocessor('argv', 'Split command line to arguments', function(commandObject) {
		if (!commandObject.input) return commandObject;

		var word = commandObject.input.match(/^\w+/);
		if (Object.keys($cli.workers.commands).indexOf(word && word[0]) !== -1) {
			commandObject.command = word[0];
			commandObject.input = commandObject.input.replace(word[0], '');
		}

		console.log('argv', commandObject.command);

		return commandObject
	});
});