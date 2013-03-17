puredom.addNodeSelectionPlugin('mousehold', function(options) {
    
    var options = options || {};
    options.timeout = options.timeout || 0.95;
    options.interval = options.interval || 0.6;
    
    puredom(this).each(function(selected) {
        
        var timeout,
            interval,
            down;
        
        function repeat() {
            if (!interval) {
                interval = setInterval(repeat, options.interval * 1000);
            }
            
            selected.fireEvent('mouseheld', down);
        }
        
        function clear() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        }
        
        puredom(selected).on('mousedown', function(e) {
            timeout = setTimeout(repeat, options.timeout * 1000);
        }).on('mouseleave', clear);
        puredom(window).on('mouseup', clear);
    });
});
