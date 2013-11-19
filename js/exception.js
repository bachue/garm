garmApp.application.controller('Exception', function($scope) {
    $('.make-switch').bootstrapSwitch(false);
    $('.nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $scope.test = 'exception';
    debugger;
});
