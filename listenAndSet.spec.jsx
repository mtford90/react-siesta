var assert = chai.assert;

describe('listen and set', function () {
    var Collection, Model;
    beforeEach(function (done) {
        siesta.reset(done);
    });
    it('initialised', function (done) {
        Collection = siesta.collection('Collection');
        Model = Collection.model('Model', {
            attributes: ['x']
        });
        Model.map([{x: 2}, {x: 3}])
            .then(function (instances) {
                var rq = Model.reactiveQuery();
                rq.init().then(function () {
                    var Component = React.createClass({
                        mixins: [SiestaMixin],
                        render: function () {
                            return (<span></span>);
                        },
                        componentDidMount: function () {
                            this.listenAndSet(rq, 'models');
                            assert.equal(this.state.models.length, 2);
                            assert.include(this.state.models, instances[0]);
                            assert.include(this.state.models, instances[1]);
                            done();
                        }
                    });
                    React.render(
                        <Component />,
                        document.getElementById('react')
                    );
                });
            }).catch(done);

    });
    it('not initialised', function (done) {
        Collection = siesta.collection('Collection');
        Model = Collection.model('Model', {
            attributes: ['x']
        });
        Model.map([{x: 2}, {x: 3}])
            .then(function (instances) {
                console.log('instances', instances);
                var rq = Model.reactiveQuery();
                var Component = React.createClass({
                    mixins: [SiestaMixin],
                    render: function () {
                        return (<span></span>);
                    },
                    componentDidMount: function () {
                        this.listenAndSet(rq, 'models')
                            .then(function () {
                                console.log('state', this.state);
                                assert.equal(this.state.models.length, 2);
                                assert.include(this.state.models, instances[0]);
                                assert.include(this.state.models, instances[1]);
                                done();
                            }.bind(this)).catch(done)
                    }
                });
                React.render(
                    <Component />,
                    document.getElementById('react')
                );
            }).catch(done);

    });
    it('update', function (done) {
        Collection = siesta.collection('Collection');
        Model = Collection.model('Model', {
            attributes: ['x']
        });
        Model.map([{x: 2}, {x: 3}])
            .then(function (instances) {
                console.log('instances', instances);
                var rq = Model.reactiveQuery();
                var Component = React.createClass({
                    mixins: [SiestaMixin],
                    render: function () {
                        return (<span></span>);
                    },
                    componentDidMount: function () {
                        this.listenAndSet(rq, 'models')
                            .then(function () {
                                Model.map({x: 4}).then(function (instance) {
                                    assert.equal(this.state.models.length, 3);
                                    assert.include(this.state.models, instances[0]);
                                    assert.include(this.state.models, instances[1]);
                                    assert.include(this.state.models, instance);
                                    done();
                                }.bind(this)).catch(done);
                            }.bind(this)).catch(done)
                    }
                });
                React.render(
                    <Component />,
                    document.getElementById('react')
                );
            }).catch(done);

    });

    describe('arranged reactive query', function () {
        it('initialised', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x', 'index']
            });
            Model.map([{x: 2}, {x: 3}])
                .then(function (instances) {
                    var rq = Model.arrangedReactiveQuery();
                    rq.init().then(function () {
                        var Component = React.createClass({
                            mixins: [SiestaMixin],
                            render: function () {
                                return (<span></span>);
                            },
                            componentDidMount: function () {
                                this.listenAndSet(rq, 'models');
                                assert.equal(this.state.models.length, 2);
                                assert.include(this.state.models, instances[0]);
                                assert.include(this.state.models, instances[1]);
                                done();
                            }
                        });
                        React.render(
                            <Component />,
                            document.getElementById('react')
                        );
                    });
                }).catch(done);

        });
        it('not initialised', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x', 'index']
            });
            Model.map([{x: 2}, {x: 3}])
                .then(function (instances) {
                    console.log('instances', instances);
                    var rq = Model.arrangedReactiveQuery();
                    var Component = React.createClass({
                        mixins: [SiestaMixin],
                        render: function () {
                            return (<span></span>);
                        },
                        componentDidMount: function () {
                            this.listenAndSet(rq, 'models')
                                .then(function () {
                                    assert.equal(this.state.models.length, 2);
                                    assert.include(this.state.models, instances[0]);
                                    assert.include(this.state.models, instances[1]);
                                    done();
                                }.bind(this)).catch(done)
                        }
                    });
                    React.render(
                        <Component />,
                        document.getElementById('react')
                    );
                }).catch(done);

        });
        it('update', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x']
            });
            Model.map([{x: 2}, {x: 3}])
                .then(function (instances) {
                    console.log('instances', instances);
                    var rq = Model.arrangedReactiveQuery();
                    var Component = React.createClass({
                        mixins: [SiestaMixin],
                        render: function () {
                            return (<span></span>);
                        },
                        componentDidMount: function () {
                            this.listenAndSet(rq, 'models')
                                .then(function () {
                                    Model.map({x: 4}).then(function (instance) {
                                        assert.equal(this.state.models.length, 3);
                                        assert.include(this.state.models, instances[0]);
                                        assert.include(this.state.models, instances[1]);
                                        assert.include(this.state.models, instance);
                                        done();
                                    }.bind(this)).catch(done);
                                }.bind(this)).catch(done)
                        }
                    });
                    React.render(
                        <Component />,
                        document.getElementById('react')
                    );
                }).catch(done);

        });

    });
    describe('singleton', function () {
        it('init', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x'],
                singleton: true
            });
            siesta.install().then(function () {
                var Component = React.createClass({
                    mixins: [SiestaMixin],
                    render: function () {
                        return (<span></span>);
                    },
                    componentDidMount: function () {
                        this.listenAndSet(Model, 'singleton')
                            .then(function () {
                                Model.one().then(function (singleton) {
                                    assert.equal(this.state.singleton, singleton);
                                    done();
                                }.bind(this)).catch(done);
                            }.bind(this)).catch(done);
                    }
                });
                React.render(
                    <Component />,
                    document.getElementById('react')
                );
            }).catch(done);
        });
        it('update', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x'],
                singleton: true
            });
            siesta.install().then(function () {
                var Component = React.createClass({
                    mixins: [SiestaMixin],
                    render: function () {
                        return (<span></span>);
                    },
                    shouldComponentUpdate: function (nextProps, nextState) {
                        if (nextState.singleton.x == '123') {
                            done();
                        }
                    },
                    componentDidMount: function () {
                        this.listenAndSet(Model, 'singleton')
                            .then(function () {
                                Model.one().then(function (singleton) {
                                    singleton.x = '123';
                                    siesta.notify();
                                }.bind(this)).catch(done);
                            }.bind(this)).catch(done);
                    }
                });
                React.render(
                    <Component />,
                    document.getElementById('react')
                );
            }).catch(done);
        });


    });
    describe('fields', function () {
        describe('array', function () {
            describe('singleton', function () {
                it('init', function (done) {
                    Collection = siesta.collection('Collection');
                    Model = Collection.model('Model', {
                        attributes: [{
                            name: 'x',
                            default: 1
                        }, {
                            name: 'y',
                            default: 2
                        }],
                        singleton: true
                    });
                    siesta.install().then(function () {
                        var Component = React.createClass({
                            mixins: [SiestaMixin],
                            render: function () {
                                return (<span></span>);
                            },
                            componentDidMount: function () {
                                this.listenAndSet(Model, {fields: ['x']})
                                    .then(function () {
                                        assert.equal(this.state.x, 1);
                                        assert.notOk(this.state.y);
                                        done();
                                    }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            <Component />,
                            document.getElementById('react')
                        );
                    }).catch(done);
                });
                it('update', function (done) {
                    Collection = siesta.collection('Collection');
                    Model = Collection.model('Model', {
                        attributes: [{
                            name: 'x',
                            default: 1
                        }, {
                            name: 'y',
                            default: 2
                        }],
                        singleton: true
                    });
                    siesta.install().then(function () {
                        var Component = React.createClass({
                            mixins: [SiestaMixin],
                            render: function () {
                                return (<span></span>);
                            },
                            shouldComponentUpdate: function (nextProps, nextState) {
                                if (nextState.x == '123') {
                                    done();
                                }
                            },
                            componentDidMount: function () {
                                this.listenAndSet(Model, {fields: ['x']})
                                    .then(function (singleton) {
                                        console.log(1, singleton);
                                        assert.equal(this.state.x, 1);
                                        singleton.x = '123';
                                        siesta.notify();
                                    }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            <Component />,
                            document.getElementById('react')
                        );
                    }).catch(done);
                });
            });
            describe('model', function () {
                it('init', function (done) {
                    Collection = siesta.collection('Collection');
                    Model = Collection.model('Model', {
                        attributes: [{
                            name: 'x',
                            default: 1
                        }, {
                            name: 'y',
                            default: 2
                        }],
                        singleton: true
                    });
                    siesta.install().then(function () {
                        var Component = React.createClass({
                            mixins: [SiestaMixin],
                            render: function () {
                                return (<span></span>);
                            },
                            componentDidMount: function () {
                                Model.one().then(function (model) {
                                    this.listenAndSet(model, {fields: ['x']})
                                        .then(function () {
                                            assert.equal(this.state.x, 1);
                                            assert.notOk(this.state.y);
                                            done();
                                        }.bind(this)).catch(done);
                                }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            <Component />,
                            document.getElementById('react')
                        );
                    }).catch(done);
                });
                it('update', function (done) {
                    Collection = siesta.collection('Collection');
                    Model = Collection.model('Model', {
                        attributes: [{
                            name: 'x',
                            default: 1
                        }, {
                            name: 'y',
                            default: 2
                        }],
                        singleton: true
                    });
                    siesta.install().then(function () {
                        var Component = React.createClass({
                            mixins: [SiestaMixin],
                            render: function () {
                                return (<span></span>);
                            },
                            shouldComponentUpdate: function (nextProps, nextState) {
                                if (nextState.x == '123') {
                                    done();
                                }
                            },
                            componentDidMount: function () {
                                Model.one().then(function (model) {
                                    this.listenAndSet(model, {fields: ['x']})
                                        .then(function (singleton) {
                                            singleton.x = '123';
                                            siesta.notify();
                                        }.bind(this)).catch(done);
                                }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            <Component />,
                            document.getElementById('react')
                        );
                    }).catch(done);
                });
            });
        });
        describe('object', function () {
            describe('singleton', function () {
                it('init', function (done) {
                    Collection = siesta.collection('Collection');
                    Model = Collection.model('Model', {
                        attributes: [{
                            name: 'x',
                            default: 1
                        }, {
                            name: 'y',
                            default: 2
                        }],
                        singleton: true
                    });
                    siesta.install().then(function () {
                        var Component = React.createClass({
                            mixins: [SiestaMixin],
                            render: function () {
                                return (<span></span>);
                            },
                            componentDidMount: function () {
                                this.listenAndSet(Model, {fields: {x: 'custom'}})
                                    .then(function () {
                                        assert.equal(this.state.custom, 1);
                                        assert.notOk(this.state.y);
                                        done();
                                    }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            <Component />,
                            document.getElementById('react')
                        );
                    }).catch(done);
                });
                it('update', function (done) {
                    Collection = siesta.collection('Collection');
                    Model = Collection.model('Model', {
                        attributes: [{
                            name: 'x',
                            default: 1
                        }, {
                            name: 'y',
                            default: 2
                        }],
                        singleton: true
                    });
                    siesta.install().then(function () {
                        var Component = React.createClass({
                            mixins: [SiestaMixin],
                            render: function () {
                                return (<span></span>);
                            },
                            shouldComponentUpdate: function (nextProps, nextState) {
                                if (nextState.custom == '123') {
                                    done();
                                }
                            },
                            componentDidMount: function () {
                                this.listenAndSet(Model, {fields: {x: 'custom'}})
                                    .then(function (singleton) {
                                        singleton.x = '123';
                                        siesta.notify();
                                    }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            <Component />,
                            document.getElementById('react')
                        );
                    }).catch(done);
                });
            });
            describe('model', function () {
                it('init', function (done) {
                    Collection = siesta.collection('Collection');
                    Model = Collection.model('Model', {
                        attributes: [{
                            name: 'x',
                            default: 1
                        }, {
                            name: 'y',
                            default: 2
                        }],
                        singleton: true
                    });
                    siesta.install().then(function () {
                        var Component = React.createClass({
                            mixins: [SiestaMixin],
                            render: function () {
                                return (<span></span>);
                            },
                            componentDidMount: function () {
                                Model.one().then(function (model) {
                                    this.listenAndSet(model, {fields: {x: 'custom'}})
                                        .then(function () {
                                            assert.equal(this.state.custom, 1);
                                            assert.notOk(this.state.y);
                                            done();
                                        }.bind(this)).catch(done);
                                }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            <Component />,
                            document.getElementById('react')
                        );
                    }).catch(done);
                });
                it('update', function (done) {
                    Collection = siesta.collection('Collection');
                    Model = Collection.model('Model', {
                        attributes: [{
                            name: 'x',
                            default: 1
                        }, {
                            name: 'y',
                            default: 2
                        }],
                        singleton: true
                    });
                    siesta.install().then(function () {
                        var Component = React.createClass({
                            mixins: [SiestaMixin],
                            render: function () {
                                return (<span></span>);
                            },
                            shouldComponentUpdate: function (nextProps, nextState) {
                                if (nextState.custom == '123') {
                                    done();
                                }
                            },
                            componentDidMount: function () {
                                Model.one().then(function (model) {
                                    this.listenAndSet(model, {fields: {x: 'custom'}})
                                        .then(function (singleton) {
                                            singleton.x = '123';
                                            siesta.notify();
                                        }.bind(this)).catch(done);
                                }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            <Component />,
                            document.getElementById('react')
                        );
                    }).catch(done);
                });
            });
        });
    });

});
