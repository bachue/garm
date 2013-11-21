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
    $rootScope.current_exception.tabs.unshift('Summary', 'Backtrace');

    // TODO: If these variable changes, please change the hash in URL

    $('.make-switch').bootstrapSwitch(false);
    if ($rootScope.current_category) $('.make-switch').bootstrapSwitch('setState', $rootScope.current_category.important);
    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    var DATE_FORMAT_WITHOUT_TIMEZONE = 'YYYY-MM-DD HH:mm:ss';
    var DATE_FORMAT_WITH_TIMEZONE    = 'YYYY-MM-DD HH:mm:ss z';

    $scope.get_utc_string_without_tz = function(timestamp) {
        return moment.unix(timestamp).utc().format(DATE_FORMAT_WITHOUT_TIMEZONE);
    };

    $scope.get_utc_string_with_tz = function(timestamp) {
        return moment.unix(timestamp).utc().format(DATE_FORMAT_WITH_TIMEZONE);
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
        // TODO: To send request here
    };
});
