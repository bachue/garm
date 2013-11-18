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
                $scope.config_change_commands = [];
            }
        });

    $('#edit-project-modal').on('shown.bs.modal', function() {
            $('#edit-project-modal input:first').focus();
        });

    $('#edit-project-modal input[name=project_name]').on('keypress', function(e) {
        if(e.charCode === 13 && $scope.valid_project() === false)
            $scope.submit_project();
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
    $scope.config_change_commands = [];

    $scope.join = function() {
        return Array.prototype.slice.call(arguments, 0).join('-');
    };
    $scope.humanize_days = function(days) {
        if(days === 1) return '1 day';
        else if(days === 7) return '1 week';
        else if(days < 7) return days + ' days';
        else throw 'Not support days > 7';
    };

    $scope.add_subscription = function(project) {
        var subscription = {interval_days: 1};
        project.subscriptions.unshift(subscription);
        $scope.config_change_commands.push({cmd: 'add_subscription', subscription: subscription, project: project});

        setTimeout(function() {
            $('#' + $scope.join('config', 'project', project.name) + ' input[type=email]:first').focus();
        }, 200);
    };

    $scope.remove_subscription = function(subscription, project) {
        var idx = project.subscriptions.indexOf(subscription);
        project.subscriptions.splice(idx, 1);

        $scope.config_change_commands = _.reject($scope.config_change_commands, function(cmd) {
            return cmd.subscription === subscription;
        });
        if(subscription.id) {
            $scope.config_change_commands.push({cmd: 'del_subscription', subscription_id: subscription.id, project: project});
        }
    };

    var CREATE_PROJECT_STRING = 'Create Project';
    var EDIT_PROJECT_STRING = 'Edit Project';

    $scope.add_project = function() {
        $scope.edit_project_modal_title = CREATE_PROJECT_STRING;
        $('#edit-project-modal').modal();
    };

    $scope.edit_project = function(project) {
        $scope.edit_project_modal_title = EDIT_PROJECT_STRING;
        $scope.edit_project_name = project.name;
        $scope.edit_project_original_name = project.name;
        $scope.edit_project_config = project.ext_config;
        $('#edit-project-modal').modal();
    };

    $scope.submit_project = function() {
        if($scope.edit_project_modal_title === CREATE_PROJECT_STRING) {
            var project = {name: $scope.edit_project_name, percent: 100, subscriptions: [], ext_config: $scope.edit_project_config};
            $scope.projects.push(project);
            $scope.config_change_commands.push({cmd: 'add_project', project: project});
        } else if($scope.edit_project_modal_title === EDIT_PROJECT_STRING) {
            var project = _.find($scope.projects, function(project) { return project.name === $scope.edit_project_original_name; });
            project.name = $scope.edit_project_name;
            project.ext_config = $scope.edit_project_config;

            // if this project is existed in backend, 
            // try to find last edit cmd or create an edit cmd, 
            // otherwise, just do nothing because there should be a 'add_project' cmd existed
            if(project.id) {
                var last = _.find($scope.config_change_commands, function(cmd) {
                    return cmd.cmd === 'edit_project' && cmd.project === project;
                });

                if(!last) {
                    $scope.config_change_commands.push({cmd: 'edit_project', project: project});
                }
            }
        }

        $('#edit-project-modal').modal('hide');
        $('#edit-project-modal').on('hidden.bs.modal', function() {
            $('a[data-ng-href="#' + $scope.join('config', 'project', $scope.edit_project_name) + '""]').tab('show');
            $('#edit-project-modal').off('hidden.bs.modal');
            delete $scope.edit_project_modal_title;
            delete $scope.edit_project_name;
            delete $scope.edit_project_origin_name;
            delete $scope.edit_project_config;
        });
    };

    $scope.valid_project = function() {
        if($('#edit-project-modal input[name=project_name]').hasClass('ng-invalid'))
            return true;
        if($scope.edit_project_modal_title === EDIT_PROJECT_STRING && $scope.edit_project_name === $scope.edit_project_original_name) return false;
        return _.contains(_.map($scope.projects, function(project) { return project.name; }), $scope.edit_project_name);
    };

    $scope.delete_project = function(project) {
        var idx = $scope.projects.indexOf(project);
        $scope.projects.splice(idx, 1);

        // clear all cmds related to this project
        $scope.config_change_commands = _.reject($scope.config_change_commands, function(cmd) {
            return cmd.project === project;
        });

        // if this project is not existed in backend, 'add_project' cmd should have ben deleted
        if(project.id) {
            $scope.config_change_commands.push({cmd: 'del_project', project_id: project.id});
        }

        $('#config-modal ul.nav li:eq(' + idx +')').remove();
        
        var nextTab = _.last($('#config-modal ul.nav li:eq(' + idx +') a,#config-modal ul.nav li:eq(0) a'));
        if(nextTab) $(nextTab).tab('show');
        else $scope.add_project();
    };

    $scope.update_subscription = function(subscription, project) {
        if(subscription.id) {
            var last = _.find($scope.config_change_commands, function(cmd) {
                return cmd.cmd === 'edit_subscription' && cmd.subscription === subscription;
            });

            if(!last) {
                $scope.config_change_commands.push({cmd: 'edit_subscription', subscription: subscription, project: project});
            }
        }
    };

    $scope.set_subscription_interval_days = function(day, subscription, project) {
        subscription.interval_days = day;
        $scope.update_subscription(subscription, project);
    };

    $scope.save_config = function() {
        $scope.config_saving_confirmed = true;
        //TODO: Send cmds to backend
        console.log($scope.config_change_commands);
    };

    $scope.check_config = function() {
        return $(config_modal_form).hasClass('ng-invalid');
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
