// Just makes the code a tad cleaner if no window.Q available.
var FAKE_DEFERRED = {promise: null, reject: function () {}, resolve: function () {}};

var isArray = Array.isArray || function (obj) {
        return _.toString.call(obj) === '[object Array]';
    };

var isString = function (str) {
    return typeof str == 'string' || str instanceof String;
};

/**
 * Wrap a callback and a deferred in a convienience function.
 * @param [cb]
 * @param deferred
 * @returns {Function}
 * @private
 */
function _done(cb, deferred) {
    return function (err, o) {
        if (err) {
            if (cb) cb(err);
            deferred.reject(err);
        }
        else {
            if (cb) cb();
            deferred.resolve(o);
        }
    };
}

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
    _listenToModel: function (field, Model, handler, cb) {
        if (Model.singleton) {
            Model.one(function (err, instance) {
                console.log('singleton', instance);
                if (!err) {
                    if (field) this.listen(field, instance, function (n) {handler(n)});
                    else this.listen(instance, function (n) {handler(n)});
                    cb(err, instance);
                }
                else {
                    handler(err);
                }
            }.bind(this));
        }
        else throw new Error('Cannot listen to a Model if it is not a singleton');
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
    listen: function () {
        var field, listenee, handler, cb;
        if (isString(arguments[0])) {
            field = arguments[0];
            listenee = arguments[1];
            handler = arguments[2];
            cb = arguments[3];
        }
        else {
            listenee = arguments[0];
            handler = arguments[1];
            cb = arguments[2];
        }
        cb = cb || function () {};
        var deferred = window.Q ? window.Q.defer() : FAKE_DEFERRED,
            done = _done(cb, deferred);
        if (listenee instanceof siesta._internal.Model) {
            this._listenToModel(field, listenee, handler, done);
        }
        else {
            var cancelListen;
            if (field) cancelListen = listenee.listen(field, handler);
            else cancelListen = listenee.listen(handler);
            this.listeners.push(cancelListen);
            done(null, listenee);
        }
        return deferred.promise;
    },
    query: function (model, query, prop, cb) {
        cb = cb || function () {};
        var deferred = window.Q ? window.Q.defer() : FAKE_DEFERRED,
            done = _done(cb, deferred);
        model.query(query, function (err, res) {
            console.log('_done');
            if (!err) {
                var state = {};
                state[prop] = res;
                this.setState(state, function () {
                    done(null, res);
                });
            }
            else {
                done(err);
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
            var fields;
            if (isArray(opts.fields)) {
                fields = {};
                opts.fields.forEach(function (f) {
                    if (isString(f)) {
                        fields[f] = f;
                    }
                    else {
                        for (var prop in f) {
                            if (f.hasOwnProperty(prop)) fields[prop] = f[prop];
                        }
                    }
                    //state[f] = instance[f];
                });
            }
            else {
                fields = opts.fields;
            }
            console.log('fields', fields);
            Object.keys(fields).forEach(function (f) {
                var custom = fields[f];
                state[custom] = instance[f];
            });
        }
        else {
            state[prop] = instance;
        }
        console.log('state', state);
        this.setState(state);
        this.listen(instance, function (e) {
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
    listenAndSetState: function (o) {
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
        var done = _done(cb, deferred);
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
                done(null, o.results);
            }
            else {
                o.init(function () {
                    updateWithResults.call(this);
                    done(null, o.results);
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
                        this._listenAndSetStateForModelInstance(instance, opts, prop, done);
                    }
                }.bind(this));
            }
            else {
                throw new Error('Can only listenAndSetState singleton models');
            }
        }
        else if (o instanceof siesta._internal.siestaModel) {
            this._listenAndSetStateForModelInstance(o, opts, prop, done);
        }
        else {
            throw new Error('Cannot listenAndSetState objects of that type');
        }
        return deferred.promise;
    }
};

if (typeof module !== 'undefined') module.exports = {SiestaMixin: SiestaMixin};
if (typeof window !== 'undefined') window.SiestaMixin = SiestaMixin;