angular
	.module('app', ['cli'])

	.service('books', function($timeout) {
		return {
			getList: function() {
				return $timeout(function() {
					return [
						{title: 'Red', price: 152},
						{title: 'Blue', price: 236},
						{title: 'Green', price: 212}
					]
				}, 1000)
			}
		}
	})

	.controller('main', function($scope, $cli, books) {
		$scope.message = 'All is ok ;)';

		$cli.command('books_load', 'Angular sample async command', function() {
			return books.getList().then(function(list) {
				$cli.print(list.map(function(book) { return book.title + ': ' + book.price + '$' }).join(', '))
			})
		})

	})

	.directive('list', function (books) {
		return {
			template: '<div>list: <ul><li ng-repeat="book in books"><b>{{book.title}}:</b> {{book.price}}$</li></ul></div>',
			scope: {
				param: '=?'
			},
			controller: function ($scope) {
				books.getList().then(books => $scope.books = books);
				console.log('directive scope:', $scope);
			}
		}
	});

