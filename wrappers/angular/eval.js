try { cli.workers.post[1000].shift() } catch(e) {}  // remove original eval

cli.postprocessor('eval', 'Run js code with angular objects', commandObject => {
	var input = commandObject.input;
	if (!input) return commandObject;

	try {
		['services', 'directives', 'controllers'].forEach(part => {
			Object.keys(cli.ng[part]).forEach(key => {
				var re = new RegExp('(^|[^\\w.])' + key.replace(/(\W)/g, '\\$1'), 'g');
				input = input.replace(re, `$1this.${part}.${key}`);
			});
		});

		var result = commandObject.result = new Function('return ' + input).call(cli.ng);
		cli.print(typeof result !== 'object' ? result : JSON.stringify(result));
		commandObject.input = '';
	} catch(e) {
		cli.print(e.name + ': ' + e.message);
	}

	return commandObject;
}, 1000);