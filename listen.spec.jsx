var assert = chai.assert;


describe('listen', function () {
    var Collection, Model;

    beforeEach(function (done) {
        siesta.reset(done);
    });

    describe('instance', function () {
        it('all event types', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x']
            });
            Model.map({x: 1}).then(function (m) {
                var instance = m;
                var Component = React.createClass({
                    mixins: [SiestaMixin],
                    render: function () {
                        return (<span></span>);
                    },
                    componentDidMount: function () {
                        this.listen(instance, function (event) {
                            assert.ok(event, 'should be an evemt');
                            var numListeners = this.listeners.length;
                            assert(numListeners == 1, 'Should now be 1 listener but there are ' + numListeners + ' instead');
                            done();
                        }.bind(this));
                    }
                });
                React.render(
                    <Component />,
                    document.getElementById('react')
                );
                instance.x = 2;
            }).catch(done);
        });
        it('specific event type', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x'],
                methods: {
                    foo: function () {
                        this.emit('foo', {});
                    },
                    bar: function () {
                        this.emit('bar', {});
                    }
                }
            });
            Model.map({x: 1}).then(function (m) {
                var instance = m;
                var Component = React.createClass({
                    mixins: [SiestaMixin],
                    render: function () {
                        return (<span></span>);
                    },
                    componentDidMount: function () {
                        this.listen('foo', instance, function (e) {
                            assert.equal(e.type, 'foo');
                            done();
                        });
                        m.bar();
                        m.foo();
                    }
                });
                React.render(
                    <Component />,
                    document.getElementById('react')
                );
                instance.x = 2;
            }).catch(done);
        });
    });

    describe('singleton', function () {
        it('all event types', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x'],
                singleton: true
            });
            var Component = React.createClass({
                mixins: [SiestaMixin],
                render: function () {
                    return (<span></span>);
                },
                componentDidMount: function () {
                    this.listen(Model, function () {
                    })
                        .then(function (inst) {
                            var numListeners = this.listeners.length;
                            assert(numListeners == 1, 'Should now be 1 listener but there are ' + numListeners + ' instead');
                            assert.ok(inst);
                            done();
                        }.bind(this))
                        .catch(done);
                }
            });
            React.render(
                <Component />,
                document.getElementById('react')
            );
            Model.one().then(function (instance) {
                instance.x = 2;
            })
        });
        it('specific event types', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x'],
                singleton: true,
                methods: {
                    foo: function () {
                        this.emit('foo', {});
                    },
                    bar: function () {
                        this.emit('bar', {});
                    }
                }
            });
            var Component = React.createClass({
                mixins: [SiestaMixin],
                render: function () {
                    return (<span></span>);
                },
                componentDidMount: function () {
                    this.listen('foo', Model, function (e) {
                        assert.equal(e.type, 'foo');
                        done();
                    }).catch(done);
                    Model.one().then(function (m) {
                        m.bar();
                        m.foo();
                    }).catch(done);
                }
            });
            React.render(
                <Component />,
                document.getElementById('react')
            );
            Model.one().then(function (instance) {
                instance.x = 2;
            })
        });
    });


    it('reactive query', function (done) {
        Collection = siesta.collection('Collection');
        Model = Collection.model('Model', {
            attributes: ['x']
        });
        var rq = Model.reactiveQuery();
        rq.init().then(function () {
            var Component = React.createClass({
                mixins: [SiestaMixin],
                render: function () {
                    return (<span></span>);
                },
                componentDidMount: function () {
                    this.listen(rq, function () {
                    })
                        .then(function (_rq) {
                            var numListeners = this.listeners.length;
                            assert.equal(rq, _rq);
                            assert(numListeners == 1, 'Should now be 1 listener but there are ' + numListeners + ' instead');
                            done();
                        }.bind(this)).catch(done);
                }
            });
            React.render(
                <Component />,
                document.getElementById('react')
            );
            Model.map({x: 1});
        });
    });

    it('arranged reactive query', function (done) {
        Collection = siesta.collection('Collection');
        Model = Collection.model('Model', {
            attributes: ['x', 'index']
        });
        var rq = Model.arrangedReactiveQuery();
        rq.init().then(function () {
            var Component = React.createClass({
                mixins: [SiestaMixin],
                render: function () {
                    return (<span></span>);
                },
                componentDidMount: function () {
                    this.listen(rq, function () {
                    })
                        .then(function () {
                            var numListeners = this.listeners.length;
                            assert(numListeners == 1, 'Should now be 1 listener but there are ' + numListeners + ' instead');
                            done();
                        }.bind(this)).catch(done);
                }
            });
            React.render(
                <Component />,
                document.getElementById('react')
            );
            Model.map({x: 1});
        });
    });
});

