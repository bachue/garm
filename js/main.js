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
    // <Mock>
        $scope.controller_names = ['Exceptions'];
        $scope.projects = [
            {id: 1, name: 'BUS', percent: 12, subscriptions: [
                {id: 1, email: 'bachue.shu@mail.com', interval_days: 1},
                {id: 2, email: 'rong.zhou@mail.com', interval_days: 7}]
            },
            {id: 2, name: 'Njord', percent: 65, subscriptions: [
                {id: 1, email: 'yuz@mail.com', interval_days: 7},
                {id: 2, email: 'yu.zhou@mail.com', interval_days: 7}]},
            {id: 3, name: 'Phoenix', percent: 92, subscriptions: [
                {id: 1, email: 'zhour@company.com', interval_days: 1},
                {id: 2, email: 'jinpingx@gov.cn', interval_days: 1}]}
        ];
    // </Mock>
    $scope.avaiable_interval_days = [1, 3, 7];
    $scope.current_project = $scope.projects[0];
    $scope.join = function() {
        return Array.prototype.slice.call(arguments, 0).join('-');
    };
    $scope.humanize_days = function(days) {
        if(days == 1) return '1 day';
        else if(days == 7) return '1 week';
        else if(days < 7) return days + ' days';
        else throw 'Not support days > 7';
    };

    $scope.add_subscriptions = function(subscriptions) {
        subscriptions.unshift({email: localStorage['last_used_email'], interval_days: localStorage['last_used_interval'] || 1});
    };

    $scope.remove_subscription = function(subscription, project) {
        var idx = project.subscriptions.indexOf(subscription);
        project.subscriptions.splice(idx, 1);
        if(subscription.id) {
            if(!project.deleted_subscriptions) project.deleted_subscriptions = [];
            project.deleted_subscriptions.push(subscription);
        }
    };

    $scope.delete_project = function(project) {
        var title = 'Are you ABSOLUTELY sure?';
        var message = 'This action CANNOT be undone.<br />This will delete the ' + project.name + ' project permanently.';
        bootbox.confirm({title: title, message: message, callback: function(result) {
            if(result) {
                var idx = $scope.projects.indexOf(project);
                $scope.projects.splice(idx, 1);

                if(!$scope.deleted_projects) $scope.deleted_projects = [];
                $scope.deleted_projects.push(project);

                $('#config-modal ul.nav li:eq(' + idx +')').remove();
                var nextTab = $('#config-modal ul.nav li:eq(' + idx +') a,#config-modal ul.nav li:eq(0) a').last();
                if(nextTab) $(nextTab).tab('show');
                //TODO: Should create a new project after delete all projects
            }
        }});
    };
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
