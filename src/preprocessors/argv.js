cli.preprocessor('argv', 'Split command line to arguments', commandObject => {
	if (!commandObject.input) return commandObject;

	var word = commandObject.input.match(/^\w+/);
	if (Object.keys(cli.workers.commands).indexOf(word && word[0]) !== -1) {
		commandObject.command = word[0];
		commandObject.input = commandObject.input.replace(word[0], '');
		commandObject.argv._ = commandObject.input.replace(/^\s*/, '').replace(/\s*$/, '').split(/\s+/);
		commandObject.input = '';
	}

	return commandObject
});

//angular.module('cli').run(function($cli) {
//	$cli.preprocessor('argv', 'Split command line to arguments', function(commandObject) {
//		if (!commandObject.input) return commandObject;
//
//		var word = commandObject.input.match(/^\w+/);
//		if (Object.keys($cli.workers.commands).indexOf(word && word[0]) !== -1) {
//			commandObject.command = word[0];
//			commandObject.input = commandObject.input.replace(word[0], '');
//		}
//
//		return commandObject
//	});
//});