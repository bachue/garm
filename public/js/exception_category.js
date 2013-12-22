define(['exception_project', 'jquery', 'exceptions_filters', 'bootstrap_switch'], function(project_promise, $) {
    var deferred = $.Deferred();
    $.when(project_promise).then(function(project) {
        deferred.resolve(project.controller('ExceptionCategory', function($scope, $state, $filter) {
console.log('category controller', $state.params);
            if (!$state.params.exception_category_id && $scope.current.exception_category)
                $state.params.exception_category_id = $scope.current.exception_category.id

            if ($state.params.exception_category_id) {
                $scope.current.exception_category = _.find($scope.current.project.exception_categories, function(category) {
                    return Number($state.params.exception_category_id) === category.id;
                });
            }

            if (!$scope.current.exception_category) {
                // TODO: In the future, should query exception category from remote
                var category_candidate = 
                    $filter('filterCategory')(
                        $filter('orderCategoryBy')(
                            $scope.current.project.exception_categories,
                            $scope.exception_category_order, true),
                        $scope.exception_search.scope, true)[0];

                if (category_candidate)
                    $state.go('application.exceptions.project.exception_category', {exception_category_id: category_candidate.id});
                return;
            }

            $scope.$broadcast('current_category_changed', $scope.current.exception_category); // TODO: Necessary?

            $state.go('application.exceptions.project.exception_category.exception');
        }));
    });
    return deferred.promise();
});