define(['exception_category', 'jquery', 'bootstrap_switch'], function(category_promise, $) {
    var deferred = $.Deferred();
    $.when(category_promise).then(function(category) {
        deferred.resolve(category.controller('Exception', function($scope, $filter, $state) {
console.log('exception controller', $state.params);
            if (!$state.params.exception_id && $scope.current.exception)
                return $state.go('application.exceptions.project.exception_category.exception', {exception_id: $scope.current.exception.id});

            if ($state.params.exception_id) {
                $scope.current.exception = _.find($scope.current.exception_category.exceptions, function(exception) {
                    return Number($state.params.exception_id) === exception.id;
                });
            }

            if (!$scope.current.exception) {
                var exception_candidate = $filter('orderBy')($scope.current.exception_category.exceptions, 'time_utc', true)[0];
                return $state.go('application.exceptions.project.exception_category.exception', {exception_id: exception_candidate.id});
            }

            $scope.init_switch = function() {
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
            };

            $('.make-switch').bootstrapSwitch('setState', $scope.current.exception_category.resolved, true);

            $scope.$broadcast('current_exception_changed', $scope.current.exception); // TODO: Necessary?

            $state.go('application.exceptions.project.exception_category.exception.tab');
        }));
    });
    return deferred.promise();
});