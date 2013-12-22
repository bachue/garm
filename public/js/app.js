define(['angular', 'controllers', 'directives', 'filters', 'angular_ui_router', 'angular_sanitize'], function(angular) {
    return angular.module('GarmApp', ['controllers', 'directives', 'filters', 'ui.router', 'ngSanitize']);
});
