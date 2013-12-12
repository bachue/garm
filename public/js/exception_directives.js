define(['directives', 'chart'], function(directives, Chart) {
    directives.directive('initVersionsChart', function() {
        return {
            link: function(scope, element) {
                var pairs = scope.current_category.version_distribution;
                if (pairs.length <= 1) { return; } // Won't show the chart if only one version

                var versions = _.map(pairs, function(pair) { return pair.version; });
                var counts = _.map(pairs, function(pair) { return pair.count; });

                var chart = new Chart(element.get(0).getContext('2d'));
                var data = {
                    labels: versions,
                    datasets: [
                        {
                            fillColor: 'rgba(151,187,205,0.5)',
                            strokeColor: 'rgba(151,187,205,1)',
                            data: counts
                        }
                    ]
                };
                var options = {scaleOverride: true, scaleSteps: _.max(counts), scaleStepWidth: 1};
                
                chart.Bar(data, options);
            }
        };
    });
});