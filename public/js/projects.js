define(['jquery'], function($) {
    return $.ajax({url: '/projects', dataType: 'json'});
});