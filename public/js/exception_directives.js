define(['directives', 'chart'], function(directives, Chart) {
    directives.directive('initVersionsChart', function() {
        return {
            link: function(scope, element) {
                var pairs = scope.current_category.version_distribution;
                if (pairs.length <= 1) { return; } // Won't show the chart if only one version

                var versions = _.map(pairs, function(pair) { return pair.version; });
                var counts = _.map(pairs, function(pair) { return pair.count; });

                var data = {
                    labels: versions,
                    datasets: [
                        {
                            fillColor: 'rgba(151, 187, 205, 0.5)',
                            strokeColor: 'rgba(151, 187, 205, 1)',
                            data: counts
                        }
                    ]
                };
                var options = {scaleOverride: true, scaleSteps: _.max(counts), scaleStepWidth: 1};

                element.html('');
                var chart = new Chart(element.get(0).getContext('2d'));
                chart.Bar(data, options);
            }
        };
    });

    directives.directive('initDatesChart', function() {
        return {
            link: function(scope, element) {
                var pairs = scope.current_category.date_distribution;
                if (pairs.length <= 1) { return; } // Won't show the chart if only one version

                var dates = _.map(pairs, function(pair) { return pair.date; });
                var counts = _.map(pairs, function(pair) { return pair.count; });

                var data = {
                    labels: dates,
                    datasets: [
                        {
                            strokeColor : 'rgba(220, 220, 220, 1)',
                            pointColor : 'rgba(220, 220, 220, 1)',
                            pointStrokeColor : "#fff",
                            data: counts
                        }
                    ]
                };
                var options = {scaleOverride: true, scaleSteps: _.max(counts), scaleStepWidth: 1,
                               scaleLineColor: 'transparent', scaleShowLabels: false, scaleFontColor: 'transparent'};

                var chart = new Chart(element.get(0).getContext('2d'));
                chart.Line(data, options);

                scope.$watch('current_tab', function() {
                    if (scope.current_tab == 'Versions') // Avoid showing 2 charts in a tab
                        element.hide();
                    else
                        element.show();
                });
            }
        };
    });
});