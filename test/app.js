getList = function() {
	return timeout(function() {
		return [
			{title: 'Red', price: 152},
			{title: 'Blue', price: 236},
			{title: 'Green', price: 212}
		]
	}, 1000)
};

cli.command('books_load', 'App command', function() {
	return books.getList().then(function(list) {
		cli.print(list.map(function(book) { return book.title + ': ' + book.price + '$' }).join(', '))
	})
});

