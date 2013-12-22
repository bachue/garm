define(['application', 'jquery', 'underscore', 'moment', 'exceptions_loader', 'bootstrap_switch', 'lib/jquery.notification'], function(application_promise, $, _, moment, exceptions_loader) {
    var deferred = $.Deferred();
    $.when(application_promise, exceptions_loader).then(function(application, exceptions) {
        deferred.resolve(application.controller('Exceptions', function($scope, $state, $timeout, $interval) {
            var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
            var DATE_FORMAT_WITH_TIMEZONE = 'YYYY-MM-DD HH:mm:ss Z';

            $scope.get_utc_string_without_tz = function(timestamp) {
                return moment.unix(timestamp).utc().format(DATE_FORMAT);
            };

            $scope.get_utc_string_with_tz = function(timestamp) {
                return $scope.get_utc_string_without_tz(timestamp) + ' UTC';
            };

            $scope.get_locale_string_with_tz = function(timestamp, tz) {
                return moment.unix(timestamp).zone(tz || '+00:00').format(DATE_FORMAT_WITH_TIMEZONE);
            };

            $scope.show_the_view = function() {
                return Boolean($scope.current.project && $scope.current.exception_category && $scope.current.exception);
            }

            $scope.set_editing_comment = function(comment) {
                $scope.current.exception_category.editing_comment = true;
                $scope.current.exception_category.comment_draft = comment;
            };

            $scope.unset_editing_comment = function(draft) {
                $scope.current.exception_category.editing_comment = false;
                $scope.current.exception_category.comment = draft;

                $.ajax({
                    url: '/projects/' + $scope.current.project.name + '/exception_categories/' + $scope.current.exception_category.id,
                    method: 'POST', data: {comment: draft}});
            };

            if (!$scope.exception_search)
                $scope.exception_search = {keyword: '', scope: 'All'};

            $scope.set_search_options = function(key, value) {
                if (key === 'keyword') throw 'keyword cannot be used as a key in search options';
                $scope.exception_search[key] = value;
            };

            $scope.truncate = function(string, length) {
                if (string.length <= length) return string;
                else {
                    var arr = string.split('');
                    arr.splice(length - 3, string.length, '.', '.', '.');
                    return arr.join('');
                }
            };

            $scope.toggle_exception_category_label = function(init) {
                var init = !!init;
                var labels = $('.label.exception-category-stats-label');

                if (init) { // Just when it has inited, no status will change
                    if (!$scope.exception_category_stats_info)
                        $scope.exception_category_stats_info = 'C';
                } else {
                    if ($scope.exception_category_stats_info == 'C') {
                        $scope.exception_category_stats_info = 'F';
                    } else if ($scope.exception_category_stats_info == 'F') {
                        $scope.exception_category_stats_info = 'C';
                    } else throw 'Error here';
                }

                if($scope.exception_category_stats_info == 'F') {
                    update_label_stats(function(category) { return category.frequence < 100 ? category.frequence.toFixed(2) : 'Max'; });
                } else if ($scope.exception_category_stats_info == 'C') {
                    update_label_stats(function(category) { return category.exception_size; });
                } else {
                    throw 'Not implemented this stats info';
                };

                function update_label_stats(func) {
                    _.each($scope.projects, function(project) {
                        _.each(project.exception_categories, function(category) {
                            category.label_stats = func(category);
                        });
                    });
                }
            };

            $scope.exception_category_stats_tooltip = function() {
                return {
                    C: 'Count',
                    F: 'Frequence'
                }[$scope.exception_category_stats_info];
            };

            $scope.order_exception_category = function() {
                var orders = ['datetime', 'count', 'frequence'];
                var idx = _.indexOf(orders, $scope.exception_category_order);
                idx = (idx + 1) % orders.length;
                $scope.exception_category_order = orders[idx];
            };
            if(!$scope.exception_category_order) $scope.order_exception_category();

            $scope.exception_category_order_label = function() {
                return {
                    datetime: 'T',
                    count: 'C',
                    frequence: 'F'
                }[$scope.exception_category_order];
            };

            $scope.exception_category_order_tooltip = function() {
                return 'Order by: ' + {
                    datetime: 'Time',
                    count: 'Occurrence Count',
                    frequence: 'Occurrence Frequence'
                }[$scope.exception_category_order];
            };

            $scope.show_search = function() {
                return $scope.exception_search.keyword.length > 0 &&
                       $scope.exception_search.focusing;
            };

            $scope.focus_on_search = function() {
                $scope.exception_search.focusing = true;
            };

            $scope.blur_on_search = function() {
                $timeout(function() {
                    delete $scope.exception_search.focusing;
                }, 10);
            };

            $scope.start_searching = function() {
                if (!$scope.exception_search.keyword.length) return;
                var request_id = Math.random();
                $.ajax({
                    url: '/projects/' + $scope.current.project.name + '/_search',
                    dataType: 'json', data: {q: $scope.exception_search.keyword},
                    success: function(data) {
                        $scope.exception_search.results = data;
                        $scope.$apply();
                    }
                });
            };

            $scope.switch_to_exception = function(category_id, exception_id) {
                $state.go('.project.exception_category.exception', {exception_category_id: category_id, exception_id: exception_id});
            };

            $scope.load_exceptions_from_remote = function(project_name, category_id, exception_id) {
                //TODO: to implement it
                throw 'Not implemented';
            };

            $scope.set_current_project = function(project) {
                $state.go('.project', {project_name: project.name});
            }

            $scope.set_current_exception_category = function(exception_category) {
                $state.go('.project.exception_category', {exception_category_id: exception_category.id});
            }

            $scope.set_current_exception = function(exception_category, exception) {
                $scope.switch_to_exception(exception_category.id, exception.id);
            }

            // Just regard it's controller initialize code, only run once
            if (!_.contains($scope.inited_controllers, 'Exceptions')) {
                _.each(exceptions, function(exception_categories, project_id) {
                    _.find($scope.projects, function(project) { return project.id === Number(project_id); }).
                        exception_categories = exception_categories;
                    _.each(exception_categories, function(exception_category) {
                        exception_category.latest_time = _.max(_.map(exception_category.exceptions, function(exception) {
                            return exception.time_utc;
                        }));
                    });
                });

                $scope.current.controller = 'Exceptions';
                $scope.inited_controllers.push('Exceptions');

                $scope.toggle_exception_category_label(true);

                $('.make-switch').bootstrapSwitch(false);
                $('.make-switch').off('switch-change').on('switch-change', function(e, data) {
                    $scope.current.exception_category.resolved = data.value;
                    $scope.$apply();
                    $.ajax({url: '/projects/' + $scope.current.project.name + '/exception_categories/' + $scope.current.exception_category.id,
                        method: 'POST', data: {resolved: data.value}}).done(function(percent) {
                            $scope.current.project.percent = Number(percent);
                            $scope.$apply();
                        });
                });

                // For flush exceptions from remote in each interval of time
                $interval(function() {
                    var data = _.reduce($scope.projects, function(obj, project) {
                        obj[project.name] = _.reduce(project.exception_categories, function(obj, category) {
                            obj[category.id] = category.latest_time;
                            return obj
                        }, {});
                        return obj;
                    }, {});
                    if (!_.size(data)) return;
                    $.ajax({url: '/projects/_flush', dataType: 'JSON', data: {d: JSON.stringify(data)}}).done(function(data) {
                        _.each(data, function(hash, project_name) {
                            var project = _.find($scope.projects, function(project) { return project.name == project_name; })
                            if (project) {
                                var messages = [];
                                if (hash['new']) {
                                    _.each(hash['new'], function(category) {
                                        if (!project.exception_categories) project.exception_categories = [];
                                        project.exception_categories.push(category);
                                        if (!category.resolved)
                                            messages.push({type: category.exception_type, message: category.message});
                                    });
                                }

                                if (hash['old']) {
                                    _.each(hash['old'], function (new_exceptions, category_id){
                                        var category = _.find(project.exception_categories, function(category) { return category.id == category_id; })
                                        if (category) {
                                            _.each(new_exceptions.exceptions, function(exception) { category.exceptions.push(exception); });
                                            category.exception_size = new_exceptions.exception_size;
                                            category.frequence = new_exceptions.frequence;
                                            category.version_distribution = new_exceptions.version_distribution;
                                            category.date_distribution = new_exceptions.date_distribution;
                                            if (!category.resolved)
                                                messages.push({type: category.exception_type, message: category.message});
                                        };
                                    });
                                }
                                _.each(project.exception_categories, function(exception_category) {
                                    exception_category.latest_time = _.max(_.map(exception_category.exceptions, function(exception) {
                                        return exception.time_utc;
                                    }));
                                });
                                $scope.toggle_exception_category_label(true); // To update stats again
                                notify(messages);
                            }
                        });
                        $scope.$apply();
                    });
                }, 30000);
            }

            if (!$state.params.project_name)
                $scope.set_current_project($scope.projects[0]);

            function notify(messages) {
                _.each(_.uniq(messages), function(message) {
                    $.notification({iconUrl: 'img/branding-fallback.png', title: message.type, body: message.message}).then(function(notification) {
                        setTimeout(function() { notification.close(); }, 5000)
                    });
                });
            }
        }));
    });
    return deferred.promise();
});