garmApp = angular.module('GarmApp', ['ngRoute', 'ngSanitize']);

garmApp.config(function($routeProvider, $locationProvider) {
    $routeProvider.
        when('/', {
            redirectTo: '/exceptions/'
        }).
        when('/exceptions/:project?/:category_id?/:exception_id?/:tab?', {
            controller: 'Exception',
            templateUrl: 'templates/exceptions.html'
        }).
        otherwise({
            redirectTo: '/'
        });

    // Not to use:
    // $locationProvider.html5Mode(true);
    // $locationProvider.hashPrefix('!');
});
