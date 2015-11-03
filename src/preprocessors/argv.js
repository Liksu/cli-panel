function parse(str) {
	var argv = {_: []};

	if (!str) return argv;

	// -- tail
	var tail = str.match(/^(.*?)\s+\-\-\s+(.*)$/);
	if (tail) {
		str = tail[1];
		tail = tail[2];
	}

	if (!str) {
		argv._ = [tail];
		return argv;
	}

	// extract strings
	var splitted = str.split('');
	var parts = [], quote = false, string = false, buffer = [];

	for (var i = 0; i <= splitted.length; i++) {
		if (splitted[i] === '\\') { quote = true; continue }
		else if (quote) { quote = false; continue }

		if (splitted[i] === '"' || splitted[i] === "'") {
			if (!string) {
				parts.push(buffer.join('').trim());
				buffer = [];
				string = {char: splitted[i], position: i, text: []};
				continue;
			}
			else if (string.char === splitted[i]) {
				string.text = string.text.join('');
				parts.push(string);
				string = false;
				continue;
			}
		}

		if (string) string.text.push(splitted[i]);
		else buffer.push(splitted[i]);
	}
	parts.push(buffer.join('').trim());

	// process params
	parts = parts.map(item => {
		if (typeof item === 'string') return item.split(/\s+|=/);
		return item;
	});
	parts = [].concat.apply([], parts);

	parts = parts.map(item => {
		if (/^\-([^-]+)$/.test(item)) return {flags: RegExp.$1.split('')};
		if (/^\-\-(.+)$/.test(item)) {
			var param = RegExp.$1;
			// to camel case
			param = param.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
			param = param.charAt(0).toLowerCase() + param.slice(1);

			return {param: param};
		}
		return item;
	});
	parts = parts.map(item => item.text || item);

	// process result object
	parts.push(tail);

	while (parts.length) {
		let item = parts.shift();
		if (!item) continue;

		if (typeof item !== 'object') argv._.push(item);
		else {
			var param = item.param;
			if (item.flags) {
				param = item.flags.pop();
				while (item.flags.length) argv[item.flags.shift()] = true;
			}

			if (typeof parts[0] === 'string') {
				argv[param] = parts.shift();
				// restore types
				if (!isNaN(parseFloat(argv[param])) && isFinite(argv[param])) argv[param] = +argv[param];
				let types = {'true': true, 'false': false, 'null': null, 'undefined': undefined};
				if (types.hasOwnProperty(argv[param])) argv[param] = types[argv[param]];
			}
			else argv[param] = true;
		}
	}

	// done
	return argv;
}

cli.preprocessor('argv', 'Split command line to arguments', commandObject => {
	if (!commandObject.input) return commandObject;

	commandObject.command = null;

	var commands = Object.keys(cli.workers.commands).sort((a, b) => b.length - a.length);
	commands.some(cmd => {
		if (commandObject.input.indexOf(cmd) === 0) {
			commandObject.command = cmd;
			commandObject.input = commandObject.input.replace(cmd, '').trim();
		}
		return commandObject.command;
	});

	if (commandObject.command) {
		commandObject.argv = parse(commandObject.input);
		commandObject.input = '';
	}

	console.log(commandObject);
	return commandObject;
});