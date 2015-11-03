var getList = function() {
	return new Promise(resolve => setTimeout(function() {
		resolve([
			{title: 'Red', price: 152},
			{title: 'Blue', price: 236},
			{title: 'Green', price: 212}
		]);
	}, 1000));
};

// example of self command
cli.command('books_load', 'App command', function() {
	return getList().then(function(list) {
		cli.print(list.map(function(book) { return book.title + ': ' + book.price + '$' }).join(', '))
	})
});

// example of prompt change
var updatePrompt = function() {
	cli.cache.prompt.innerHTML = '<span class="bracket">[</span>'
		+ '<span class="time">'
		+ new Date().toJSON().replace(/^.+T([\d:]+).+$/, '$1')
		+ '</span>'
		+ '<span class="bracket">]</span>&nbsp;'
		+ cli.settings.prompt
};

document.addEventListener("DOMContentLoaded", () => {
	updatePrompt();
	setInterval(updatePrompt, 1000);
});
