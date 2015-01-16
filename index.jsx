// Just makes the code a tad cleaner if no window.Q available.
var FAKE_DEFERRED = {promise: null, reject: function () {}, resolve: function () {}};

var isArray = Array.isArray || function (obj) {
        return _.toString.call(obj) === '[object Array]';
    };

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
    _listenAndSetStateForModelInstance: function (instance, opts, prop, callback) {
        var state = {};
        opts = opts || {};
        if (!opts.fields && !prop) throw Error('Must either specify fields or prop');
        if (opts.fields) {
            if (isArray(opts.fields)) {
                opts.fields.forEach(function (f) {
                    state[f] = instance[f];
                });
            }
            else {
                Object.keys(opts.fields).forEach(function (f) {
                    var custom = opts.fields[f];
                    state[custom] = instance[f];
                });
            }
        }
        else {
            state[prop] = instance;
        }
        this.setState(state);
        console.log('listening...', instance);
        this.listen(instance, function (e) {
            console.log('listened!', e);
            if (opts.fields) {
                var custom = e.field,
                    doesContain;
                if (isArray(opts.fields)) {
                    doesContain = opts.fields.indexOf(e.field) > -1;
                }
                else {
                    doesContain = e.field in opts.fields;
                    if (doesContain) custom = opts.fields[e.field];
                }
                if (doesContain) {
                    var state = {};
                    state[custom] = e.new;
                    this.setState(state);
                }
            }
            else {
                this.setState();
            }
        }.bind(this));
        callback(null, instance);
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

        var updateWithResults = function () {
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
                o.one(function (err, instance) {
                    if (err) {
                        cb(err);
                        deferred.reject(err);
                    }
                    else {
                        this._listenAndSetStateForModelInstance(instance, opts, prop, function (err) {
                            if (err) {
                                cb(err);
                                deferred.reject(err);
                            }
                            else {
                                cb();
                                deferred.resolve(instance);
                            }
                        });
                    }
                }.bind(this));
            }
            else {
                throw new Error('Can only listenAndSet singleton models');
            }
        }
        else if (o instanceof siesta._internal.siestaModel) {
            this._listenAndSetStateForModelInstance(o, opts, prop, function (err) {
                if (err) {
                    cb(err);
                    deferred.reject(err);
                }
                else {
                    cb();
                    deferred.resolve(o);
                }
            });
        }
        else {
            throw new Error('Cannot listenAndSet objects of that type');
        }
        return deferred.promise;
    }
};

if (typeof module !== 'undefined') module.exports = {SiestaMixin: SiestaMixin};
if (typeof window !== 'undefined') window.SiestaMixin = SiestaMixin;