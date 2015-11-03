cli.registerKey(192, '`', (event, isInCommandLine) => {
	cli.log('process key ` for show');

	if (event.target.nodeName === 'INPUT' && !isInCommandLine) return;
	if (isInCommandLine) event.preventDefault();

	cli.toggle();
});