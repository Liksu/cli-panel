angular
	.module('app', ['cli'])

	.service('books', function($timeout) {
		return {
			getList: function() {
				return $timeout(function() {
					return [
						{title: 'Red', price: Math.random() * 1000 << 0},
						{title: 'Blue', price: Math.random() * 1000 << 0},
						{title: 'Green', price: Math.random() * 1000 << 0}
					]
				}, 1000)
			}
		}
	})

	.controller('main', function($scope, $cli, books) {
		$scope.message = 'All is ok ;)';
		$scope.times = new Array(2);
		$scope.add = function() {
			$scope.times.length++
		};
		$scope.remove = function() {
			$scope.times.length--
		};
	})

	.directive('list', function (books) {
		return {
			template: '<div ng-click="refresh()">list: <ul><li ng-repeat="book in books"><b>{{book.title}}:</b> {{book.price}}$</li></ul></div>',
			scope: {
				param: '=?'
			},
			link: function ($scope) {
				books.getList().then(function(books) {$scope.books = books});
			},
			controller: function($scope) {
				$scope.refresh = function () {
					books.getList().then(function(books) {$scope.books = books});
				}
			}
		}
	});

