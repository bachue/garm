define(['exception_category', 'jquery'], function(category_promise, $) {
    var deferred = $.Deferred();
    $.when(category_promise).then(function(category) {
        deferred.resolve(category.controller('Exception', function($scope, $state) {
            $scope.current.exception = _.find($scope.current.exception_category.exceptions, function(exception) {
                return Number($state.params.exception_id) === exception.id;
            });

            if ($scope.current.exception) {
                $scope.$broadcast('current_exception_changed', $scope.current.exception); // TODO: Necessary?

                $scope.current.exception.tabs = _.keys($scope.current.exception.ext || {});
                $scope.current.exception.all_tabs = ['Summary', 'Backtrace'].concat($scope.current.exception.tabs);

                if ($scope.current.exception_category.version_distribution.length > 1)
                    $scope.current.exception.all_tabs.push('Versions');

                if ($scope.current.exception.uuid)
                    $scope.current.exception.all_tabs.push('Track');

                if (!$state.params.tab_name) {
                    var tab = $scope.current.exception.all_tabs[0];
                    if($scope.current.exception_tab && _.contains($scope.current.exception.all_tabs, $scope.current.exception_tab))
                        tab = $scope.current.exception_tab;
                    $state.go('.tab', {tab_name: tab});
                }
            }
            else $state.go('^'); // If exception can't be found, it means bug happened!
        }));
    });
    return deferred.promise();
});