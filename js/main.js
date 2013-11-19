garmApp = angular.module('GarmApp', ['ngRoute', 'ngSanitize']);

garmApp.config(function($routeProvider, $locationProvider) {
    $routeProvider.
        when('/', {
            redirectTo: '/exceptions/'
        }).
        when('/exceptions/:project_id?/:category_id?/:exception_id?', {
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
