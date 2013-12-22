define(['exceptions', 'jquery', 'exceptions_filters'], function(exceptions_promise, $) {
    var deferred = $.Deferred();
    $.when(exceptions_promise).then(function(exceptions) {
        deferred.resolve(exceptions.controller('ExceptionProject', function($scope, $state) {
console.log('project controller', $state.params);
            if (!$state.params.project_name && $scope.current.project)
                $state.params.project_name = $scope.current.project.name

            if ($state.params.project_name) {
                $scope.current.project = _.find($scope.projects, function(project) {
                    return $state.params.project_name === project.name;
                });
            }

            if (!$scope.current.project)
                return $state.go('application.exceptions.project', {project_name: $scope.projects[0].name});

            $scope.$broadcast('current_project_changed', $scope.current.project); // TODO: Necessary?

            $state.go('application.exceptions.project.exception_category');
        }));
    });
    return deferred.promise();
});