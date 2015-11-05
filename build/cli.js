/**
 * cli-panel - Command line interface for sites
 * @version v0.8.0
 * @link http://liksu.github.io/cli-panel/
 * @license MIT
 */
'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

window.cli = new function () {
	var _this2 = this;

	this.cache = {
		commandInput: null,
		buffer: null,
		panel: null,
		show: false,
		loading: false
	};
	this.history = [];
	this.settings = {
		prompt: '> ',
		tab: '    ',
		debug: 0
	};
	this.workers = {
		pre: [],
		commands: {},
		post: [],
		keys: {}
	};

	/* history */

	if (localStorage && localStorage.cliHistory) this.history = JSON.parse(localStorage.cliHistory);

	/* templates */

	this.templates = {};

	this.addHtml = (function (name, content, selector) {
		this.templates[name] = {
			html: content,
			selector: selector || 'body'
		};
	}).bind(this);

	this.init = (function (options) {
		var _this = this;

		if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
			Object.keys(options).forEach(function (key) {
				return _this.settings[key] = options[key];
			});
		}

		var templates = this.templates;
		var fragments = {};

		Object.keys(templates).forEach(function (name) {
			var selector = templates[name].selector;
			if (!fragments[selector]) {
				fragments[selector] = document.createElement('div');
				fragments[selector].innerHTML = '';
			}
			fragments[selector].innerHTML += templates[name].html;
		});

		Object.keys(fragments).forEach(function (selector) {
			document.querySelector(selector).appendChild(fragments[selector]);
		});

		this.cache.panel = document.querySelector('.cli .cli-panel');
		this.cache.line = this.cache.panel.querySelector('.cli-line');
		this.cache.commandInput = this.cache.panel.querySelector('.cli .cli-line .cli-command');
		this.cache.buffer = this.cache.panel.querySelector('.cli-buffer');
		this.cache.loader = this.cache.panel.querySelector('.cli-loader');
		this.cache.prompt = this.cache.panel.querySelector('.cli-prompt');
		this.setPrompt();

		this.toggle(this.cache.show);
	}).bind(this);

	document.addEventListener("DOMContentLoaded", this.init);

	/* keyboard */

	document.addEventListener('keydown', (function (e) {
		var isInCommandLine = e.target === this.cache.commandInput;

		if (this.workers.keys[e.keyCode]) this.workers.keys[e.keyCode].forEach(function (stored) {
			return stored.worker(e, isInCommandLine);
		});
		if (this.workers.keys[0]) this.workers.keys[0].forEach(function (stored) {
			return stored.worker(e, isInCommandLine);
		});
	}).bind(this));

	/* ui helpers */

	this.show = (function () {
		this.cache.panel.className += ' show';
		this.cache.show = true;
		this.focus();
	}).bind(this);

	this.hide = (function () {
		this.cache.panel.className = this.cache.panel.className.replace(/\s*show/g, '');
		this.cache.show = false;
	}).bind(this);

	this.toggle = (function (show) {
		if (show === undefined) show = !this.cache.show;
		show ? this.show() : this.hide();
	}).bind(this);

	this.mouseUp = (function () {
		var selectedText = "";
		if (window.getSelection) selectedText = window.getSelection().toString();else if (document.selection && document.selection.type != "Control") {
			selectedText = document.selection.createRange().text;
		}
		if (!selectedText) this.focus();
	}).bind(this);

	this.focus = (function () {
		var input = this.cache.commandInput;
		setTimeout(function () {
			var len = input.value.length;
			if (input.setSelectionRange) {
				input.setSelectionRange(len, len);
			} else if (typeof input.selectionStart == "number") {
				input.selectionStart = input.selectionEnd = len;
			} else if (typeof input.createTextRange != "undefined") {
				input.focus();
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd(len);
				range.moveStart(len);
				range.select();
			}
			input.focus();
		}, 0);
	}).bind(this);

	this.startLoading = function () {
		_this2.cache.loading = true;
		_this2.cache.loader.className = _this2.cache.loader.className.replace(/\s*hide_element\s*/, '');
		_this2.cache.line.className += ' hide_element';
		_this2.cache.commandInput.disabled = true;

		var propeller = [{ char: '|', duration: 100 }, { char: '/', duration: 80 }, { char: '-', duration: 100 }, { char: '\\', duration: 80 }].map(function (info, i, arr) {
			return (function () {
				var _this3 = this;

				this.cache.loader.innerHTML = info.char;
				setTimeout(function () {
					if (_this3.cache.loading) propeller[i === arr.length - 1 ? 0 : i + 1]();
				}, info.duration);
			}).bind(_this2);
		});

		propeller[0]();
	};

	this.stopLoading = function () {
		_this2.cache.loading = false;
		_this2.cache.loader.innerHTML = 'done';
		_this2.cache.loader.className += ' hide_element';
		_this2.cache.line.className = _this2.cache.line.className.replace(/\s*hide_element\s*/, '');
		_this2.cache.commandInput.disabled = false;
		_this2.focus();
	};

	/* stuff */

	this.log = function () {
		for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
			arg[_key] = arguments[_key];
		}

		if (cli.settings.debug) console.log.apply(console, arg);
	};

	/* API */

	this.setPrompt = (function (prompt, save) {
		if (prompt === undefined) prompt = this.settings.prompt;else if (save) this.settings.prompt = prompt;

		this.cache.prompt.innerHTML = prompt;
	}).bind(this);

	this.print = (function (string) {
		this.cache.buffer.innerHTML += ('' + string).replace(/\t/g, this.settings.tab) + '\n';
	}).bind(this);

	this.run = (function (command) {
		var _this4 = this;

		if (command) {
			this.history.push(command.trim());

			var history = undefined,
			    cnt = this.history.length;
			do {
				history = JSON.stringify(this.history.slice(- cnt--));
			} while (history.length > 2000000);
			localStorage.cliHistory = history;
		}
		var commandObject = {
			input: command.trim(),
			original: command,
			command: null,
			argv: {},
			result: null
		};

		var pipeline = new Promise(function (resolve, reject) {
			_this4.startLoading();
			resolve(commandObject);
		});

		this.workers.pre.forEach(function (ordered) {
			return ordered.forEach(function (processsor) {
				cli.log('promise pre', processsor);
				pipeline = pipeline.then(function (commandObject) {
					return processsor.worker(commandObject) || commandObject;
				});
			});
		});

		pipeline = pipeline.then(function (commandObject) {
			return new Promise(function (resolve, reject) {
				cli.log('promise command', commandObject);
				var command;
				if (commandObject.command && (command = _this4.workers.commands[commandObject.command])) {
					cli.log('promise run command', command);
					return resolve(command.worker(commandObject) || commandObject);
				}
				return resolve(commandObject);
			});
		}).then(function (result) {
			return result || commandObject;
		});

		this.workers.post.forEach(function (ordered) {
			return ordered.forEach(function (processsor) {
				cli.log('promise post', processsor);
				pipeline = pipeline.then(function (commandObject) {
					return processsor.worker(commandObject) || commandObject;
				});
			});
		});

		return pipeline.then(function (result) {
			return _this4.stopLoading();
		});
	}).bind(this);

	/**
  *
  * @param type
  * @param name
  * @param [description]
  * @param worker
  */
	var store = (function store(type, name, description, _worker, order) {
		if (!order) order = 0;

		if (_worker === undefined && typeof description === 'function') {
			_worker = description;
			description = null;
		}

		var storeObject = {
			name: name,
			description: description,
			// worker: worker
			worker: function worker() {
				for (var _len2 = arguments.length, arg = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
					arg[_key2] = arguments[_key2];
				}

				// save call stack
				cli.log('call worker', type, name, 'with arguments:', arg);
				var result = _worker.apply(null, arg);
				cli.log('and result:', result);
				return result;
			}
		};

		if (type === 'command') this.workers.commands[name] = storeObject;else if (type === 'keys') {
			if (!this.workers.keys[name]) this.workers.keys[name] = [];
			this.workers.keys[name].push(storeObject);
		} else {
			if (!this.workers[type][order]) this.workers[type][order] = [];
			this.workers[type][order].push(storeObject);
		}
	}).bind(this);

	this.command = store.bind(this, 'command');
	this.preprocessor = store.bind(this, 'pre');
	this.postprocessor = store.bind(this, 'post');
	this.registerKey = store.bind(this, 'keys');
}();
window.cli.version = "0.8.0";

