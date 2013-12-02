var shim = {
    underscore: {
        exports: '_'
    },
    angular: {
        exports: 'angular',
        deps: ['jquery']
    },
    angular_route: {
        deps: ['angular']
    },
    angular_sanitize: {
        deps: ['angular']
    },
    bootstrap: {
        deps: ['jquery']
    },
    bootstrap_switch: {
        deps: ['bootstrap']
    }
};

if(env === 'dev') {
    require.config({
        paths: {
            domReady: 'vendor/dev/domReady',
            jquery: 'vendor/dev/jquery',
            underscore: 'vendor/dev/underscore',
            angular: 'vendor/dev/angular',
            angular_route: 'vendor/dev/angular-route',
            angular_sanitize: 'vendor/dev/angular-sanitize',
            bootstrap: 'vendor/dev/bootstrap',
            bootstrap_switch: 'vendor/dev/bootstrap-switch',
            moment: 'vendor/dev/moment'
        },
        shim: shim
    });
} else if (env === 'cdn') {
    require.config({
        paths: {
            domReady: 'http://cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady.min',
            jquery: 'http://codeorigin.jquery.com/jquery-1.10.2.min',
            underscore: 'http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min',
            angular: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.2/angular.min',
            angular_route: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.2/angular-route.min',
            angular_sanitize: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.2/angular-sanitize.min',
            bootstrap: 'http://netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min',
            bootstrap_switch: 'http://cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/1.8/js/bootstrap-switch.min',
            moment: 'http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.4.0/moment.min'
        },
        shim: shim
    });
} else {
    require.config({
        paths: {
            domReady: 'vendor/prod/domReady.min',
            jquery: 'vendor/prod/jquery.min',
            underscore: 'vendor/prod/underscore-min',
            angular: 'vendor/prod/angular.min',
            angular_route: 'vendor/prod/angular-route.min',
            angular_sanitize: 'vendor/prod/angular-sanitize.min',
            bootstrap: 'vendor/prod/bootstrap.min',
            bootstrap_switch: 'vendor/prod/bootstrap-switch.min',
            moment: 'vendor/prod/moment.min'
        },
        shim: shim
    });
}

require(['angular', 'app', 'domReady', 'jquery', 'application', 'exception', 'application',
    'application_directives', 'projects_loader', 'exceptions_loader'],
    function(angular, app, domReady, $, application_promise, exception_promise) {
        $.when(application_promise, exception_promise).then(function() {
            app.config(function($routeProvider, $locationProvider) {
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
            });
            domReady(function() {
                angular.bootstrap(document, ['GarmApp']);
            });
        });
});