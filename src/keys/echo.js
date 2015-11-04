cli.registerKey(0, 'Echo', (event, isInCommandLine) => {
	cli.log('echo pressed key', event.keyCode, event);
});