define(['jquery'], function($) {
    var deferred = $.Deferred();
    $.ajax({url: '/projects/_subscriptions', dataType: 'json'}).done(function(data) {
        deferred.resolve(data);
    });
    return deferred.promise();
});