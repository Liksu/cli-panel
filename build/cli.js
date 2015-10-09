/**
 * cli4ng - Command line interface for angular sites
 * @version v0.1.1
 * @link https://github.com/Liksu/ng-cli#readme
 * @license MIT
 */
window.cli = new (function() {
	/* templates */
	this.templates = {};
	this.cache = {
		commandInput: null,
		buffer: null,
		panel: null,
		show: false
	};

	this.addHtml = function(name, content, selector) {
		this.templates[name] = {
			html: content,
			selector: selector || 'body'
		};
	}.bind(this);

	document.addEventListener("DOMContentLoaded", function() {
		var templates = this.templates;
		var fragments = {};

		Object.keys(templates).forEach(function(name) {
			var selector = templates[name].selector;
			if (!fragments[selector]) {
				fragments[selector] = document.createElement('div');
				fragments[selector].innerHTML = '';
			}
			fragments[selector].innerHTML += templates[name].html;
		});

		Object.keys(fragments).forEach(function(selector) {
			document.querySelector(selector).appendChild( fragments[selector] );
		});

		this.cache.panel = document.querySelector('.cli .panel');
		this.cache.commandInput = this.cache.panel.querySelector('.line .command');
		this.cache.buffer = this.cache.panel.querySelector('.buffer');

		this.toggle(this.cache.show);
	}.bind(this));

	/* keyboard */
	document.addEventListener('keydown', function(e) {
		if (e.keyCode === 192) {
			if (e.target.nodeName === 'INPUT' && e.target !== this.cache.commandInput) return;
			if (e.target === this.cache.commandInput) e.preventDefault();
			this.toggle();
		}
		else if (e.keyCode === 13 && e.target === this.cache.commandInput) {
			//cli.print(cli.prompt + $scope.command);
			//cli.run($scope.command);
			//
			//buffer.scrollTop = buffer.scrollHeight;
			//$scope.command = '';
		}

		//$scope.$apply();
	}.bind(this));


	/* ui helpers */

	this.show = function() {
		this.cache.panel.className += ' show';
		this.cache.show = true;
		this.focus();
	}.bind(this);

	this.hide = function() {
		this.cache.panel.className = this.cache.panel.className.replace(/\s*show/g, '');
		this.cache.show = false;
	}.bind(this);

	this.toggle = function(show){
		if (show === undefined) show = !this.cache.show;
		show ? this.show() : this.hide();
	}.bind(this);

	this.focus = function() {
		var input = this.cache.commandInput;
		setTimeout(function() {
			var len = input.value.length;
			if(input.setSelectionRange){
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
	}.bind(this);

	/* service */

	this.command = function() {

	};
})();

(function(cli){cli.addHtml("panel.html","<div class=\"cli\">\n	<style>\n		.cli {\n			max-height: 64%;\n		}\n		.panel {\n			height: 0;\n			position: absolute;\n			top: 0;\n			left: 0;\n			right: 0;\n			color: white;\n			font: 16px monospace;\n			background: rgba(0, 0, 0, 0.8);\n			line-height: 20px;\n			transition: height 0.5s ease;\n		}\n		.panel.show {\n			height: 64%;\n		}\n		.history {\n			overflow: auto;\n			white-space: pre-line;\n			position: absolute;\n			bottom: 20px;\n		}\n		.line {\n			position: absolute;\n			bottom: 0;\n			height: 20px;\n			width: 100%;\n		}\n		.command {\n			background: none;\n			border: 0;\n			color: white;\n			outline: none;\n			font: 16px monospace;\n			padding-left: 20px;\n			width: 100%;\n			box-sizing: border-box;\n			margin-left: -20px;\n		}\n		.loader {}\n		.hide_element {\n			display: none;\n		}\n	</style>\n\n	<div class=\"panel show\" onclick=\"focus()\">\n		<div class=\"history\">\n			<span class=\"buffer\"></span>\n			<span class=\"loader hide_element\"></span>\n		</div>\n		<div class=\"line\">\n			<span class=\"prompt\"></span>\n			<input type=\"text\" class=\"command\" autofocus=\"autofocus\"/>\n		</div>\n	</div>\n</div>","body");})(window.cli)