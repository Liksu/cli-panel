angular.module('cli').run(function($cli) {
	function calc(string) {
		return eval(string);
	}

	$cli.postprocessor('calc', 'Calculate input', function(commandObject) {
		if (!commandObject.input) return commandObject;

		$cli.print(calc(commandObject.input));

		return commandObject
	});
});