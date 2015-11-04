cli.postprocessor('calc', 'Simple calculator', commandObject => {
	cli.log('execute POST processor calc');
	var input = commandObject.input;

	if (!input) return commandObject;
	if (!/^[\s\d.e()/*+-]+$/.test(input)) return commandObject;

	try {
		commandObject.result = eval(input);
		console.log(input, eval(input), commandObject.result);
		cli.print(commandObject.result);
	} catch(e) {}

	return commandObject;
});
