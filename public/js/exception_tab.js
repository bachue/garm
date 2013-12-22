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

define(['exception', 'jquery'], function(exception_promise, $) {
    var deferred = $.Deferred();
    $.when(exception_promise).then(function(exception) {
        deferred.resolve(exception.controller('ExceptionTab', function($scope, $state) {
console.log('tab controller', $state.params);
            $scope.switch_to_tab = function(tab, $event) {
                $event.preventDefault();
                $($event.target).tab('show');
                $state.go('application.exceptions.project.exception_category.exception.tab', {tab_name: tab});
            };

            if (!$scope.current.exception.all_tabs) {
                $scope.current.exception.tabs = _.keys($scope.current.exception.ext || {});
                $scope.current.exception.all_tabs = ['Summary', 'Backtrace'].concat($scope.current.exception.tabs);

                if ($scope.current.exception_category.version_distribution.length > 1)
                    $scope.current.exception.all_tabs.push('Versions');

                if ($scope.current.exception.uuid)
                    $scope.current.exception.all_tabs.push('Track');
            }

            if (!$state.params.tab_name && $scope.current.exception_tab) {
                return $state.go('application.exceptions.project.exception_category.exception.tab', {tab_name: $scope.current.exception_tab});
            }

            if ($state.params.tab_name) {
                $scope.current.exception_tab = _.find($scope.current.exception.all_tabs, function(tab_name) {
                   return $state.params.tab_name === tab_name;
                });
            }

            if (!$scope.current.exception_tab) {
                var tab = $scope.current.exception.all_tabs[0];
                return $state.go('application.exceptions.project.exception_category.exception.tab', {tab_name: tab});
                // TODO: Retry to recover the tab before
            }

            $scope.$broadcast('current_exception_tab_changed', $scope.current.exception_tab); // TODO: Necessary?

            if($scope.current.exception_tab == 'Summary' && !$scope.current.exception.all_summaries) {
                $scope.current.exception.all_summaries = (function(exception, category) {
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
                })($scope.current.exception, $scope.current.exception_category);
            } else if ($scope.current.exception_tab == 'Backtrace' && _.isString($scope.current.exception.backtrace)) {
                $scope.current.exception.backtrace = $scope.current.exception.backtrace.split('\n');
            }
        }));
    });
    return deferred.promise();
});