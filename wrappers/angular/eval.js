try { cli.workers.post[1000].shift() } catch(e) {}  // remove original eval

cli.postprocessor('eval', 'Run js code with angular objects', commandObject => {
	var input = commandObject.input;
	if (!input) return commandObject;

	try {
		// prepare input string
		var apply = {};
		['services', 'directives', 'controllers'].forEach(part => {
			var ifDirective = '';
			if (part === 'directives') ifDirective = '(\\[\\d+\\])?';

			Object.keys(cli.ng[part]).forEach(key => {
				var re = new RegExp('(^|[^\\w.])' + key.replace(/(\W)/g, '\\$1') + ifDirective, 'g');
				var to = `this.${part}.${key}`;

				input = input.replace(re, function(match, prefix, number) {
					if (typeof number !== 'string') number = '';
					if (part !== 'services') apply[to + number] = true;
					return prefix + to + number
				});
			});
		});

		// run command
		var result = commandObject.result = new Function('return ' + input).call(cli.ng);
		// $apply
		new Function(Object.keys(apply).map(key => `if (${key}.$apply) {${key}.$apply()}`).join(';')).call(cli.ng);

		cli.print(typeof result !== 'object' ? result : cli.stringify(result));
		commandObject.input = '';
	} catch(e) {
		cli.print(e.name + ': ' + e.message);
	}

	return commandObject;
}, 1000);