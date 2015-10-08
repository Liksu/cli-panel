/**
 * cli4ng - Command line interface for angular sites
 * @version v0.0.2
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
	}.bind(this));

	/* keyboard */
	document.addEventListener('keydown', function(e) {
		if (e.keyCode === 192) {
			if (e.target.nodeName === 'INPUT' && e.target !== this.cache.commandInput) return;
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

(function(cli){cli.addHtml("panel.html","<div class=\"cli\">\r\n	<style>\r\n		.cli {\r\n			max-height: 64%;\r\n		}\r\n		.panel {\r\n			height: 0;\r\n			position: absolute;\r\n			top: 0;\r\n			left: 0;\r\n			right: 0;\r\n			color: white;\r\n			font: 16px monospace;\r\n			background: rgba(0, 0, 0, 0.8);\r\n			line-height: 20px;\r\n			display: none;\r\n			transition: height 2.5s linear;\r\n		}\r\n		.panel.show {\r\n			transition: height 2.5s linear;\r\n			display: block;\r\n			height: 64%;\r\n		}\r\n		.history {\r\n			overflow: auto;\r\n			white-space: pre-line;\r\n			position: absolute;\r\n			bottom: 20px;\r\n		}\r\n		.line {\r\n			position: absolute;\r\n			bottom: 0;\r\n			height: 20px;\r\n			width: 100%;\r\n		}\r\n		.command {\r\n			background: none;\r\n			border: 0;\r\n			color: white;\r\n			outline: none;\r\n			font: 16px monospace;\r\n			padding-left: 20px;\r\n			width: 100%;\r\n			box-sizing: border-box;\r\n			margin-left: -20px;\r\n		}\r\n		.loader {}\r\n		.hide_element {\r\n			display: none;\r\n		}\r\n	</style>\r\n\r\n	<div class=\"panel show\" onclick=\"focus()\">\r\n		<div class=\"history\">\r\n			<span class=\"buffer\"></span>\r\n			<span class=\"loader hide_element\"></span>\r\n		</div>\r\n		<div class=\"line\">\r\n			<span class=\"prompt\"></span>\r\n			<input type=\"text\" class=\"command\" autofocus=\"autofocus\"/>\r\n		</div>\r\n	</div>\r\n</div>","body");})(window.cli)