'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

(function (cli) {
	cli.command('clear', 'Clear screen', function (commandObject) {
		cli.log('execute command clear');
		cli.cache.buffer.innerHTML = '';
	});
})(window.cli);
(function (cli) {
	cli.command('help', 'Display this list', function (commandObject) {
		cli.log('execute command help');
		cli.print('Command line interface for sites.');
		cli.print('Version: ' + cli.version);
		cli.print('');
		cli.print('List of available commands:');

		Object.keys(cli.workers.commands).sort().forEach(function (command) {
			var descr = cli.workers.commands[command].description;
			cli.print(['\t', command, descr ? '- ' + descr : ''].join(' '));
		});
	});
})(window.cli);
(function (cli) {
	cli.registerKey(9, 'Tab', function (event, isInCommandLine) {
		cli.log('process key Tab for autocomplete');

		if (!isInCommandLine) return;
		event.preventDefault();

		var line = cli.cache.commandInput.value;
		line = new RegExp('^' + line);

		var commands = Object.keys(cli.workers.commands).sort(function (a, b) {
			return a.length - b.length;
		}).filter(function (cmd) {
			return line.test(cmd);
		});

		if (!commands.length) return;else if (commands.length === 1) cli.cache.commandInput.value = commands[0] + ' ';else cli.print(commands.join('\t'));
	});
})(window.cli);
(function (cli) {
	cli.registerKey(0, 'Echo', function (event, isInCommandLine) {
		cli.log('echo pressed key', event.keyCode, event);
	});
})(window.cli);
(function (cli) {
	var lastCommand = '';
	var historyScroll = 0;

	function setCommand(command) {
		cli.cache.commandInput.value = command;
		cli.focus();
	}

	cli.registerKey(38, 'Up', function (event, isInCommandLine) {
		cli.log('process key Up for history');

		if (!isInCommandLine) return;
		if (historyScroll == cli.history.length) return;

		if (!historyScroll) lastCommand = cli.cache.commandInput.value;

		historyScroll++;
		if (historyScroll > cli.history.length) historyScroll = cli.history.length;

		setCommand(cli.history[cli.history.length - historyScroll]);
	});

	cli.registerKey(40, 'Down', function (event, isInCommandLine) {
		cli.log('process key Down for history');

		if (!isInCommandLine) return;
		if (!historyScroll) return;

		historyScroll--;
		var command = '';

		if (historyScroll <= 0) {
			historyScroll = 0;
			command = lastCommand;
		} else command = cli.history[cli.history.length - historyScroll];

		setCommand(command);
	});

	cli.registerKey(13, 'Enter', function (event, isInCommandLine) {
		cli.log('process key Enter for history');

		lastCommand = '';
		historyScroll = 0;
	});
})(window.cli);
(function (cli) {
	cli.registerKey(13, 'Enter', function (event, isInCommandLine) {
		cli.log('process key Enter for run');

		if (!isInCommandLine) return;

		cli.print(cli.cache.prompt.outerHTML + cli.cache.commandInput.value);
		cli.run(cli.cache.commandInput.value);

		cli.cache.buffer.scrollTop = cli.cache.buffer.scrollHeight;
		cli.cache.commandInput.value = '';
	});
})(window.cli);
(function (cli) {
	cli.registerKey(192, '`', function (event, isInCommandLine) {
		cli.log('process key ` for show');

		if (event.target.nodeName === 'INPUT' && !isInCommandLine) return;
		if (isInCommandLine) event.preventDefault();

		cli.toggle();
	});
})(window.cli);
(function (cli) {
	function parse(str) {
		var argv = { _: [] };

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
		var parts = [],
		    quote = false,
		    string = false,
		    buffer = [];

		for (var i = 0; i <= splitted.length; i++) {
			if (splitted[i] === '\\') {
				quote = true;continue;
			} else if (quote) {
				quote = false;continue;
			}

			if (splitted[i] === '"' || splitted[i] === "'") {
				if (!string) {
					parts.push(buffer.join('').trim());
					buffer = [];
					string = { char: splitted[i], position: i, text: [] };
					continue;
				} else if (string.char === splitted[i]) {
					string.text = string.text.join('');
					parts.push(string);
					string = false;
					continue;
				}
			}

			if (string) string.text.push(splitted[i]);else buffer.push(splitted[i]);
		}
		parts.push(buffer.join('').trim());

		// process params
		parts = parts.map(function (item) {
			if (typeof item === 'string') return item.split(/\s+|=/);
			return item;
		});
		parts = [].concat.apply([], parts);

		parts = parts.map(function (item) {
			if (/^\-([^-]+)$/.test(item)) return { flags: RegExp.$1.split('') };
			if (/^\-\-(.+)$/.test(item)) {
				var param = RegExp.$1;
				// to camel case
				param = param.split('-').map(function (word) {
					return word.charAt(0).toUpperCase() + word.slice(1);
				}).join('');
				param = param.charAt(0).toLowerCase() + param.slice(1);

				return { param: param };
			}
			return item;
		});
		parts = parts.map(function (item) {
			return item.text || item;
		});

		// process result object
		parts.push(tail);

		while (parts.length) {
			var item = parts.shift();
			if (!item) continue;

			if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) !== 'object') argv._.push(item);else {
				var param = item.param;
				if (item.flags) {
					param = item.flags.pop();
					while (item.flags.length) argv[item.flags.shift()] = true;
				}

				if (typeof parts[0] === 'string') {
					argv[param] = parts.shift();
					// restore types
					if (!isNaN(parseFloat(argv[param])) && isFinite(argv[param])) argv[param] = +argv[param];
					var types = { 'true': true, 'false': false, 'null': null, 'undefined': undefined };
					if (types.hasOwnProperty(argv[param])) argv[param] = types[argv[param]];
				} else argv[param] = true;
			}
		}

		// done
		return argv;
	}

	cli.preprocessor('argv', 'Split command line to arguments', function (commandObject) {
		cli.log('execute PRE processor argv');

		if (!commandObject.input) return commandObject;

		commandObject.command = null;

		var commands = Object.keys(cli.workers.commands).sort(function (a, b) {
			return b.length - a.length;
		});
		commands.some(function (cmd) {
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

		cli.log('argv result', commandObject);
		return commandObject;
	});
})(window.cli);
(function (cli) {
	var priority = '** log * / - +'.split(' ');
	var expression = {
		'+': function _(a, b) {
			return a + b;
		},
		'-': function _(a, b) {
			return a - b;
		},
		'*': function _(a, b) {
			return a * b;
		},
		'/': function _(a, b) {
			return a / b;
		},
		'**': function _(a, b) {
			return Math.pow(a, b);
		},
		'log': function log(a, b) {
			return Math.log(a) / Math.log(b);
		}
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
		while (/[+-]{2}/.test(str)) str = str.replace(/([+-]{2})/, function (s) {
			return signs[s];
		});
		while (spacer_re.test(str)) str = str.replace(spacer_re, '$1 $2 $3');

		// normalize string
		str = str.split(new RegExp(digit)).map(function (part) {
			return part.trim();
		}).filter(function (part) {
			return part !== '';
		}).map(function (part) {
			return isNaN(+part) ? part : +part;
		}).filter(function (part, i, arr) {
			if (typeof part !== 'string') return true;
			if (priority.indexOf(part) === -1) throw new SyntaxError('invalid operator ' + part);
			return !(i === 0 || i === arr.length - 1);
		}).join(' ');

		// calc
		priority.forEach(function (sign) {
			var qsign = [''].concat(sign.split('')).join('\\');
			var re = new RegExp(digit + ' (' + qsign + ') ' + digit);
			while (new RegExp(qsign).test(str)) str = str.replace(re, function (match, a, sign, b) {
				return expression[sign](+a, +b);
			});
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

	cli.postprocessor('calc', 'Simple calculator', function (commandObject) {
		cli.log('execute POST processor calc');
		var input = commandObject.input;

		if (!input) return commandObject;
		if (!/^[log\s\d.e()/*+-]+$/.test(input)) return commandObject;

		try {
			commandObject.result = calc(input);
			cli.print(commandObject.result);
			commandObject.input = '';
		} catch (e) {
			cli.print(e.name + ': ' + e.message);
		}

		return commandObject;
	});
})(window.cli);
(function (cli) {
	cli.postprocessor('eval', 'Run js code', function (commandObject) {
		var input = commandObject.input;
		if (!input) return commandObject;

		try {
			commandObject.result = eval(input);
			cli.print(commandObject.result);
			commandObject.input = '';
		} catch (e) {
			cli.print(e.name + ': ' + e.message);
		}

		return commandObject;
	}, 1000);
})(window.cli);

(function(cli){	cli.addHtml("templates/panel.html", "<div class=\"cli\"><div onmouseup=\"cli.mouseUp()\" class=\"cli-panel show\"><div class=\"cli-history\"><span class=\"cli-buffer\"></span></div><div class=\"cli-loader hide_element\"></div><div class=\"cli-line\"><span class=\"cli-prompt\"></span><input type=\"text\" autofocus=\"autofocus\" class=\"cli-command\"/></div></div></div>", "body");})(window.cli)

!function(){var a=".cli {\n  max-height: 64%;\n  z-index: 65535; }\n  .cli-panel {\n    height: 0;\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    color: white;\n    font: 16px monospace;\n    background: rgba(0, 0, 0, 0.8);\n    line-height: 20px;\n    transition: height 0.64s linear; }\n  .cli-panel.show {\n    height: 64%; }\n  .cli-history {\n    overflow: auto;\n    white-space: pre-wrap;\n    position: absolute;\n    bottom: 20px; }\n    .cli-history .cli-prompt {\n      display: inline;\n      width: auto; }\n  .cli-line {\n    position: absolute;\n    bottom: 0;\n    height: 20px;\n    width: 100%;\n    display: table; }\n  .cli-prompt {\n    display: table-cell;\n    width: 1px; }\n  .cli-command {\n    background: none;\n    border: 0;\n    color: white;\n    outline: none;\n    font: 16px monospace;\n    padding-left: 9px;\n    width: 100%;\n    box-sizing: border-box;\n    display: table-cell; }\n  .cli-loader {\n    position: absolute;\n    bottom: 0;\n    height: 20px; }\n  .cli .hide_element {\n    display: none; }\n",b=document.createElement("style");b.type="text/css",b.styleSheet?b.styleSheet.cssText=a:b.appendChild(document.createTextNode(a)),(document.head||document.getElementsByTagName("head")[0]).appendChild(b)}();