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
    $('#config-modal').
        on('show.bs.modal', function() {
            $scope.projects_backup = angular.copy($scope.projects);
        }).
        on('hidden.bs.modal', function() {
            if(!$scope.config_saving_confirmed) {
                $scope.projects = $scope.projects_backup;
            }
        });

    // <Mock> TODO: Remove Mock
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

    $scope.add_subscriptions = function(project) {
        project.subscriptions.unshift({interval_days: 1});
        setTimeout(function() {
            $('#config-project-' + project.name + ' input[type=email]:first').focus();
        }, 200);
    };

    $scope.remove_subscription = function(subscription, project) {
        var idx = project.subscriptions.indexOf(subscription);
        project.subscriptions.splice(idx, 1);
        if(subscription.id) {
            if(!project.deleted_subscriptions) project.deleted_subscriptions = [];
            project.deleted_subscriptions.push(subscription);
        }
    };

    $scope.add_project = function() {
        bootbox.prompt('New project name?', function(name) {
            if (name) {
                if(_.contains(_.map($scope.projects, function(project) {return project.name;}), name)) {
                    var title = 'Cannot Create this Project';
                    var message = 'The ' + name + ' project is existed.<br />You should choose another name.';
                    bootbox.alert({title: title, message: message});
                    return;
                }

                $scope.projects.push({name: name, percent: 100, subscriptions: []});
                $scope.$apply();

                $('#config-modal ul.nav li:last a').tab('show');
            }
        });
    };

    $scope.delete_project = function(project) {
        var idx = $scope.projects.indexOf(project);
        $scope.projects.splice(idx, 1);

        if(!$scope.deleted_projects) $scope.deleted_projects = [];
        $scope.deleted_projects.push(project);

        $('#config-modal ul.nav li:eq(' + idx +')').remove();
        
        var nextTab = _.last($('#config-modal ul.nav li:eq(' + idx +') a,#config-modal ul.nav li:eq(0) a'));
        if(nextTab) $(nextTab).tab('show');
        else $scope.add_project();
    };

    $scope.save_config = function() {
        //TODO: Validation here
        $scope.config_saving_confirmed = true;
    };

    //TODO: Modified subscriptions
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
