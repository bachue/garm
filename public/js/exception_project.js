define(['exceptions', 'jquery', 'exceptions_filters'], function(exceptions_promise, $) {
    var deferred = $.Deferred();
    $.when(exceptions_promise).then(function(exceptions) {
        deferred.resolve(exceptions.controller('ExceptionProject', function($scope, $state, $filter) {
            $scope.current.project = _.find($scope.projects, function(project) {
                return $state.params.project_name === project.name;
            });

            if ($scope.current.project) {
                $scope.$broadcast('current_project_changed', $scope.current.project); // TODO: Necessary?

                if (!$state.params.exception_category_id) {
                    var candidate = 
                        $filter('filterCategory')(
                            $filter('orderCategoryBy')(
                                $scope.current.project.exception_categories,
                                $scope.exception_category_order, true),
                            $scope.exception_search.scope, true)[0];
                    $state.go('.exception_category', {exception_category_id: candidate.id});
                }
            }
            else $state.go('^'); // If project can't be found, get back and rely on the default setting
        }));
    });
    return deferred.promise();
});