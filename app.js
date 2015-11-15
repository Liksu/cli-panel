var getList = function() {
	return new Promise(function(resolve) {
		setTimeout(function() {
			cli.print('intermediate result');
			setTimeout(function() {
				resolve([
					{title: 'Red', price: 152},
					{title: 'Blue', price: 236},
					{title: 'Green', price: 212}
				]);
			}, 5000);
		}, 5000)
	});
};

// example of self command
cli.command('books_load', 'App command', function() {
	cli.log('execute command books_load');
	return getList().then(function(list) {
		cli.print(list.map(function(book) {return book.title + ': ' + book.price + '$'}).join(', '));
		cli.log('long books_load finished');
	})
});

// example of prompt change
document.addEventListener("DOMContentLoaded", function() {
	setInterval(function() {
		cli.setPrompt([
			'<span class="bracket">[</span>',
			'<span class="time">',
			new Date().toLocaleTimeString('en-GB'), // British English uses two-digit 24-hour time format
			'</span>',
			'<span class="bracket">]</span>&nbsp;',
			cli.settings.prompt
		].join(''));
	}, 1000);
});
