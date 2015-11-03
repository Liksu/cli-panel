cli.registerKey(13, 'Enter', (event, isInCommandLine) => {
	if (!isInCommandLine) return;

	cli.print(cli.cache.prompt.outerHTML + cli.cache.commandInput.value);
	cli.run(cli.cache.commandInput.value);

	cli.cache.buffer.scrollTop = cli.cache.buffer.scrollHeight;
	cli.cache.commandInput.value = '';
});