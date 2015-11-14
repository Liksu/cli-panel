cli.command('help ng', 'Display list of available angular components', commandObject => {
	cli.print('List of available angular components:');

	['services', 'directives', 'controllers'].forEach(part => {
		cli.print('\t' + part + ': ' + Object.keys(cli.ng[part]).join(', '));
	});
});