var lastCommand = '';
var historyScroll = 0;

function setCommand(command) {
	cli.cache.commandInput.value = command;
	cli.focus();
}

cli.registerKey(38, 'Up', (event, isInCommandLine) => {
	if (!isInCommandLine) return;
	if (historyScroll == cli.history.length) return;

	if (!historyScroll) lastCommand = cli.cache.commandInput.value;

	historyScroll++;
	if (historyScroll > cli.history.length) historyScroll = cli.history.length;

	setCommand(cli.history[cli.history.length - historyScroll]);
});

cli.registerKey(40, 'Down', (event, isInCommandLine) => {
	if (!isInCommandLine) return;
	if (!historyScroll) return;

	historyScroll--;
	var command = '';

	if (historyScroll <= 0) {
		historyScroll = 0;
		command = lastCommand;
	}
	else command = cli.history[cli.history.length - historyScroll];

	setCommand(command);
});

cli.registerKey(13, 'Enter', (event, isInCommandLine) => {
	lastCommand = '';
	historyScroll = 0;
});