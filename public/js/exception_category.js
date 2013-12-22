define(['exception_project', 'jquery', 'exceptions_filters', 'bootstrap_switch'], function(project_promise, $) {
    var deferred = $.Deferred();
    $.when(project_promise).then(function(project) {
        deferred.resolve(project.controller('ExceptionCategory', function($scope, $state, $filter) {
console.log('category controller');
            $scope.current.exception_category = _.find($scope.current.project.exception_categories, function(category) {
                return Number($state.params.exception_category_id) === category.id;
            });

            if ($scope.current.exception_category) {
                $scope.$broadcast('current_category_changed', $scope.current.exception_category); // TODO: Necessary?

                if (!$state.params.exception_id) {
                    var exception =  $filter('orderBy')($scope.current.exception_category.exceptions, 'time_utc', true)[0];
                    $state.go('.exception', {exception_id: exception.id});
                }
            }
            else $state.go('^'); // If category can't be found, get back and rely on the default setting
            // TODO: In the future, should query exception category from remote
        }));
    });
    return deferred.promise();
});