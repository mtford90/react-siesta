// Just makes the code a tad cleaner if no window.Q available.
var FAKE_DEFERRED = {promise: null, reject: function () {}, resolve: function () {}};

var SiestaMixin = {
    componentWillMount: function () {
        this.listeners = [];
    },
    _cancelListeners: function () {
        for (var i = 0; i < this.listeners.length; i++) {
            var cancelListener = this.listeners[i];
            cancelListener();
        }
        this.listeners = [];
    },
    componentWillUnmount: function () {
        this._cancelListeners();
    },
    _listenToModel: function (Model, fn) {
        var cancelListen;
        if (Model.singleton) {
            Model.one(function (err, singleton) {
                console.log('singleton', singleton);
                if (!err) {
                    cancelListen = this.listen(singleton, function (n) {fn(n)});
                    this.listeners.push(cancelListen);
                }
                else fn(err);
            }.bind(this));
        }
        else throw new Error('Cannot listen to a Model if it is not a singleton');
        return function () {
            if (cancelListen) {
                var idx = this.listeners.indexOf(cancelListen);
                this.listeners.splice(idx, 1);
                cancelListen();
            }
        }.bind(this);
    },
    wrapCancelListen: function (cancelListen) {
        var wrappedCancelListen;
        if (typeof cancelListen == 'function') {
            wrappedCancelListen = function () {
                var idx = this.listeners.indexOf(cancelListen);
                this.listeners.splice(idx, 1);
                cancelListen();
            }.bind(this)
        }
        return wrappedCancelListen;
    },
    listen: function (o, fn) {
        var cancelListen;
        if (o instanceof siesta._internal.Model) cancelListen = this._listenToModel(o, fn);
        else cancelListen = o.listen(fn);
        if (cancelListen) this.listeners.push(cancelListen);
        return this.wrapCancelListen(cancelListen);
    },
    query: function (model, query, prop, cb) {
        var deferred = window.Q ? window.Q.defer() : FAKE_DEFERRED;
        cb = cb || function () {};
        model.query(query, function (err, res) {
            console.log('done');
            if (!err) {
                var state = {};
                state[prop] = res;
                this.setState(state, function () {
                    cb(null, res);
                    deferred.resolve(res);
                });
            }
            else {
                cb(err);
                deferred.reject(err);
            }
        }.bind(this));
        return deferred.promise;
    },
    all: function (model) {
        var query, prop, cb;
        if (arguments[1] instanceof String || typeof arguments[1] == 'string') {
            prop = arguments[1];
            cb = arguments[2];
        }
        else {
            query = arguments[1];
            prop = arguments[2];
            cb = arguments[3];
        }
        return this.query(model, query, prop, cb);
    },
    isReactiveQuery: function (o) {
        // TODO: Wishy washy. Do instanceof check instead once ReactiveQuery is available on siesta object
        return typeof o.terminate == 'function';
    },
    listenAndSet: function (o) {
        var opts, prop, cb;
        if (typeof arguments[1] == 'object') {
            opts = arguments[1];
            cb = arguments[2];
        }
        else {
            opts = {};
            prop = arguments[1];
            cb = arguments[2];
        }
        var deferred = window.Q ? window.Q.defer() : FAKE_DEFERRED;
        cb = cb || function () {};
        var state = {};

        var updateWithResults = function() {
            state[prop] = o.results;
            this.setState(state, function () {
                this.listen(o, function () {
                    if (this.isReactiveQuery(o)) {
                        var state = {};
                        state[prop] = o.results;
                        this.setState(state);
                    }
                }.bind(this));
            });
        }.bind(this);

        if (this.isReactiveQuery(o)) {
            if (o.initialised) {
                updateWithResults.call(this);
                cb(null, o.results);
                deferred.resolve(o.results);
            }
            else {
                o.init(function () {
                    updateWithResults.call(this);
                    cb(null, o.results);
                    deferred.resolve(o.results);
                }.bind(this));
            }
        }
        else if (o instanceof siesta._internal.Model) {
            if (o.singleton) {
                var fields = opts.fields;
                if (fields) {
                    o.one(function (err, model) {
                        if (!err) {
                            var partialState = {};
                            for (var i = 0; i < fields.length; i++) {
                                var field = fields[i];
                                partialState[field] = model[field];
                            }
                            this.setState(partialState);
                            cb(null, model);
                            deferred.resolve(model);
                        }
                        else {
                            cb(err);
                            deferred.reject(err);
                        }
                    }.bind(this));
                    console.log('listening...', o);
                    this.listen(o, function (e) {
                        console.log('listenAndSet', e);
                        if (e.type == 'Set') {
                            if (fields.indexOf(e.field) > -1) {
                                var partialState = {};
                                partialState[e.field] = e.new;
                                this.setState(partialState)
                            }
                        }
                    }.bind(this));
                }
                else {
                    o.one(function (err, singleton) {
                        if (!err) {
                            var state = {};
                            state[prop] = singleton;
                            this.setState(state);
                            cb(null, singleton);
                            deferred.resolve(singleton);
                        }
                        else {
                            cb(err);
                            deferred.reject(err);
                        }
                    }.bind(this));
                    this.listen(o, function () {
                        this.setState();
                    }.bind(this));
                }
            }
            else {
                throw new Error('Can only listenAndSet singleton models');
            }
        }
        else if (o instanceof siesta._internal.siestaModel) {
            state = {};
            if (opts.fields) {
                opts.fields.forEach(function (f) {
                    state[f] = o[f];
                });
            }
            else {
                state[prop] = o;
            }
            this.setState(state);
            this.listen(o, function (e) {
                if (opts.fields.indexOf(e.field) > -1) {
                    var state = {};
                    state[e.field] = e.new;
                    this.setState(state);
                }
            }.bind(this));
            deferred.resolve(o);
        }
        else {
            throw new Error('Cannot listenAndSet objects of that type');
        }
        return deferred.promise;
    }
};

if (typeof module !== 'undefined') module.exports = {SiestaMixin: SiestaMixin};
if (typeof window !== 'undefined') window.SiestaMixin = SiestaMixin;