define(['filters'], function(filters) {
    filters.filter('orderCategoryBy', function(){
        return function(items, field, reverse) {
            var sortfunc = null, factor = reverse ? -1 : 1;
            if (field == 'datetime') {
                sortfunc = function(item) { return item.latest_time * factor; };
            } else if(field == 'count') {
                sortfunc = function(item) { return item.exception_size * factor; };
            } else if(field == 'frequence') {
                sortfunc = function(item) { return item.frequence * factor; };
            };

            return _.sortBy(items, sortfunc)
        };
    });
});