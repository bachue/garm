define(['controllers', 'jquery', 'underscore'], function(controllers, $, _) {
    return controllers.controller('Application', function($scope, $rootScope, $timeout, $location) {
        $('#config-modal').
            on('show.bs.modal', function() {
                $scope.projects_backup = angular.copy($scope.projects);
            }).
            on('hidden.bs.modal', function() {
                $timeout(function() {
                    if(!$scope.config_saving_confirmed) $scope.projects = $scope.projects_backup;
                    $scope.config_change_commands = [];
                });
            });

        $('#edit-project-modal').on('shown.bs.modal', function() {
                $('#edit-project-modal input:first').focus();
            });

        $('#edit-project-modal input[name=project_name]').on('keypress', function(e) {
            if(e.charCode === 13 && $scope.valid_project() === false) {
                $scope.submit_project();
                $scope.$apply();
            }
        });

        $scope.controller_names = ['Exceptions'];

        // <Mock> TODO: Remove Mock
            $.ajax({url: '/mock-data.json', async: false, dataType: 'json', success: function(data) { $scope.projects = data; }});
        // </Mock>
        $scope.avaiable_interval_days = [1, 3, 7];
        $scope.config_change_commands = [];

        $scope.humanize_days = function(days) {
            if(days === 1) return '1 day';
            else if(days === 7) return '1 week';
            else if(days < 7) return days + ' days';
            else throw 'Not support days > 7';
        };

        $scope.set_current_project = function(project) {
            $rootScope.current_project = project;
        };

        $scope.add_subscription = function(project) {
            var subscription = {interval_days: 1};
            project.subscriptions.unshift(subscription);
            $scope.config_change_commands.push({cmd: 'add_subscription', subscription: subscription, project: project});

            $timeout(function() {
                $('#config-project-' + project.name + ' input[type=email]:first').focus();
            });
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
                $('a[data-ng-href="#config-project-' + $scope.edit_project_name + '"]').tab('show');
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

            $timeout(function() {
                $('#config-modal ul.nav li:eq(' + idx +')').remove();

                var nextTab = _.last($('#config-modal ul.nav li:eq(' + idx +') a,#config-modal ul.nav li:eq(0) a'));
                if(nextTab) $(nextTab).tab('show');
                else $scope.add_project();
            });
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

            if($scope.projects.indexOf($rootScope.current_project) == -1) {
                $scope.set_current_project($scope.projects[0]);
            }

            var commands = {commands: generate_commands($scope.config_change_commands)};
            //convert cmd here
            $.ajax({type: 'POST', url: '/projects/run_commands', data: commands, dataType: 'json', success: function() {

            }});
            //TODO: Think about how to assign id to new projects and subscriptions
            console.log($scope.config_change_commands);

            function generate_commands (objects) {
                var commands = _.map(objects, function(object, ret) {
                    if (object.cmd === 'add_project') {
                        ret = {project_name: object.project.name};
                    } else if (object.cmd === 'add_subscription') {
                        ret = {subscription: {email: object.subscription.email, interval_days: object.subscription.interval_days}};
                        if (object.project.id) ret['project_id'] = object.project.id;
                        else ret['project_name'] = object.project.name;
                    } else if (object.cmd === 'del_subscription') {
                        ret = {subscription_id: object.subscription_id, project_id: object.project.id};
                    } else if (object.cmd === 'edit_project') {
                        ret = {project_id: object.project.id, project_name: object.project.name};
                    } else if (object.cmd === 'edit_subscription') {
                        ret = {project_id: object.project.id, subscription: {id: object.subscription.id, email: object.subscription.email, interval_days: object.subscription.interval_days}};
                    } else {
                        return object;
                    }
                    return _.extend(ret, {cmd: object.cmd});
                });
                return JSON.stringify(commands);
            }
        };

        $scope.check_config = function() {
            return $(config_modal_form).hasClass('ng-invalid');
        };
    });
});
