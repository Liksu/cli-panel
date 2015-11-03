cli.registerKey(9, 'Tab', (event, isInCommandLine) => {
	cli.log('process key Tab for autocomplete');

	if (!isInCommandLine) return;
	event.preventDefault();

	var line = cli.cache.commandInput.value;
	line = new RegExp('^' + line);

	var commands = Object.keys(cli.workers.commands)
		.sort((a, b) => a.length - b.length)
		.filter(cmd => line.test(cmd));

	if (!commands.length) return;
	else if (commands.length === 1) cli.cache.commandInput.value = commands[0] + ' ';
	else cli.print(commands.join('\t'));
});