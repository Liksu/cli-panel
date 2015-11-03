/**
 * cli-panel - Command line interface for angular sites
 * @version v0.1.3
 * @link http://liksu.github.io/cli-panel/
 * @license MIT
 */
'use strict';

window.cli = new function () {
	this.cache = {
		commandInput: null,
		buffer: null,
		panel: null,
		show: false
	};
	this.history = [];
	this.settings = {
		prompt: '> '
	};
	this.workers = {
		pre: [],
		commands: {},
		post: [],
		keys: {}
	};

	/* templates */

	this.templates = {};

	this.addHtml = (function (name, content, selector) {
		this.templates[name] = {
			html: content,
			selector: selector || 'body'
		};
	}).bind(this);

	document.addEventListener("DOMContentLoaded", (function () {
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
		this.cache.commandInput = this.cache.panel.querySelector('.cli .cli-line .cli-command');
		this.cache.buffer = this.cache.panel.querySelector('.cli-buffer');

		this.toggle(this.cache.show);
	}).bind(this));

	/* keyboard */

	document.addEventListener('keydown', (function (e) {
		if (e.keyCode === 192) {
			// `
			if (e.target.nodeName === 'INPUT' && e.target !== this.cache.commandInput) return;
			if (e.target === this.cache.commandInput) e.preventDefault();
			this.toggle();
		} else if (e.keyCode === 13 && e.target === this.cache.commandInput) {
			// enter
			cli.print(cli.settings.prompt + this.cache.commandInput.value);
			cli.run(this.cache.commandInput.value);

			this.cache.buffer.scrollTop = this.cache.buffer.scrollHeight;
			this.cache.commandInput.value = '';
		}
		//TODO: other keys
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

	/* API */

	this.print = (function (string) {
		this.cache.buffer.innerHTML += string.replace(/\t/g, '    ') + '\n';
	}).bind(this);

	this.run = (function (command) {
		var _this = this;

		this.history.push(command);
		var commandObject = {
			input: command,
			original: command,
			command: null,
			argv: {},
			result: null
		};
		// run over all
		// each step is promise

		var pipeline = new Promise(function (resolve, reject) {
			return resolve(commandObject);
		});

		this.workers.pre.forEach(function (ordered) {
			return ordered.forEach(function (processsor) {
				//console.log('pre', processsor);
				pipeline = pipeline.then(function (commandObject) {
					return processsor.worker(commandObject);
				});
			});
		});

		pipeline = pipeline.then(function (commandObject) {
			return new Promise(function (resolve, reject) {
				//console.log('command', commandObject);
				var command;
				if (commandObject.command && (command = _this.workers.commands[commandObject.command])) {
					//console.log('run', command);
					return resolve(command.worker(commandObject)).then(function (result) {
						return commandObject = result || commandObject;
					});
				}
				return resolve(commandObject);
			});
		});

		this.workers.post.forEach(function (ordered) {
			return ordered.forEach(function (processsor) {
				//console.log('post', processsor);
				pipeline = pipeline.then(function (commandObject) {
					return processsor.worker(commandObject);
				});
			});
		});

		return pipeline;
	}).bind(this);

	/**
  *
  * @param type
  * @param name
  * @param [description]
  * @param worker
  */
	var store = (function store(type, name, description, worker, order) {
		if (!order) order = 0;

		if (worker === undefined && typeof description === 'function') {
			worker = description;
			description = null;
		}

		var storeObject = {
			name: name,
			description: description,
			worker: worker
		};

		if (type === 'command' || type === 'keys') this.workers.commands[name] = storeObject;else {
			if (!this.workers[type][order]) this.workers[type][order] = [];
			this.workers[type][order].push(storeObject);
		}
	}).bind(this);

	this.command = store.bind(this, 'command');
	this.preprocessor = store.bind(this, 'pre');
	this.postprocessor = store.bind(this, 'post');
}();

'use strict';

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

(function (cli) {
	//angular.module('cli').run(function($cli) {
	//	$cli.command('clear', 'Clear screen', function(commandObject) {
	//		$cli.buffer = '';
	//		$cli.print(null);
	//	});
	//});
})(window.cli);
(function (cli) {
	cli.command('help', 'Display this list', function (commandObject) {
		//console.log('in help', commandObject);
		cli.print('List of available commands:');

		Object.keys(cli.workers.commands).sort().forEach(function (command) {
			var descr = cli.workers.commands[command].description;
			cli.print(['\t', command, descr ? '- ' + descr : ''].join(' '));
		});
	});
})(window.cli);
(function (cli) {
	//angular.module('cli').run(function($cli) {
	//	var services = angular.modules
	//		.filter(function(module) { return module !== 'cli' })
	//		.reduce(function(list, module) { return list.concat(angular.module(module)._invokeQueue) }, [])
	//		.filter(function(item) { return item[1] === 'service' })
	//		.map(function(item) { return item[2][0] })
	//		.forEach(function(service) {
	//			//$cli.command(service, )
	//		})
	//});
})(window.cli);
(function (cli) {
	//angular.module('cli').run(function($cli) {
	//	function calc(string) {
	//		return eval(string);
	//	}
	//
	//	$cli.postprocessor('calc', 'Calculate input', function(commandObject) {
	//		if (!commandObject.input) return commandObject;
	//
	//		$cli.print(calc(commandObject.input));
	//
	//		return commandObject
	//	});
	//});
})(window.cli);
(function (cli) {})(window.cli);
(function (cli) {})(window.cli);
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

		console.log('str: %s; tail: %s', str, tail);

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

		console.log('extracted strings', parts);

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

		console.log('processed params', parts);

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

		console.log(commandObject);
		return commandObject;
	});
})(window.cli);

(function(cli){	cli.addHtml("templates/panel.html", "<div class=\"cli\"><div onclick=\"focus()\" class=\"cli-panel show\"><div class=\"cli-history\"><span class=\"cli-buffer\"></span><span class=\"cli-loader hide_element\"></span></div><div class=\"cli-line\"><span class=\"cli-prompt\"></span><input type=\"text\" autofocus=\"autofocus\" class=\"cli-command\"/></div></div></div>", "body");})(window.cli)

!function(){var a=".cli {\n  max-height: 64%; }\n  .cli-panel {\n    height: 0;\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    color: white;\n    font: 16px monospace;\n    background: rgba(0, 0, 0, 0.8);\n    line-height: 20px;\n    transition: height 0.64s linear; }\n  .cli-panel.show {\n    height: 64%; }\n  .cli-history {\n    overflow: auto;\n    white-space: pre-wrap;\n    position: absolute;\n    bottom: 20px; }\n  .cli-line {\n    position: absolute;\n    bottom: 0;\n    height: 20px;\n    width: 100%; }\n  .cli-command {\n    background: none;\n    border: 0;\n    color: white;\n    outline: none;\n    font: 16px monospace;\n    padding-left: 20px;\n    width: 100%;\n    box-sizing: border-box;\n    margin-left: -20px; }\n  .cli .hide_element {\n    display: none; }\n",b=document.createElement("style");b.type="text/css",b.styleSheet?b.styleSheet.cssText=a:b.appendChild(document.createTextNode(a)),(document.head||document.getElementsByTagName("head")[0]).appendChild(b)}();