define(['filters'], function(filters) {
    filters.filter('orderCategoryBy', function() {
        return function(items, field, reverse) {
            var sortfunc = null, factor = reverse ? -1 : 1;
            if (field == 'datetime') {
                sortfunc = function(item) { return item.latest_time * factor; };
            } else if(field == 'count') {
                sortfunc = function(item) { return item.exception_size * factor; };
            } else if(field == 'frequence') {
                sortfunc = function(item) { return item.frequence * factor; };
            } else {
                throw 'Cannot order by this field: ' + field;
            };

            return _.sortBy(items, sortfunc)
        };
    });

    filters.filter('filterCategory', function() {
        return function(items, scope) {
            if (scope == 'All') {
                return items;
            } else if (scope == 'Unresolved Only') {
                return _.filter(items, function(item) { return !item.resolved; })
            } else {
                throw 'Doesn\'t Support this scope: ' + scope;
            };
        };
    });
});