cli.registerKey(192, '`', (event, isInCommandLine) => {
	if (!isInCommandLine) return;
	else event.preventDefault();

	cli.toggle();
});