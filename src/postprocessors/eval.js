cli.postprocessor('eval', 'Run js code', commandObject => {
	var input = commandObject.input;
	if (!input) return commandObject;

	try {
		commandObject.result = eval(input);
		cli.print(commandObject.result);
		commandObject.input = '';
	} catch(e) {}

	return commandObject;
}, 1000);