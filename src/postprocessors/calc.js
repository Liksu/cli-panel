var priority = '** log * / - +'.split(' ');
var expression = {
	'+':   (a, b) => a + b,
	'-':   (a, b) => a - b,
	'*':   (a, b) => a * b,
	'/':   (a, b) => a / b,
	'**':  (a, b) => Math.pow(a, b),
	'log': (a, b) => Math.log(a) / Math.log(b)
};

var signs = {
	'++': '+ ',
	'--': '+ ',
	'+-': '- ',
	'-+': '- '
};

var digit = '([-+]?(?:\\d*\\.)?\\d+(?:e[+-]?\\d+)?)';
var spacer_re = /(\d)([+-])([\d.])/g;

// calc the contents of the brackets
function evaluate(str) {
	while (/[+-]{2}/.test(str)) str = str.replace(/([+-]{2})/, s => signs[s]);
	while (spacer_re.test(str)) str = str.replace(spacer_re, '$1 $2 $3');

	// normalize string
	str = str
		.split(new RegExp(digit))
		.map(part => part.trim())
		.filter(part => part !== '')
		.map(part => isNaN(+part) ? part : +part)
		.filter((part, i, arr) => {
			if (typeof part !== 'string') return true;
			if (priority.indexOf(part) === -1) throw new SyntaxError('invalid operator ' + part);
			return !(i === 0 || i === arr.length - 1);
		})
		.join(' ');

	// calc
	priority.forEach(sign => {
		var qsign = [''].concat(sign.split('')).join('\\');
		var re = new RegExp(`${digit} (${qsign}) ${digit}`);
		while (new RegExp(qsign).test(str)) str = str.replace(re, (match, a, sign, b) => expression[sign](+a, +b));
	});

	return +str;
}

function calc(input) {
	// calculate brackets
	while (/\(([^()]*)\)/.test(input)) input = input.replace(RegExp.lastMatch, evaluate(RegExp.$1));
	// remove brackets stuff
	input = input.replace(/[()]/g, '');
	// final calculate
	input = evaluate(input);
	return +input;
}

cli.postprocessor('calc', 'Simple calculator', commandObject => {
	cli.log('execute POST processor calc');
	var input = commandObject.input;

	if (!input) return commandObject;
	if (!/([/*+-]|log)/.test(input)) return commandObject;

	var ops = priority.map(op => [''].concat(op.split('')).join('\\')).concat(['\\s']).join('|');
	input = input
		.split(new RegExp(`(${ops})`))
		.map(el => priority.indexOf(el) === -1 && isNaN(+el) && typeof window[el] !== 'undefined' ? window[el] : el)
		.join('');

	try {
		commandObject.result = calc(input);
		cli.print(commandObject.result);
		commandObject.input = '';
	} catch(e) {
		var name = e.name
			.split(/([A-Z])/g)
			.filter(s => s)
			.map((s, i) => s.toLowerCase() + (i % 2 ? ' ' : ''))
			.join('')
			.trim();

		cli.print(`Calculator ${name}: ${e.message}`);
	}

	return commandObject;
});
