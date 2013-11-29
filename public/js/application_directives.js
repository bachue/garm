define(['directives'], function(directives) {

    return directives.directive('setPercentColor', function() {
        return {
            link: function(scope, element) {
                var project = scope.project || scope.current_project;
                element.addClass('label-' + getPercentColor(project.percent));
            }
        };
    });
});

var getPercentColor = function (percent) {
    var getPercentLevel = function(percent) {
        if (percent < 60) return 0;
        else if (percent < 80) return 1;
        else return 2;
    };
    return ['danger', 'warning', 'success'][getPercentLevel(percent)];
};
