define(['directives'], function(directives) {
    directives.directive('uniqEmail', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                scope.$watch('subscription.email', function(value) {
                    var emails = _.map(scope.project.subscriptions, function(sub) { return sub.email; });
                    ngModel.$setValidity('uniq', emails.length === _.uniq(emails).length);
                });
            }
        };
    });

    directives.directive('uniqProject', function() {
        return {
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                scope.$watch('edit_project_name', function(value) {
                    var names = _.map(scope.projects, function(project) { return project.name; });
                    ngModel.$setValidity('uniq', !_.contains(names, value));
                });
            }
        };
    });
});
