var SiestaMixin = {
    componentWillMount: function () {
        this.otherListeners = [];
    },
    _removeOtherListeners: function () {
        for (var i = 0; i < this.otherListeners.length; i++) {
            var cancelListener = this.otherListeners[i];
            cancelListener();
        }
        this.otherListeners = [];
    },
    componentWillUnmount: function () {
        this._removeOtherListeners();
    },
    listen: function (o, fn) {
        if (o instanceof siesta._internal.Model) {
            if (o.singleton) {
                var getPromise = Singleton.get();
                getPromise.then(function (singleton) {
                    this.listen(singleton, function (n) {fn(singleton, n)});
                }.bind(this));
                return getPromise;
            }
            else {
                throw new Error('Cannot listen to a Model if it is not a singleton')
            }
        }
        else {
            this.otherListeners.push(o.listen(fn));
        }
    }
};

module.exports = {
    SiestaMixin: SiestaMixin
};