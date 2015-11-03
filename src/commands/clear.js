cli.command('clear', 'Clear screen', function(commandObject) {
	cli.log('execute command clear');
	cli.cache.buffer.innerHTML = '';
});