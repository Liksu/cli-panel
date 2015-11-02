/**
 * cli-panel - Command line interface for angular sites
 * @version v0.1.2
 * @link http://liksu.github.io/cli-panel/
 * @license MIT
 */
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
		this.cache.commandInput = this.cache.panel.querySelector('.line .command');
		this.cache.buffer = this.cache.panel.querySelector('.buffer');
	}).bind(this));

	/* keyboard */

	document.addEventListener('keydown', (function (e) {
		if (e.keyCode === 192) {
			// `
			if (e.target.nodeName === 'INPUT' && e.target !== this.cache.commandInput) return;
			this.toggle();
		} else if (e.keyCode === 13 && e.target === this.cache.commandInput) {} // enter
		//cli.print(cli.prompt + $scope.command);
		//cli.run($scope.command);
		//
		//buffer.scrollTop = buffer.scrollHeight;
		//$scope.command = '';

		//$scope.$apply();
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
		this.cache.buffer.innerHTML += string + '\n';
	}).bind(this);

	this.run = (function (command) {
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

		var pipeline = new Promise((resolve, reject) => resolve(commandObject));

		console.log(this.workers.pre);

		//this.workers.pre.forEach(ordered => ordered.forEach(processsor => {
		//	pipeline = pipeline.then(processsor.worker(commandObject))
		//}));

		//var pipeline = this.workers.pre.reduce(function(pipeline, processor, i) {
		//	return $q.when(pipeline).then(function() {return processor.worker(commandObject)});
		//}, commandObject);
		//
		//pipeline = $q.when(pipeline).then(function() {
		//	var command;
		//	if (commandObject.command && (command = this.workers.commands[commandObject.command])) {
		//		return $q
		//			.when(command.worker(commandObject))
		//			.then(function(result) {commandObject = result || commandObject});
		//	}
		//
		//	return $q.when(commandObject);
		//}.bind(this));
		//
		//pipeline = $q.when(pipeline).then(function() {
		//	this.workers.post.reduce(function (pipeline, processor, i) {
		//		return $q.when(pipeline).then(function () {
		//			return processor.worker(commandObject)
		//		});
		//	}, $q.when(commandObject));
		//}.bind(this));
		//
		//return pipeline.then(function() { return commandObject });
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

(function(cli){	cli.addHtml("templates/panel.html", "<div class=\"cli\"><div onclick=\"focus()\" class=\"cli-panel show\"><div class=\"cli-history\"><span class=\"cli-buffer\"></span><span class=\"cli-loader hide_element\"></span></div><div class=\"cli-line\"><span class=\"cli-prompt\"></span><input type=\"text\" autofocus=\"autofocus\" class=\"cli-command\"/></div></div></div>", "body");})(window.cli)

!function(){var a=".cli {\n  max-height: 64%; }\n  .cli-panel {\n    height: 0;\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    color: white;\n    font: 16px monospace;\n    background: rgba(0, 0, 0, 0.8);\n    line-height: 20px;\n    transition: height 0.64s linear; }\n  .cli-panel.show {\n    height: 64%; }\n  .cli-history {\n    overflow: auto;\n    white-space: pre-line;\n    position: absolute;\n    bottom: 20px; }\n  .cli-line {\n    position: absolute;\n    bottom: 0;\n    height: 20px;\n    width: 100%; }\n  .cli-command {\n    background: none;\n    border: 0;\n    color: white;\n    outline: none;\n    font: 16px monospace;\n    padding-left: 20px;\n    width: 100%;\n    box-sizing: border-box;\n    margin-left: -20px; }\n  .cli .hide_element {\n    display: none; }\n",b=document.createElement("style");b.type="text/css",b.styleSheet?b.styleSheet.cssText=a:b.appendChild(document.createTextNode(a)),(document.head||document.getElementsByTagName("head")[0]).appendChild(b)}();

angular.module('cli').run(function ($cli) {
	$cli.command('clear', 'Clear screen', function (commandObject) {
		$cli.buffer = '';
		$cli.print(null);
	});
});

angular.module('cli').run(function ($cli) {
	$cli.command('help', 'Display this list', function (commandObject) {
		$cli.print('List of available commands:');
		Object.keys($cli.workers.commands).sort().forEach(function (command) {
			var descr = $cli.workers.commands[command].description;
			$cli.print(['\t', command, descr ? '- ' + descr : ''].join(' '));
		});
	});
	//console.log( 'help', angular.module('cli')._invokeQueue );
});

angular.module('cli').run(function ($cli) {
	var services = angular.modules.filter(function (module) {
		return module !== 'cli';
	}).reduce(function (list, module) {
		return list.concat(angular.module(module)._invokeQueue);
	}, []).filter(function (item) {
		return item[1] === 'service';
	}).map(function (item) {
		return item[2][0];
	}).forEach(function (service) {
		//$cli.command(service, )
	});
});





angular.module('cli').run(function ($cli) {
	function calc(string) {
		return eval(string);
	}

	$cli.postprocessor('calc', 'Calculate input', function (commandObject) {
		if (!commandObject.input) return commandObject;

		$cli.print(calc(commandObject.input));

		return commandObject;
	});
});

angular.module('cli').run(function ($cli) {
	$cli.preprocessor('argv', 'Split command line to arguments', function (commandObject) {
		if (!commandObject.input) return commandObject;

		var word = commandObject.input.match(/^\w+/);
		if (Object.keys($cli.workers.commands).indexOf(word && word[0]) !== -1) {
			commandObject.command = word[0];
			commandObject.input = commandObject.input.replace(word[0], '');
		}

		return commandObject;
	});
});