garmApp = angular.module('GarmApp', ['ngRoute', 'ngSanitize']);

garmApp.config(function($routeProvider, $locationProvider) {
    $routeProvider.
        when('/', {
            redirectTo: '/exceptions'
        }).
        when('/exceptions', {
            controller: 'Exception',
            templateUrl: 'templates/exceptions.html'
        }).
        otherwise({
            redirectTo: '/'
        });

    // $locationProvider.html5Mode(true);
    // $locationProvider.hashPrefix('!');
});
