function getPercentColor(percent) {
    function getPercentLevel(percent) {
        if(percent < 60) return 0;
        else if(percent < 80) return 1;
        else return 2;
    }

    return ['danger', 'warning', 'success'][getPercentLevel(percent)];
}