cli.command('help', 'Display this list', commandObject => {
	cli.print('List of available commands:');

	Object.keys(cli.workers.commands)
		.sort()
		.forEach(command => {
			var descr = cli.workers.commands[command].description;
			cli.print(['\t', command, descr ? '- ' + descr : ''].join(' '));
		});
});