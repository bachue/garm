define(['angular', 'controllers', 'directives', 'filters', 'angular_ui_router', 'angular_sanitize', 'lib/bindonce'], function(angular) {
    return angular.module('GarmApp', ['controllers', 'directives', 'filters', 'ui.router', 'ngSanitize', 'pasvaz.bindonce']);
});
