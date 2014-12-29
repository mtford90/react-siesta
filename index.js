
var SiestaMixin = {
    componentWillMount: function () {
        this.rqListeners = [];
    },
    _removeRQListeners: function () {
        for (var i = 0; i < this.rqListeners.length; i++) {
            var listen = this.rqListeners[i],
                rq = listen[0],
                fn = listen[1];
            rq.removeListener('change', fn);
        }
        this.rqListeners = [];
    },
    componentWillUnmount: function () {
        this._removeRQListeners();
    },
    /**
     * Register a listener to a reactive query. Listeners are automatically removed when the component is unmounted
     * @param {ReactiveQuery} rq
     * @param {Object|function} [changeOrOpts] - Change listener or an options object specifying change listener and init callback
     * @param {function} [changeOrOpts.change] - Change listener
     * @param {function} [changeOrOpts.init] - Init callback
     */
    listenToReactiveQuery: function (rq, changeOrOpts) {
        if (changeOrOpts) {
            var init, change;
            if (typeof changeOrOpts == 'function') {
                change = changeOrOpts;
                init = function () {};
            }
            else {
                change = changeOrOpts.change;
                init = changeOrOpts.init || function () {};
            }
            rq.init(function (err) {
                init(err);
                if (!err && change) {
                    rq.on('change', change);
                    this.rqListeners.push([rq, change]);
                }
            }.bind(this));
        }
    }
};

module.exports = {
    SiestaMixin: SiestaMixin
};