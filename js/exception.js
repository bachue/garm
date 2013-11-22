garmApp.application.exception = garmApp.application.controller('Exception', function($scope, $rootScope, $routeParams) {
    $rootScope.current_controller = 'Exceptions';

    if($routeParams.project) {
        $rootScope.current_project = _.find($scope.projects, function(project) {
            return $routeParams.project === project.name;
        });

        if ($routeParams.category_id) {
            $rootScope.current_category = _.find($rootScope.current_project.exception_categories, function(category) {
                return category.id === Number($routeParams.category_id);
            });

            if ($routeParams.exception_id) {
                $rootScope.current_exception = _.find($rootScope.current_category.exceptions, function(exception) {
                    return exception.id === Number($routeParams.exception_id);
                });

                if($routeParams.tab) {
                    $rootScope.current_exception.tabs = _.keys($scope.current_exception.ext);
                    $rootScope.current_tab = _.find($rootScope.current_exception.tabs, function(tab) {
                        return $routeParams.tab === tab;
                    });
                }
            }
        }
    }

    if(!$rootScope.current_project) $rootScope.current_project = $scope.projects[0];
    if(!$rootScope.current_category) $rootScope.current_category = $rootScope.current_project.exception_categories[0];
    if(!$rootScope.current_exception) $rootScope.current_exception = $rootScope.current_category.exceptions[0];
    if(!$rootScope.current_tab) $rootScope.current_tab = 'Summary';

    $rootScope.current_exception.tabs = _.keys($rootScope.current_exception.ext);
    $rootScope.current_exception.all_tabs = ['Summary', 'Backtrace'].concat($rootScope.current_exception.tabs);

    // TODO: If these variable changes, please change the hash in URL

    $('.make-switch').bootstrapSwitch(false);
    if ($rootScope.current_category) $('.make-switch').bootstrapSwitch('setState', $rootScope.current_category.important);

    var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';
    var DATE_FORMAT_WITH_TIMEZONE = 'YYYY-MM-DD HH:mm:ss Z';

    $scope.get_utc_string_without_tz = function(timestamp) {
        return moment.unix(timestamp).utc().format(DATE_FORMAT);
    };

    $scope.get_utc_string_with_tz = function(timestamp) {
        return $scope.get_utc_string_without_tz(timestamp) + ' UTC';
    };

    $scope.get_locale_string_with_tz = function(timestamp, tz) {
        return moment.unix(timestamp).zone(tz).format(DATE_FORMAT_WITH_TIMEZONE);
    };

    $scope.get_tab_name = function(tab) {
        return tab.toLowerCase();
    }

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
        // TODO: To send request here
    };

    $scope.switch_to_tab = function(tab, $event) {
        $event.preventDefault();
        $($event.target).tab('show');
        $rootScope.current_tab = tab;
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

    $rootScope.current_exception.all_summaries = (function(exception, category) {
        var summaries_from_exception = _.pick(exception, SUMMARY_KEYS_FROM_EXCEPTION);
        summaries_from_exception['svr_time'] = $scope.get_locale_string_with_tz(exception.time_utc, exception.svr_zone);
        var summaries_from_category = _.pick(category, SUMMARY_KEYS_FROM_CATEGROY);
        summaries_from_category['first_seen_on'] = $scope.get_utc_string_with_tz(category.first_seen_on);
        var summaries = _.extend(summaries_from_exception, summaries_from_category, exception.summaries);
        summaries = _.map(summaries, function(value, key) { return {key: SUMMARY_KEYS_I18N[key] ? SUMMARY_KEYS_I18N[key] : key, value: value}; });
        summaries = _.sortBy(summaries, function(element) {
            var idx = SUMMARY_KEYS_ORDER.indexOf(element.key);
            return idx > 0 ? idx : SUMMARY_KEYS_ORDER.length;
        });
        return summaries;
    })($rootScope.current_exception, $rootScope.current_category);

    if(_.isString($rootScope.current_exception.backtrace)) {
        $rootScope.current_exception.backtrace = $rootScope.current_exception.backtrace.split('\n');
    }
});
