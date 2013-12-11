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

    directives.directive('flashItem', function() {
        return {
            link: function(scope, element) {
                if (!element.hasClass('flash-on') && !scope.exception_category.inited) {
                    scope.exception_category.inited = true;
                    _.each(scope.exception_category.exceptions, function(exception) { exception.inited = true; });
                    flash(element);
                } else {
                    element.addClass('flash-off');
                }
            }
        }
    });

    directives.directive('flashParentItem', function() {
        return {
            link: function(scope, element) {
                var parent = element.parents('li');
                if (parent.hasClass('flash-off') && !scope.exception.inited) {
                    scope.exception.inited = true;
                    flash(parent);
                }
            }
        }
    });

    function flash(element) {
        element.removeClass('flash-off');
        element.addClass('flash-on');
        setTimeout(function() {
            element.addClass('flash-off');
        }, 500);
    }
});
