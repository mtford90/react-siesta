var assert = chai.assert;

describe('react siesta', function () {
    var Collection, Model;
    beforeEach(function (done) {
        siesta.reset(done);
    });

    describe('listen', function () {
        it('instance', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x']
            });
            Model.map({x: 1}).then(function (m) {
                var instance = m;
                var Component = React.createClass({displayName: "Component",
                    mixins: [SiestaMixin],
                    render: function () {
                        return (React.createElement("span", null));
                    },
                    componentDidMount: function () {
                        var cancelListen;
                        cancelListen = this.listen(instance, function (n) {
                            cancelListen();
                            var numListeners = this.listeners.length;
                            assert(numListeners == 0, 'Should now be 0 listeners but there are ' + numListeners + ' instead');
                            done();
                        }.bind(this));
                        var numListeners = this.listeners.length;
                        assert(numListeners == 1, 'Should now be 1 listener but there are ' + numListeners + ' instead');
                    }
                });
                React.render(
                    React.createElement(Component, null),
                    document.getElementById('react')
                );
                instance.x = 2;
            }).catch(done);
        });

        it('singleton', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x'],
                singleton: true
            });
            var Component = React.createClass({displayName: "Component",
                mixins: [SiestaMixin],
                render: function () {
                    return (React.createElement("span", null));
                },
                componentDidMount: function () {
                    var cancelListen;
                    cancelListen = this.listen(Model, function (n) {
                        cancelListen();
                        var numListeners = this.listeners.length;
                        assert(numListeners == 0, 'Should now be 0 listeners but there are ' + numListeners + ' instead');
                        done();
                    }.bind(this));
                    var numListeners = this.listeners.length;
                    assert(numListeners == 1, 'Should now be 1 listener but there are ' + numListeners + ' instead');
                }
            });
            React.render(
                React.createElement(Component, null),
                document.getElementById('react')
            );
            Model.one().then(function (instance) {
                instance.x = 2;
            })
        });

        it('reactive query', function (done) {
            Collection = siesta.collection('Collection');
            Model = Collection.model('Model', {
                attributes: ['x']
            });
            var rq = Model.reactiveQuery();
            rq.init().then(function () {
                var Component = React.createClass({displayName: "Component",
                    mixins: [SiestaMixin],
                    render: function () {
                        return (React.createElement("span", null));
                    },
                    componentDidMount: function () {
                        var cancelListen;
                        cancelListen = this.listen(rq, function () {
                            cancelListen();
                            var numListeners = this.listeners.length;
                            assert(numListeners == 0, 'Should now be 0 listeners but there are ' + numListeners + ' instead');
                            done();
                        }.bind(this));
                        var numListeners = this.listeners.length;
                        assert(numListeners == 1, 'Should now be 1 listener but there are ' + numListeners + ' instead');
                    }
                });
                React.render(
                    React.createElement(Component, null),
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
                var Component = React.createClass({displayName: "Component",
                    mixins: [SiestaMixin],
                    render: function () {
                        return (React.createElement("span", null));
                    },
                    componentDidMount: function () {
                        var cancelListen;
                        cancelListen = this.listen(rq, function () {
                            cancelListen();
                            var numListeners = this.listeners.length;
                            assert(numListeners == 0, 'Should now be 0 listeners but there are ' + numListeners + ' instead');
                            done();
                        }.bind(this));
                        var numListeners = this.listeners.length;
                        assert(numListeners == 1, 'Should now be 1 listener but there are ' + numListeners + ' instead');
                    }
                });
                React.render(
                    React.createElement(Component, null),
                    document.getElementById('react')
                );
                Model.map({x: 1});
            });
        });
    });

    it('query', function (done) {
        Collection = siesta.collection('Collection');
        Model = Collection.model('Model', {
            attributes: ['x']
        });
        Model.map([{x: 2}, {x: 3}])
            .then(function (users) {
                var Component = React.createClass({displayName: "Component",
                    mixins: [SiestaMixin],
                    render: function () {
                        return (React.createElement("span", null));
                    },
                    componentDidMount: function () {
                        this.query(Model, {x: 2}, 'users')
                            .then(function () {
                                assert.equal(this.state.users.length, 1);
                                assert.include(this.state.users, users[0]);
                                done();
                            }.bind(this)).catch(done);
                    }
                });
                React.render(
                    React.createElement(Component, null),
                    document.getElementById('react')
                );
            })
            .catch(done);

    });

    it('all', function (done) {
        Collection = siesta.collection('Collection');
        Model = Collection.model('Model', {
            attributes: ['x']
        });
        Model.map([{x: 2}, {x: 3}])
            .then(function (users) {
                var Component = React.createClass({displayName: "Component",
                    mixins: [SiestaMixin],
                    render: function () {
                        return (React.createElement("span", null));
                    },
                    componentDidMount: function () {
                        this.all(Model, 'users')
                            .then(function () {
                                assert.equal(this.state.users.length, 2);
                                assert.include(this.state.users, users[0]);
                                assert.include(this.state.users, users[1]);
                                done();
                            }.bind(this)).catch(done);
                    }
                });
                React.render(
                    React.createElement(Component, null),
                    document.getElementById('react')
                );
            })
            .catch(done);

    });

    describe('listen and set', function () {
        describe('reactive query', function () {


            it('initialised', function (done) {
                Collection = siesta.collection('Collection');
                Model = Collection.model('Model', {
                    attributes: ['x']
                });
                Model.map([{x: 2}, {x: 3}])
                    .then(function (instances) {
                        var rq = Model.reactiveQuery();
                        rq.init().then(function () {
                            var Component = React.createClass({displayName: "Component",
                                mixins: [SiestaMixin],
                                render: function () {
                                    return (React.createElement("span", null));
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
                                React.createElement(Component, null),
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
                        var Component = React.createClass({displayName: "Component",
                            mixins: [SiestaMixin],
                            render: function () {
                                return (React.createElement("span", null));
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
                            React.createElement(Component, null),
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
                        var Component = React.createClass({displayName: "Component",
                            mixins: [SiestaMixin],
                            render: function () {
                                return (React.createElement("span", null));
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
                            React.createElement(Component, null),
                            document.getElementById('react')
                        );
                    }).catch(done);

            });



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
                            var Component = React.createClass({displayName: "Component",
                                mixins: [SiestaMixin],
                                render: function () {
                                    return (React.createElement("span", null));
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
                                React.createElement(Component, null),
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
                        var Component = React.createClass({displayName: "Component",
                            mixins: [SiestaMixin],
                            render: function () {
                                return (React.createElement("span", null));
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
                            React.createElement(Component, null),
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
                        var Component = React.createClass({displayName: "Component",
                            mixins: [SiestaMixin],
                            render: function () {
                                return (React.createElement("span", null));
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
                            React.createElement(Component, null),
                            document.getElementById('react')
                        );
                    }).catch(done);

            });

        });
        describe('singleton', function () {
            it('xyz', function (done) {
                Collection = siesta.collection('Collection');
                Model = Collection.model('Model', {
                    attributes: ['x'],
                    singleton: true
                });
                siesta.install().then(function () {
                    var Component = React.createClass({displayName: "Component",
                        mixins: [SiestaMixin],
                        render: function () {
                            return (React.createElement("span", null));
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
                        React.createElement(Component, null),
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
                    var Component = React.createClass({displayName: "Component",
                        mixins: [SiestaMixin],
                        render: function () {
                            return (React.createElement("span", null));
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
                        React.createElement(Component, null),
                        document.getElementById('react')
                    );
                }).catch(done);
            });
            describe('fields', function () {
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
                        var Component = React.createClass({displayName: "Component",
                            mixins: [SiestaMixin],
                            render: function () {
                                return (React.createElement("span", null));
                            },
                            componentDidMount: function () {
                                this.listenAndSet(Model, {fields: ['x']}, 'singleton')
                                    .then(function () {
                                        assert.equal(this.state.x, 1);
                                        assert.notOk(this.state.y);
                                        done();
                                    }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            React.createElement(Component, null),
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
                        var Component = React.createClass({displayName: "Component",
                            mixins: [SiestaMixin],
                            render: function () {
                                return (React.createElement("span", null));
                            },
                            shouldComponentUpdate: function (nextProps, nextState) {
                                if (nextState.x == '123') {
                                    done();
                                }
                            },
                            componentDidMount: function () {
                                this.listenAndSet(Model, {fields: ['x']}, 'singleton')
                                    .then(function (singleton) {
                                        singleton.x = '123';
                                        siesta.notify();
                                    }.bind(this)).catch(done);
                            }
                        });
                        React.render(
                            React.createElement(Component, null),
                            document.getElementById('react')
                        );
                    }).catch(done);
                });
            });

        });
    });

});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWQuanMiLCJzb3VyY2VzIjpbbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLFFBQVEsQ0FBQyxjQUFjLEVBQUUsWUFBWTtJQUNqQyxJQUFJLFVBQVUsRUFBRSxLQUFLLENBQUM7SUFDdEIsVUFBVSxDQUFDLFVBQVUsSUFBSSxFQUFFO1FBQ3ZCLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsS0FBSyxDQUFDLENBQUM7O0lBRUgsUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFZO1FBQzNCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxJQUFJLEVBQUU7WUFDM0IsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0MsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUM5QixVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUM7YUFDcEIsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLCtCQUErQix5QkFBQTtvQkFDL0IsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDO29CQUNyQixNQUFNLEVBQUUsWUFBWTt3QkFDaEIsUUFBUSxvQkFBQSxNQUFLLEVBQUEsSUFBUSxDQUFBLEVBQUU7cUJBQzFCO29CQUNELGlCQUFpQixFQUFFLFlBQVk7d0JBQzNCLElBQUksWUFBWSxDQUFDO3dCQUNqQixZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7NEJBQzlDLFlBQVksRUFBRSxDQUFDOzRCQUNmLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFT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LE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDO3FDQUNqRCxJQUFJLENBQUMsVUFBVSxTQUFTLEVBQUU7d0NBQ3ZCLFNBQVMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO3dDQUNwQixNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7cUNBQ25CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOzZCQUNqQzt5QkFDSixDQUFDLENBQUM7d0JBQ0gsS0FBSyxDQUFDLE1BQU07NEJBQ1Isb0JBQUMsU0FBUyxFQUFBLElBQUEsQ0FBRyxDQUFBOzRCQUNiLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO3lCQUNuQyxDQUFDO3FCQUNMLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ2xCLENBQUMsQ0FBQztBQUNuQixhQUFhLENBQUMsQ0FBQzs7U0FFTixDQUFDLENBQUM7QUFDWCxLQUFLLENBQUMsQ0FBQzs7Q0FFTixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgYXNzZXJ0ID0gY2hhaS5hc3NlcnQ7XG5cbmRlc2NyaWJlKCdyZWFjdCBzaWVzdGEnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIENvbGxlY3Rpb24sIE1vZGVsO1xuICAgIGJlZm9yZUVhY2goZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgc2llc3RhLnJlc2V0KGRvbmUpO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJ2xpc3RlbicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaXQoJ2luc3RhbmNlJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgTW9kZWwgPSBDb2xsZWN0aW9uLm1vZGVsKCdNb2RlbCcsIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBNb2RlbC5tYXAoe3g6IDF9KS50aGVuKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGluc3RhbmNlID0gbTtcbiAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYW5jZWxMaXN0ZW47XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW4gPSB0aGlzLmxpc3RlbihpbnN0YW5jZSwgZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnVtTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydChudW1MaXN0ZW5lcnMgPT0gMCwgJ1Nob3VsZCBub3cgYmUgMCBsaXN0ZW5lcnMgYnV0IHRoZXJlIGFyZSAnICsgbnVtTGlzdGVuZXJzICsgJyBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBudW1MaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQobnVtTGlzdGVuZXJzID09IDEsICdTaG91bGQgbm93IGJlIDEgbGlzdGVuZXIgYnV0IHRoZXJlIGFyZSAnICsgbnVtTGlzdGVuZXJzICsgJyBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS54ID0gMjtcbiAgICAgICAgICAgIH0pLmNhdGNoKGRvbmUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2luZ2xldG9uJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgTW9kZWwgPSBDb2xsZWN0aW9uLm1vZGVsKCdNb2RlbCcsIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXSxcbiAgICAgICAgICAgICAgICBzaW5nbGV0b246IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2FuY2VsTGlzdGVuO1xuICAgICAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW4gPSB0aGlzLmxpc3RlbihNb2RlbCwgZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG51bUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydChudW1MaXN0ZW5lcnMgPT0gMCwgJ1Nob3VsZCBub3cgYmUgMCBsaXN0ZW5lcnMgYnV0IHRoZXJlIGFyZSAnICsgbnVtTGlzdGVuZXJzICsgJyBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBudW1MaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGFzc2VydChudW1MaXN0ZW5lcnMgPT0gMSwgJ1Nob3VsZCBub3cgYmUgMSBsaXN0ZW5lciBidXQgdGhlcmUgYXJlICcgKyBudW1MaXN0ZW5lcnMgKyAnIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgTW9kZWwub25lKCkudGhlbihmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS54ID0gMjtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdyZWFjdGl2ZSBxdWVyeScsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogWyd4J11cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJxID0gTW9kZWwucmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICAgICAgcnEuaW5pdCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDxzcGFuPjwvc3Bhbj4pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNhbmNlbExpc3RlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbiA9IHRoaXMubGlzdGVuKHJxLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsTGlzdGVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG51bUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQobnVtTGlzdGVuZXJzID09IDAsICdTaG91bGQgbm93IGJlIDAgbGlzdGVuZXJzIGJ1dCB0aGVyZSBhcmUgJyArIG51bUxpc3RlbmVycyArICcgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnVtTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KG51bUxpc3RlbmVycyA9PSAxLCAnU2hvdWxkIG5vdyBiZSAxIGxpc3RlbmVyIGJ1dCB0aGVyZSBhcmUgJyArIG51bUxpc3RlbmVycyArICcgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgTW9kZWwubWFwKHt4OiAxfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ2FycmFuZ2VkIHJlYWN0aXZlIHF1ZXJ5JywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgTW9kZWwgPSBDb2xsZWN0aW9uLm1vZGVsKCdNb2RlbCcsIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnLCAnaW5kZXgnXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcnEgPSBNb2RlbC5hcnJhbmdlZFJlYWN0aXZlUXVlcnkoKTtcbiAgICAgICAgICAgIHJxLmluaXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYW5jZWxMaXN0ZW47XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW4gPSB0aGlzLmxpc3RlbihycSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBudW1MaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KG51bUxpc3RlbmVycyA9PSAwLCAnU2hvdWxkIG5vdyBiZSAwIGxpc3RlbmVycyBidXQgdGhlcmUgYXJlICcgKyBudW1MaXN0ZW5lcnMgKyAnIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG51bUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydChudW1MaXN0ZW5lcnMgPT0gMSwgJ1Nob3VsZCBub3cgYmUgMSBsaXN0ZW5lciBidXQgdGhlcmUgYXJlICcgKyBudW1MaXN0ZW5lcnMgKyAnIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIE1vZGVsLm1hcCh7eDogMX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaXQoJ3F1ZXJ5JywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXVxuICAgICAgICB9KTtcbiAgICAgICAgTW9kZWwubWFwKFt7eDogMn0sIHt4OiAzfV0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodXNlcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucXVlcnkoTW9kZWwsIHt4OiAyfSwgJ3VzZXJzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbCh0aGlzLnN0YXRlLnVzZXJzLmxlbmd0aCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUudXNlcnMsIHVzZXJzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSkuY2F0Y2goZG9uZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZG9uZSk7XG5cbiAgICB9KTtcblxuICAgIGl0KCdhbGwnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgTW9kZWwgPSBDb2xsZWN0aW9uLm1vZGVsKCdNb2RlbCcsIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddXG4gICAgICAgIH0pO1xuICAgICAgICBNb2RlbC5tYXAoW3t4OiAyfSwge3g6IDN9XSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh1c2Vycykge1xuICAgICAgICAgICAgICAgIHZhciBDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDxzcGFuPjwvc3Bhbj4pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hbGwoTW9kZWwsICd1c2VycycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwodGhpcy5zdGF0ZS51c2Vycy5sZW5ndGgsIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLnVzZXJzLCB1c2Vyc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUudXNlcnMsIHVzZXJzWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSkuY2F0Y2goZG9uZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZG9uZSk7XG5cbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCdsaXN0ZW4gYW5kIHNldCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGVzY3JpYmUoJ3JlYWN0aXZlIHF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuXG5cbiAgICAgICAgICAgIGl0KCdpbml0aWFsaXNlZCcsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgICAgICAgICAgTW9kZWwgPSBDb2xsZWN0aW9uLm1vZGVsKCdNb2RlbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogWyd4J11cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBNb2RlbC5tYXAoW3t4OiAyfSwge3g6IDN9XSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGluc3RhbmNlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJxID0gTW9kZWwucmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcnEuaW5pdCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDxzcGFuPjwvc3Bhbj4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0ZW5BbmRTZXQocnEsICdtb2RlbHMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbCh0aGlzLnN0YXRlLm1vZGVscy5sZW5ndGgsIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLm1vZGVscywgaW5zdGFuY2VzWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGRvbmUpO1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCdub3QgaW5pdGlhbGlzZWQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgTW9kZWwubWFwKFt7eDogMn0sIHt4OiAzfV0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnN0YW5jZXMnLCBpbnN0YW5jZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJxID0gTW9kZWwucmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbkFuZFNldChycSwgJ21vZGVscycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3N0YXRlJywgdGhpcy5zdGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHRoaXMuc3RhdGUubW9kZWxzLmxlbmd0aCwgMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKS5jYXRjaChkb25lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGRvbmUpO1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd1cGRhdGUnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgTW9kZWwubWFwKFt7eDogMn0sIHt4OiAzfV0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnN0YW5jZXMnLCBpbnN0YW5jZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJxID0gTW9kZWwucmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbkFuZFNldChycSwgJ21vZGVscycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kZWwubWFwKHt4OiA0fSkudGhlbihmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHRoaXMuc3RhdGUubW9kZWxzLmxlbmd0aCwgMyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLm1vZGVscywgaW5zdGFuY2VzWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSkuY2F0Y2goZG9uZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZG9uZSk7XG5cbiAgICAgICAgICAgIH0pO1xuXG5cblxuICAgICAgICB9KTtcbiAgICAgICAgZGVzY3JpYmUoJ2FycmFuZ2VkIHJlYWN0aXZlIHF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaXQoJ2luaXRpYWxpc2VkJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnLCAnaW5kZXgnXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnEgPSBNb2RlbC5hcnJhbmdlZFJlYWN0aXZlUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJxLmluaXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KHJxLCAnbW9kZWxzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwodGhpcy5zdGF0ZS5tb2RlbHMubGVuZ3RoLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnbm90IGluaXRpYWxpc2VkJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnLCAnaW5kZXgnXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaW5zdGFuY2VzJywgaW5zdGFuY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBycSA9IE1vZGVsLmFycmFuZ2VkUmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbkFuZFNldChycSwgJ21vZGVscycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHRoaXMuc3RhdGUubW9kZWxzLmxlbmd0aCwgMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKS5jYXRjaChkb25lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGRvbmUpO1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd1cGRhdGUnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgTW9kZWwubWFwKFt7eDogMn0sIHt4OiAzfV0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnN0YW5jZXMnLCBpbnN0YW5jZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJxID0gTW9kZWwuYXJyYW5nZWRSZWFjdGl2ZVF1ZXJ5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KHJxLCAnbW9kZWxzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RlbC5tYXAoe3g6IDR9KS50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwodGhpcy5zdGF0ZS5tb2RlbHMubGVuZ3RoLCAzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLm1vZGVscywgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKS5jYXRjaChkb25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSkuY2F0Y2goZG9uZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgICAgIGRlc2NyaWJlKCdzaW5nbGV0b24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpdCgneHl6JywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXSxcbiAgICAgICAgICAgICAgICAgICAgc2luZ2xldG9uOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2llc3RhLmluc3RhbGwoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbkFuZFNldChNb2RlbCwgJ3NpbmdsZXRvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGVsLm9uZSgpLnRoZW4oZnVuY3Rpb24gKHNpbmdsZXRvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbCh0aGlzLnN0YXRlLnNpbmdsZXRvbiwgc2luZ2xldG9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZG9uZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd1cGRhdGUnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddLFxuICAgICAgICAgICAgICAgICAgICBzaW5nbGV0b246IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzaWVzdGEuaW5zdGFsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWl4aW5zOiBbU2llc3RhTWl4aW5dLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91bGRDb21wb25lbnRVcGRhdGU6IGZ1bmN0aW9uIChuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0U3RhdGUuc2luZ2xldG9uLnggPT0gJzEyMycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KE1vZGVsLCAnc2luZ2xldG9uJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kZWwub25lKCkudGhlbihmdW5jdGlvbiAoc2luZ2xldG9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2luZ2xldG9uLnggPSAnMTIzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWVzdGEubm90aWZ5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZG9uZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRlc2NyaWJlKCdmaWVsZHMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaXQoJ2luaXQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICAgICAgTW9kZWwgPSBDb2xsZWN0aW9uLm1vZGVsKCdNb2RlbCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3gnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6IDFcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAneScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogMlxuICAgICAgICAgICAgICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzaW5nbGV0b246IHRydWVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNpZXN0YS5pbnN0YWxsKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KE1vZGVsLCB7ZmllbGRzOiBbJ3gnXX0sICdzaW5nbGV0b24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbCh0aGlzLnN0YXRlLngsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5ub3RPayh0aGlzLnN0YXRlLnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSkuY2F0Y2goZG9uZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goZG9uZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaXQoJ3VwZGF0ZScsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlczogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAneCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDogMVxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICd5JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OiAyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpbmdsZXRvbjogdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc2llc3RhLmluc3RhbGwoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWl4aW5zOiBbU2llc3RhTWl4aW5dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDxzcGFuPjwvc3Bhbj4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbiAobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRTdGF0ZS54ID09ICcxMjMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KE1vZGVsLCB7ZmllbGRzOiBbJ3gnXX0sICdzaW5nbGV0b24nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHNpbmdsZXRvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpbmdsZXRvbi54ID0gJzEyMyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2llc3RhLm5vdGlmeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKS5jYXRjaChkb25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KTtcbiJdfQ==