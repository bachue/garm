define(['application', 'jquery', 'underscore', 'moment', 'exceptions_loader', 'bootstrap_switch'], function(application_promise, $, _, moment, exceptions_loader) {
    var deferred = $.Deferred();
    $.when(application_promise, exceptions_loader).then(function(application, exceptions) {
        deferred.resolve(application.controller('Exception', function($scope, $rootScope, $routeParams, $timeout, $interval, $location) {
            _.each(exceptions, function(exception_categories, project_id) {
                _.find($scope.projects, function(project) { return project.id === Number(project_id); }).
                    exception_categories = exception_categories;
                _.each(exception_categories, function(exception_category) {
                    exception_category.latest_time = _.max(_.map(exception_category.exceptions, function(exception) {
                        return exception.time_utc;
                    }));
                });
            });

            $rootScope.current_controller = 'Exceptions';

            if ($routeParams.project) {
                $rootScope.current_project = _.find($scope.projects, function(project) {
                    return $routeParams.project === project.name;
                });

                if ($routeParams.category_id && $rootScope.current_project) {
                    $rootScope.current_category = _.find($rootScope.current_project.exception_categories, function(category) {
                        return category.id === Number($routeParams.category_id);
                    });

                    if ($routeParams.exception_id && $rootScope.current_category) {
                        $rootScope.current_exception = _.find($rootScope.current_category.exceptions, function(exception) {
                            return exception.id === Number($routeParams.exception_id);
                        });

                        if($routeParams.tab && $rootScope.current_exception) {
                            $rootScope.current_exception.tabs = ['Summary', 'Backtrace'].concat(_.keys($scope.current_exception.ext || {}));
                            $rootScope.current_tab = _.find($rootScope.current_exception.tabs, function(tab) {
                                return $routeParams.tab === tab;
                            });
                        }
                    }
                }
            }

            if (!$rootScope.current_project) $rootScope.current_project = $scope.projects[0];
            if (!$rootScope.current_category) $rootScope.current_category = $rootScope.current_project.exception_categories[0];
            if (!$rootScope.current_exception) $rootScope.current_exception = $rootScope.current_category.exceptions[0];
            if (!$rootScope.current_tab || !_.find($rootScope.current_exception.tabs, function(tab) { return tab === $rootScope.current_tab }))
                $rootScope.current_tab = 'Summary';

            var update_path = function() {
                // DOESN'T ENABLE IT NOW
                // var path = '/exceptions/';
                // path += [$rootScope.current_project.name,
                //          $rootScope.current_category.id,
                //          $rootScope.current_exception.id,
                //          $rootScope.current_tab].join('/');
                // $location.path(path);
            };

            if (!$routeParams.project) update_path();

            $rootScope.current_exception.tabs = _.keys($rootScope.current_exception.ext || {});
            $rootScope.current_exception.all_tabs = ['Summary', 'Backtrace'].concat($rootScope.current_exception.tabs);

            // TODO: If these variable changes, please change the hash in URL

            $('.make-switch').bootstrapSwitch(false);
            if ($rootScope.current_category) $('.make-switch').bootstrapSwitch('setState', $rootScope.current_category.resolved);

            $('.make-switch').off('switch-change').on('switch-change', function(e, data) {
                $timeout(function() {
                    $rootScope.current_category.resolved = data.value;
                });
                $.ajax({url: '/projects/' + $rootScope.current_project.name + '/exception_categories/' + $rootScope.current_category.id,
                    method: 'POST', data: {resolved: data.value}}).done(function(percent) {
                        $timeout(function() {
                            $rootScope.current_project.percent = Number(percent);
                        });
                    });
            });

            if(!$rootScope.exception_flusher) {
                $rootScope.exception_flusher = $interval(function() {
                    var data = _.reduce($scope.projects, function(obj, project) {
                        obj[project.name] = _.reduce(project.exception_categories, function(obj, category) {
                            obj[category.id] = category.latest_time;
                            return obj
                        }, {});
                        return obj;
                    }, {});
                    $.ajax({url: '/projects/_flush', dataType: 'JSON', data: {d: JSON.stringify(data)}}).done(function(data) {
                        _.each(data, function(hash, project_name) {
                            var project = _.find($scope.projects, function(project) { return project.name == project_name; })
                            if (project) {
                                if (hash['new'])
                                    project.exception_categories.push.apply(project.exception_categories, hash['new']);
                                if (hash['old']) {
                                    _.each(hash['old'], function (new_exceptions, category_id){
                                        var category = _.find(project.exception_categories, function(category) { return category.id == category_id; })
                                        category.exceptions.push.apply(category.exceptions, new_exceptions.exceptions);
                                        category.exception_size += new_exceptions.exception_size;
                                    });
                                }
                                _.each(project.exception_categories, function(exception_category) {
                                    exception_category.latest_time = _.max(_.map(exception_category.exceptions, function(exception) {
                                        return exception.time_utc;
                                    }));
                                });
                            }
                        });
                    });
                }, 5000);
            }

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

            $scope.get_tab_name = function(tab) {
                return tab.toLowerCase();
            };

            $scope.set_current_category = function(category) {
                $rootScope.current_category = category;
                $scope.set_current_exception(category.exceptions[0]);
            };

            $scope.set_current_exception = function(exception) {
                $rootScope.current_exception = exception;
            };

            $scope.set_editing_comment = function(comment) {
                $rootScope.current_category.editing_comment = true;
                $rootScope.current_category.comment_draft = comment;
            };

            $scope.unset_editing_comment = function(draft) {
                $rootScope.current_category.editing_comment = false;
                $rootScope.current_category.comment = draft;

                $.ajax({url: '/projects/' + $rootScope.current_project.name + '/exception_categories/' + $rootScope.current_category.id,
                    method: 'POST', data: {comment: draft}});
            };

            $scope.switch_to_tab = function(tab, $event) {
                $event.preventDefault();
                $rootScope.current_tab = tab;
                update_path();
                $($event.target).tab('show');
            };

            if (!$rootScope.exception_search) $rootScope.exception_search = {keyword: '', scope: 'All'};
            $scope.set_search_options = function(key, value) {
                if (key === 'keyword') throw 'keyword cannot be used as a key in search options';
                $rootScope.exception_search[key] = value;
            };

            $scope.truncate = function(string, length) {
                if (string.length <= length) return string;
                else {
                    var arr = string.split('');
                    arr.splice(length - 3, string.length, '.', '.', '.');
                    return arr.join('');
                }
            };

            $scope.show_search = function() {
                return $rootScope.exception_search.keyword.length > 0 && $rootScope.exception_search.focusing;
            };

            $scope.focus_on_search = function() {
                $rootScope.exception_search.focusing = true;
            };

            $scope.blur_on_search = function() {
                $timeout(function() {
                    delete $rootScope.exception_search.focusing;
                }, 10);
            };

            $scope.start_searching = function() {
                if (!$rootScope.exception_search.keyword.length) return;
                var request_id = Math.random();
                $.ajax({url: '/mock-search.json', dataType: 'json', success: function(data) {
                    $timeout(function() {
                        $rootScope.exception_search.results = data;
                    });
                }});
            };

            $scope.switch_to_exception = function(category_id, exception_id) {
                var category = _.find($rootScope.current_project.exception_categories, function(category) { return category.id == category_id; }), exception;
                if (category) {
                    exception = _.find(category.exceptions, function(exception) { return exception.id == exception_id; });
                }
                if (category && exception) {
                    $rootScope.current_category = category;
                    $rootScope.current_exception = exception;
                } else {
                    $scope.load_exceptions_from_remote($rootScope.current_project.name, category_id, exception_id);
                    $scope.switch_to_exception(category_id, exception_id);
                }
            };

            $scope.load_exceptions_from_remote = function(project_name, category_id, exception_id) {
                //TODO: to implement it
                throw 'Not implemented';
            };

            var SUMMARY_KEYS_FROM_EXCEPTION = ['svr_host', 'svr_ip', 'pid', 'version', 'seen_on_current_version', 'description', 'position'];
            var SUMMARY_KEYS_FROM_CATEGROY  = ['first_seen_on', 'first_seen_in'];
            var SUMMARY_KEYS_ORDER = ['svr_host', 'svr_ip', 'pid', 'svr_time', 'version', 'first_seen_on', 'first_seen_in', 'seen_on_current_version', 'description', 'position'];
            var SUMMARY_KEYS_I18N = {
                svr_host:                'Server Hostname',
                svr_ip:                  'Server IP',
                pid:                     'PID',
                svr_time:                'Server Time',
                version:                 'Version',
                first_seen_in:           'First Seen in',
                first_seen_on:           'First Seen on',
                seen_on_current_version: 'Seen on current version',
                description:             'Description',
                position:                'Postion'
            };

            if(!$rootScope.current_exception.all_summaries) {
                $rootScope.current_exception.all_summaries = (function(exception, category) {
                    var summaries_from_exception = _.pick(exception, SUMMARY_KEYS_FROM_EXCEPTION);
                    summaries_from_exception['svr_time'] = $scope.get_locale_string_with_tz(exception.time_utc, exception.svr_zone);
                    var summaries_from_category = _.pick(category, SUMMARY_KEYS_FROM_CATEGROY);
                    summaries_from_category['first_seen_on'] = $scope.get_utc_string_with_tz(category.first_seen_on);
                    var summaries = _.extend(summaries_from_exception, summaries_from_category, exception.summaries);
                    summaries = _.reduce(summaries, function(obj, value, key) { 
                        if (value) obj[key] = value;
                        return obj;
                    }, {});
                    summaries = _.map(summaries, function(value, key) { return {key: SUMMARY_KEYS_I18N[key] ? SUMMARY_KEYS_I18N[key] : key, value: value}; });
                    summaries = _.sortBy(summaries, function(element) {
                        var idx = SUMMARY_KEYS_ORDER.indexOf(element.key);
                        return idx > 0 ? idx : SUMMARY_KEYS_ORDER.length;
                    });
                    return summaries;
                })($rootScope.current_exception, $rootScope.current_category);
            }

            if (_.isString($rootScope.current_exception.backtrace)) {
                $rootScope.current_exception.backtrace = $rootScope.current_exception.backtrace.split('\n');
            }
        }));
    });
    return deferred.promise();
});
