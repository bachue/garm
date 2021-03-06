var shim = {
    underscore: {
        exports: '_'
    },
    angular: {
        exports: 'angular',
        deps: ['jquery']
    },
    angular_sanitize: {
        deps: ['angular']
    },
    angular_ui_router: {
        deps: ['angular']
    },
    bootstrap: {
        deps: ['jquery']
    },
    bootstrap_switch: {
        deps: ['bootstrap']
    },
    chart: {
        exports: 'Chart'
    },
    'jquery.notification': {
        deps: ['jquery']
    },
    'lib/bindonce': {
        deps: ['angular']
    }
};

if(env === 'dev') {
    require.config({
        paths: {
            domReady: 'vendor/dev/domReady',
            jquery: 'vendor/dev/jquery',
            underscore: 'vendor/dev/underscore',
            angular: 'vendor/dev/angular',
            angular_sanitize: 'vendor/dev/angular-sanitize',
            bootstrap: 'vendor/dev/bootstrap',
            bootstrap_switch: 'vendor/dev/bootstrap-switch',
            moment: 'vendor/dev/moment',
            chart: 'vendor/dev/Chart',
            angular_ui_router: 'vendor/dev/angular-ui-router',
            'jquery.notification': 'vendor/dev/jquery.notification'
        },
        shim: shim
    });
} else if (env === 'cdn') {
    require.config({
        paths: {
            domReady: '//cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady.min',
            jquery: '//codeorigin.jquery.com/jquery-1.10.2.min',
            underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min',
            angular: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.2/angular.min',
            angular_sanitize: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.2.2/angular-sanitize.min',
            bootstrap: '//netdna.bootstrapcdn.com/bootstrap/3.0.2/js/bootstrap.min',
            bootstrap_switch: '//cdnjs.cloudflare.com/ajax/libs/bootstrap-switch/1.8/js/bootstrap-switch.min',
            moment: '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.4.0/moment.min',
            chart: '//cdnjs.cloudflare.com/ajax/libs/Chart.js/0.2.0/Chart.min',
            angular_ui_router: '//angular-ui.github.io/ui-router/release/angular-ui-router.min',
            'jquery.notification': '//cdnjs.cloudflare.com/ajax/libs/jquery.notification/1.0.2/jquery.notification.min'
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
            angular_sanitize: 'vendor/prod/angular-sanitize.min',
            bootstrap: 'vendor/prod/bootstrap.min',
            bootstrap_switch: 'vendor/prod/bootstrap-switch.min',
            moment: 'vendor/prod/moment.min',
            chart: 'vendor/prod/Chart.min',
            angular_ui_router: 'vendor/prod/angular-ui-router.min',
            'jquery.notification': 'vendor/prod/jquery.notification.min'
        },
        shim: shim
    });
}

require(['angular', 'app', 'domReady', 'jquery', 'application', 'exceptions',
    'exception_project', 'exception_category', 'exception', 'exception_tab',
    'application_directives', 'exceptions_directives', 'exceptions_filters', 'projects_loader', 'exceptions_loader',
    'angular_ui_router', 'angular_sanitize', 'chart', 'moment', 'jquery.notification', 'bootstrap_switch', 'lib/bindonce'],
    function(angular, app, domReady, $, application_promise, exceptions_promise, exception_project_promise,
             exception_category_promise, exception_promise, exception_tab_promise) {
        $.when(application_promise, exceptions_promise, exception_project_promise, exception_category_promise,
               exception_promise, exception_tab_promise).then(function() {
            app.config(function($stateProvider, $urlRouterProvider) {
                $stateProvider.state('application', {
                    url: '',
                    templateUrl: 'templates/application.html',
                    controller: 'Application'
                }).state('application.exceptions', {
                    url: '/exceptions',
                    templateUrl: 'templates/exceptions.html',
                    controller: 'Exceptions'
                }).state('application.exceptions.project', {
                    url: '/:project_name',
                    template: '<ui-view />',
                    controller: 'ExceptionProject'
                }).state('application.exceptions.project.exception_category', {
                    url: '/:exception_category_id',
                    template: '<ui-view />',
                    controller: 'ExceptionCategory'
                }).state('application.exceptions.project.exception_category.exception', {
                    url: '/:exception_id',
                    templateUrl: 'templates/exception.html',
                    controller: 'Exception'
                }).state('application.exceptions.project.exception_category.exception.tab', {
                    url: '/:tab_name',
                    templateUrl: 'templates/exception_tab.html',
                    controller: 'ExceptionTab'
                });
                $urlRouterProvider.otherwise('');
            });

            domReady(function() {
                $('img.loading').hide('slow', function() { $(this).remove(); });
                angular.bootstrap(document, ['GarmApp']);
            });
        });
});