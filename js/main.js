var garmApp = angular.module('GarmApp', ['ngRoute']);

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

var global = garmApp.controller('Global', function($scope) {
    $scope.controller_names = ['Exceptions'];
    $scope.projects = [{name: 'BUS', percent: 12}, {name: 'Njord', percent: 65}, {name: 'Phoenix', percent: 92}];
    $scope.current_project = $scope.projects[0];
});

global.controller('Exception', function($scope) {
    $('.make-switch').bootstrapSwitch(false);
    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
});

global.directive('setPercentColor', function() {
    return {
        link: function(scope, element) {
            element.addClass('label-' + getPercentColor(scope.project.percent));
        }
    };
});
