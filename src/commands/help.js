cli.command('help', 'Display this list', commandObject => {
	cli.log('execute command help');
	cli.print('Command line interface for sites.');
	cli.print('Version: ' + cli.version);
	cli.print('');
	cli.print('List of available commands:');

	Object.keys(cli.workers.commands)
		.sort()
		.forEach(command => {
			var descr = cli.workers.commands[command].description;
			cli.print(['\t', command, descr ? '- ' + descr : ''].join(' '));
		});
});