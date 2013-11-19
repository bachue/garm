garmApp.application.controller('Exception', function($scope) {
    $('.make-switch').bootstrapSwitch(false);
    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    var DATE_FORMAT_WITHOUT_TIMEZONE = 'YYYY-MM-DD HH:mm:ss';
    var DATE_FORMAT_WITH_TIMEZONE    = 'YYYY-MM-DD HH:mm:ss z';

    $scope.get_utc_string_without_tz = function(timestamp) {
        return moment.unix(timestamp).utc().format(DATE_FORMAT_WITHOUT_TIMEZONE);
    };
});
