# cli-panel
Command line interface for sites.

# install

From github.io:
```html
<script src="//liksu.github.io/cli-panel/cli.min.js"></script>
```
## or with npm
```bash
npm install cli-panel
```
and then
```javascript
<script src="node_modules/cli-panel/build/cli.min.js"></script>
```

## or you can inject it after site loaded:
```javascript
(function() {
    var scriptElement = document.createElement('script');
    scriptElement.type = 'text/javascript';
    scriptElement.src = '//liksu.github.io/cli-panel/cli.min.js';
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(scriptElement);
    setTimeout(function() {cli.init()}, 1000);
})();
```

## or minified version:
```javascript
!function(d){var t=d.createElement("script");t.type="text/javascript",t.src="//liksu.github.io/cli-panel/cli.min.js";var e=d.getElementsByTagName("body")[0];e.appendChild(t),setTimeout(function(){cli.init()},1e3)}(document);
```

# API
## cli.command(name, [description], callback)
Add command.