garmApp.application.controller('Exception', function($scope, $rootScope, $routeParams) {
    $rootScope.current_controller = 'Exceptions';

    if($routeParams.project) {
        $rootScope.current_project = _.find($scope.projects, function(project) {
            return $routeParams.project === project.name;
        });

        if ($routeParams.category_id) {
            $scope.current_category = _.find($rootScope.current_project.exception_categories, function(category) {
                return category.id === Number($routeParams.category_id);
            });

            if ($routeParams.exception_id) {
                $scope.current_exception = _.find($scope.current_category.exceptions, function(exception) {
                    return exception.id === Number($routeParams.exception_id);
                });
            }
        }
    }

    if(!$rootScope.current_project) $rootScope.current_project = $scope.projects[0];
    if(!$rootScope.current_category) $rootScope.current_category = $scope.current_project.exception_categories[0];
    if(!$rootScope.current_exception) $rootScope.current_exception = $scope.current_category.exceptions[0];

    $('.make-switch').bootstrapSwitch(false);
    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    var DATE_FORMAT_WITHOUT_TIMEZONE = 'YYYY-MM-DD HH:mm:ss';
    var DATE_FORMAT_WITH_TIMEZONE    = 'YYYY-MM-DD HH:mm:ss z';

    $scope.get_utc_string_without_tz = function(timestamp) {
        return moment.unix(timestamp).utc().format(DATE_FORMAT_WITHOUT_TIMEZONE);
    };

    $scope.set_current_category = function(category) {
        $rootScope.current_category = category;
        $scope.set_current_exception(category.exceptions[0]);
    };

    $scope.set_current_exception = function(exception) {
        $rootScope.current_exception = exception;
    };
});
