window.onerror = function(msg, url, line, column, errorObj) {
    var xhr = createXHR();
    xhr.open('POST', '/_error', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(build_message());

    function createXHR() {
        if (window.XMLHttpRequest)
          return new XMLHttpRequest();
        else
          return new ActiveXObject("Microsoft.XMLHTTP");
    }

    function build_message() {
        var params = [
            'name=' + errorObj.name,
            'message=' + errorObj.message,
            'url=' + url,
            'backtrace=' + errorObj.stack
        ];
        return params.join('&');
    }
};
