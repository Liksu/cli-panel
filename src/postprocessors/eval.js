cli.postprocessor('eval', 'Run js code', commandObject => {
	var input = commandObject.input;
	if (!input) return commandObject;

	try {
		var result = commandObject.result = new Function('return ' + input)();
		cli.print(typeof result !== 'object' ? result : cli.stringify(result));
		commandObject.input = '';
	} catch(e) {
		cli.print(e.name + ': ' + e.message);
	}

	return commandObject;
}, 1000);