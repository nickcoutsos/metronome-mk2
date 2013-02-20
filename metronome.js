Metronome = function(){
    puredom.EventEmitter.call(this);
    this.bpm = 0;
    this.beats_per_measure = 4;
    
    this.MIN_BEATS_PER_MINUTE = 1;
    this.MAX_BEATS_PER_MINUTE = 300;
};

puredom.inherits(Metronome, puredom.EventEmitter);
puredom.extend(Metronome.prototype, {
    
    init: function(){
        this._interval = null;
        this._half_beats = 1;
        this._beats = 0;
        this._measures = 0;
        
        this.set_bpm(this.bpm);
    },
    
    increment: function(amount) {
        this.set_bpm(this.bpm + (amount || 1));
    },
    
    decrement: function(amount) {
        this.set_bpm(this.bpm - (amount || 1));
    },
    
    seconds_per_beat: function() {
        return 60 / this.bpm;
    },
    
    set_meter: function(beats_per_measure, lol_wtf) {
        if (beats_per_measure == this.beats_per_measure) {
            return;
        }
        
        this.beats_per_measure = beats_per_measure;
        this._fireEvent('meterChange', [this.beats_per_measure]);
        this.reset();
    },
    
    set_bpm: function(bpm) {
        bpm = Math.max(this.MIN_BEATS_PER_MINUTE, bpm);
        bpm = Math.min(this.MAX_BEATS_PER_MINUTE, bpm);
        
        if (this.bpm == bpm) {
            return;
        }
        this.bpm = bpm;
        
        this._fireEvent('bpmChange', [this.bpm]);
        if (this.running()) {
            this.reset();
        }
    },
    
    running: function() {
        return this._interval != null;
    },
    
    _beat: function() {
        this._half_beats++;
        
        this._fireEvent('halfBeat', [this._half_beats % 2 != 0]);
        
        if (this._half_beats % 2 == 0) {
            this._beats++;
            if (this._beats % this.beats_per_measure == 1) {
                this._measures++;
                
                if (this._measures != 1) {
                    var result = this._fireEvent('measure', this._measures);
                    if (!result.truthy) {
                        return;
                    }
                }
            }
            
            var a = this._beats,
                b = this.beats_per_measure,
                c = a % b || b;
            
            this._fireEvent('fullBeat', [a, c, this._measures]);
        }
    },
    
    toggle: function() {
        if (!this.running()) {
            this.start();
        } else {
            this.stop();
        }
    },
    
    start: function() {
        this._half_beats = 1;
        this._beats = 0;
        this._measures = 0;
        var that = this;
        this._interval = setInterval(function(){that._beat();}, this.seconds_per_beat() * 500);
        this._fireEvent('start');
    },
    
    stop: function() {
        if (this.running()) {
            clearInterval(this._interval);
            this._interval = null;
            this._fireEvent('stop');
        }
    },
    
    reset: function() {
        clearInterval(this._interval);
        this._interval = null;
        var self = this;
        
        setTimeout(function() {
            self.start();
            self._beat();
            self = null;
        },1);
        
        //this._beat();
        //this._half_beats = 1;
        //this._beats = 1;
        //this._measures = 0;
        //this._fireEvent('reset');
    }
});
