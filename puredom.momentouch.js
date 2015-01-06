puredom.addNodeSelectionPlugin('momentouch', function(options) {
    
    var options = options || {},
        dragFactor      = options.dragFactor || 0.9,
        updateInterval  = options.updateInterval || 10,
        threshold       = options.threshold || 0.05;
    
    puredom(this).each(function(selected) {
        var start    = null,
            previous = null,
            current  = null,
            timeout  = null,
            on_move,
            on_stop,
            on_stop_before_move,
            on_inertia;
        
        function delta(e) {
            
            var delta = {
                pageX: e.pageX,
                pageY: e.pageY,
                deltaX: e.pageX - previous.pageX,
                deltaY: e.pageY - previous.pageY,
                sourceOffsetX: e.pageX - start.pageX,
                sourceOffsetY: e.pageY - start.pageY,
                angle: Math.atan2(e.pageY - previous.pageY, e.pageX - previous.pageX) * 180 / Math.PI
            };
            
            return delta;
        }
        
        function clear(){
            puredom(window)
                .removeEvent('mouseup', on_stop)
                .removeEvent('mouseup', on_stop_before_move)
                .removeEvent('mousemove', on_move);
        }
        
        function reset(){
            if (timeout != null) {
                clearTimeout(timeout);
                timeout = null;
            }
            
            previous = current = start = null;
        }
        
        // Handles dragging the node selection.
        on_move = function(e) {
            previous = current;
            if (previous === null) {
                previous = start;
                selected.fireEvent('slidestart');
                
                puredom(window)
                    .removeEvent('mouseup', on_stop_before_move)
                    .on('mouseup', on_stop);
            }
            
            current = e;
            selected.fireEvent('sliding', delta(e));
        };
        
        // Handles continuing movement of the node selection after release.
        on_inertia = function(ne) {
            ne.deltaX *= dragFactor;
            ne.deltaY *= dragFactor;
            ne.pageX += ne.deltaX;
            ne.pageY += ne.deltaY;
            ne.sourceOffsetX = ne.pageX - start.pageX;
            ne.sourceOffsetY = ne.pageY - start.pageY;
            
            selected.fireEvent('sliding', ne);
            if (Math.abs(ne.deltaX) > threshold ||
                Math.abs(ne.deltaY) > threshold) {
                timeout = setTimeout(function(){on_inertia(ne);}, updateInterval);
            }
            else {
                selected.fireEvent('slidestop');
                reset();
            }
        };
        
        // Handles release of the node selection after there has been movement.
        on_stop = function(e) {
            if (previous !== null) {
                 on_inertia(delta(e));
            }
            else {
                selected.fireEvent('slidestop');
            }
            clear();
        };
        
        // Handles release of the node selection when no movement has occurred.
        on_stop_before_move = function(e) {
            clear();
        };
        
        // Handles touch/click of node selection. 
        // Attaches movement handler.
        // Does NOT trigger slidestart yet.
        function begin (e){
            // 1 = left-click
            // 0 = touch event
            if (e.which > 1) {
                return;
            }
            
            if (start !== null) {
                selected.fireEvent('slidecancel');
            }
            
            reset();
            clear();
            
            start = e;
            
            puredom(window)
                .on('mousemove', on_move)
                .on('mouseup', on_stop_before_move);
            
            return e.cancel();
        };
        
        selected.on('mousedown', begin);
    });
});
