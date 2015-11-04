cli.postprocessor('calc', 'Simple calculator', commandObject => {
	cli.log('execute POST processor calc');
	var input = commandObject.input;

	if (!input) return commandObject;
	if (!/^[\s\d.e()/*+-]+$/.test(input)) return commandObject;

	try {
		commandObject.result = eval(input);
		cli.print(commandObject.result);
		commandObject.input = '';
	} catch(e) {}

	return commandObject;
});
