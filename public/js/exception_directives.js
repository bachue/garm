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
                init_chart(scope, element, scope.current_category);
                scope.$on('current_category_changed', function(event, category) {
                    init_chart(scope, element, category);
                });
            }
        };

        function init_chart(scope, element, category) {
            var pairs = category.date_distribution;
            var context = element.get(0).getContext('2d');

            if (pairs.length <= 1) { // Won't show the chart if only one version
                return context.clearRect(0, 0, element.width(), element.height());
            }

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

            var chart = new Chart(context);
            chart.Line(data, options);

            scope.$watch('current_tab', function() {
                if (scope.current_tab == 'Versions') // Avoid showing 2 charts in a tab
                    element.hide();
                else
                    element.show();
            });
        }
    });

    directives.directive('exceptionLogTrackList', function() {
        return {
            link: function(scope, element) {
                init_log_track(scope, element, scope.current_exception);
                scope.$on('current_category_changed', function(event, category, exception) {
                    init_log_track(scope, element, exception);
                });
                scope.$on('current_exception_changed', function(event, exception) {
                    init_log_track(scope, element, exception);
                });
            }
        };

        function init_log_track(scope, element, exception) {
            if (exception.logs || !exception.id) return;
            $('<img class="loading" src="img/loading.gif" width="64" height="64" />').prependTo(element);
            $.ajax({url: '/exceptions/' + exception.id + '/_track', dataType: 'JSON'}).done(function(logs) {
                element.find('img.loading').hide('slow', function() { $(this).remove(); });
                exception.logs = logs;
                scope.$apply();
            });
        }
    });
});