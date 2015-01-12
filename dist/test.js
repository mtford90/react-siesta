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
    })

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


        })


    });


});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWQuanMiLCJzb3VyY2VzIjpbbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLFFBQVEsQ0FBQyxjQUFjLEVBQUUsWUFBWTtJQUNqQyxJQUFJLFVBQVUsRUFBRSxLQUFLLENBQUM7SUFDdEIsVUFBVSxDQUFDLFVBQVUsSUFBSSxFQUFFO1FBQ3ZCLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsS0FBSyxDQUFDLENBQUM7O0lBRUgsUUFBUSxDQUFDLFFBQVEsRUFBRSxZQUFZO1FBQzNCLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxJQUFJLEVBQUU7WUFDM0IsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0MsS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO2dCQUM5QixVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUM7YUFDcEIsQ0FBQyxDQUFDO1lBQ0gsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDaEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUNqQixJQUFJLCtCQUErQix5QkFBQTtvQkFDL0IsTUFBTSxFQUFFLENBQUMsV0FBVyxDQUFDO29CQUNyQixNQUFNLEVBQUUsWUFBWTt3QkFDaEIsUUFBUSxvQkFBQSxNQUFLLEVBQUEsSUFBUSxDQUFBLEVBQUU7cUJBQzFCO29CQUNELGlCQUFpQixFQUFFLFlBQVk7d0JBQzNCLElBQUksWUFBWSxDQUFDO3dCQUNqQixZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLEVBQUU7NEJBQzlDLFlBQVksRUFBRSxDQUFDOzRCQUNmLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFT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LENBQUMsT0FBTyxDQUFDO3FCQUNuQyxDQUFDO2lCQUNMLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsYUFBYSxDQUFDLENBQUM7QUFDZjs7QUFFQSxTQUFTLENBQUM7QUFDVjs7QUFFQSxLQUFLLENBQUMsQ0FBQztBQUNQOztDQUVDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbInZhciBhc3NlcnQgPSBjaGFpLmFzc2VydDtcblxuZGVzY3JpYmUoJ3JlYWN0IHNpZXN0YScsIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgQ29sbGVjdGlvbiwgTW9kZWw7XG4gICAgYmVmb3JlRWFjaChmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICBzaWVzdGEucmVzZXQoZG9uZSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnbGlzdGVuJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBpdCgnaW5zdGFuY2UnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE1vZGVsLm1hcCh7eDogMX0pLnRoZW4oZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5zdGFuY2UgPSBtO1xuICAgICAgICAgICAgICAgIHZhciBDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDxzcGFuPjwvc3Bhbj4pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNhbmNlbExpc3RlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbiA9IHRoaXMubGlzdGVuKGluc3RhbmNlLCBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBudW1MaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KG51bUxpc3RlbmVycyA9PSAwLCAnU2hvdWxkIG5vdyBiZSAwIGxpc3RlbmVycyBidXQgdGhlcmUgYXJlICcgKyBudW1MaXN0ZW5lcnMgKyAnIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG51bUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydChudW1MaXN0ZW5lcnMgPT0gMSwgJ1Nob3VsZCBub3cgYmUgMSBsaXN0ZW5lciBidXQgdGhlcmUgYXJlICcgKyBudW1MaXN0ZW5lcnMgKyAnIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnggPSAyO1xuICAgICAgICAgICAgfSkuY2F0Y2goZG9uZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaW5nbGV0b24nLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddLFxuICAgICAgICAgICAgICAgIHNpbmdsZXRvbjogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYW5jZWxMaXN0ZW47XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbiA9IHRoaXMubGlzdGVuKE1vZGVsLCBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsTGlzdGVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnVtTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KG51bUxpc3RlbmVycyA9PSAwLCAnU2hvdWxkIG5vdyBiZSAwIGxpc3RlbmVycyBidXQgdGhlcmUgYXJlICcgKyBudW1MaXN0ZW5lcnMgKyAnIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG51bUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KG51bUxpc3RlbmVycyA9PSAxLCAnU2hvdWxkIG5vdyBiZSAxIGxpc3RlbmVyIGJ1dCB0aGVyZSBhcmUgJyArIG51bUxpc3RlbmVycyArICcgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBNb2RlbC5vbmUoKS50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnggPSAyO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3JlYWN0aXZlIHF1ZXJ5JywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgTW9kZWwgPSBDb2xsZWN0aW9uLm1vZGVsKCdNb2RlbCcsIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgcnEgPSBNb2RlbC5yZWFjdGl2ZVF1ZXJ5KCk7XG4gICAgICAgICAgICBycS5pbml0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgbWl4aW5zOiBbU2llc3RhTWl4aW5dLFxuICAgICAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2FuY2VsTGlzdGVuO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsTGlzdGVuID0gdGhpcy5saXN0ZW4ocnEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnVtTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydChudW1MaXN0ZW5lcnMgPT0gMCwgJ1Nob3VsZCBub3cgYmUgMCBsaXN0ZW5lcnMgYnV0IHRoZXJlIGFyZSAnICsgbnVtTGlzdGVuZXJzICsgJyBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBudW1MaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQobnVtTGlzdGVuZXJzID09IDEsICdTaG91bGQgbm93IGJlIDEgbGlzdGVuZXIgYnV0IHRoZXJlIGFyZSAnICsgbnVtTGlzdGVuZXJzICsgJyBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBNb2RlbC5tYXAoe3g6IDF9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnYXJyYW5nZWQgcmVhY3RpdmUgcXVlcnknLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCcsICdpbmRleCddXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBycSA9IE1vZGVsLmFycmFuZ2VkUmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICAgICAgcnEuaW5pdCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDxzcGFuPjwvc3Bhbj4pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNhbmNlbExpc3RlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbiA9IHRoaXMubGlzdGVuKHJxLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsTGlzdGVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG51bUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQobnVtTGlzdGVuZXJzID09IDAsICdTaG91bGQgbm93IGJlIDAgbGlzdGVuZXJzIGJ1dCB0aGVyZSBhcmUgJyArIG51bUxpc3RlbmVycyArICcgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnVtTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KG51bUxpc3RlbmVycyA9PSAxLCAnU2hvdWxkIG5vdyBiZSAxIGxpc3RlbmVyIGJ1dCB0aGVyZSBhcmUgJyArIG51bUxpc3RlbmVycyArICcgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgTW9kZWwubWFwKHt4OiAxfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSlcblxuICAgIGl0KCdxdWVyeScsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgYXR0cmlidXRlczogWyd4J11cbiAgICAgICAgfSk7XG4gICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHVzZXJzKSB7XG4gICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgbWl4aW5zOiBbU2llc3RhTWl4aW5dLFxuICAgICAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5KE1vZGVsLCB7eDogMn0sICd1c2VycycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwodGhpcy5zdGF0ZS51c2Vycy5sZW5ndGgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLnVzZXJzLCB1c2Vyc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGRvbmUpO1xuXG4gICAgfSk7XG5cbiAgICBpdCgnYWxsJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXVxuICAgICAgICB9KTtcbiAgICAgICAgTW9kZWwubWFwKFt7eDogMn0sIHt4OiAzfV0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodXNlcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWxsKE1vZGVsLCAndXNlcnMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHRoaXMuc3RhdGUudXNlcnMubGVuZ3RoLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS51c2VycywgdXNlcnNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLnVzZXJzLCB1c2Vyc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGRvbmUpO1xuXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnbGlzdGVuIGFuZCBzZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRlc2NyaWJlKCdyZWFjdGl2ZSBxdWVyeScsIGZ1bmN0aW9uICgpIHtcblxuXG4gICAgICAgICAgICBpdCgnaW5pdGlhbGlzZWQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgTW9kZWwubWFwKFt7eDogMn0sIHt4OiAzfV0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBycSA9IE1vZGVsLnJlYWN0aXZlUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJxLmluaXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KHJxLCAnbW9kZWxzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwodGhpcy5zdGF0ZS5tb2RlbHMubGVuZ3RoLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnbm90IGluaXRpYWxpc2VkJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaW5zdGFuY2VzJywgaW5zdGFuY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBycSA9IE1vZGVsLnJlYWN0aXZlUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWl4aW5zOiBbU2llc3RhTWl4aW5dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDxzcGFuPjwvc3Bhbj4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0ZW5BbmRTZXQocnEsICdtb2RlbHMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGF0ZScsIHRoaXMuc3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbCh0aGlzLnN0YXRlLm1vZGVscy5sZW5ndGgsIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSkuY2F0Y2goZG9uZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgndXBkYXRlJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaW5zdGFuY2VzJywgaW5zdGFuY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBycSA9IE1vZGVsLnJlYWN0aXZlUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBDb21wb25lbnQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWl4aW5zOiBbU2llc3RhTWl4aW5dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKDxzcGFuPjwvc3Bhbj4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0ZW5BbmRTZXQocnEsICdtb2RlbHMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGVsLm1hcCh7eDogNH0pLnRoZW4oZnVuY3Rpb24gKGluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbCh0aGlzLnN0YXRlLm1vZGVscy5sZW5ndGgsIDMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLm1vZGVscywgaW5zdGFuY2VzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKS5jYXRjaChkb25lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGRvbmUpO1xuXG4gICAgICAgICAgICB9KTtcblxuXG5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZGVzY3JpYmUoJ2FycmFuZ2VkIHJlYWN0aXZlIHF1ZXJ5JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaXQoJ2luaXRpYWxpc2VkJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnLCAnaW5kZXgnXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcnEgPSBNb2RlbC5hcnJhbmdlZFJlYWN0aXZlUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJxLmluaXQoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KHJxLCAnbW9kZWxzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwodGhpcy5zdGF0ZS5tb2RlbHMubGVuZ3RoLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcblxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdCgnbm90IGluaXRpYWxpc2VkJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnLCAnaW5kZXgnXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaW5zdGFuY2VzJywgaW5zdGFuY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBycSA9IE1vZGVsLmFycmFuZ2VkUmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbkFuZFNldChycSwgJ21vZGVscycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHRoaXMuc3RhdGUubW9kZWxzLmxlbmd0aCwgMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKS5jYXRjaChkb25lKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKGRvbmUpO1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd1cGRhdGUnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgTW9kZWwubWFwKFt7eDogMn0sIHt4OiAzfV0pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnN0YW5jZXMnLCBpbnN0YW5jZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJxID0gTW9kZWwuYXJyYW5nZWRSZWFjdGl2ZVF1ZXJ5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KHJxLCAnbW9kZWxzJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNb2RlbC5tYXAoe3g6IDR9KS50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwodGhpcy5zdGF0ZS5tb2RlbHMubGVuZ3RoLCAzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLm1vZGVscywgaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKS5jYXRjaChkb25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSkuY2F0Y2goZG9uZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSk7XG4gICAgICAgIGRlc2NyaWJlKCdzaW5nbGV0b24nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpdCgneHl6JywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXSxcbiAgICAgICAgICAgICAgICAgICAgc2luZ2xldG9uOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2llc3RhLmluc3RhbGwoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbkFuZFNldChNb2RlbCwgJ3NpbmdsZXRvbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1vZGVsLm9uZSgpLnRoZW4oZnVuY3Rpb24gKHNpbmdsZXRvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbCh0aGlzLnN0YXRlLnNpbmdsZXRvbiwgc2luZ2xldG9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZG9uZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0KCd1cGRhdGUnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddLFxuICAgICAgICAgICAgICAgICAgICBzaW5nbGV0b246IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzaWVzdGEuaW5zdGFsbCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWl4aW5zOiBbU2llc3RhTWl4aW5dLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG91bGRDb21wb25lbnRVcGRhdGU6IGZ1bmN0aW9uIChuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXh0U3RhdGUuc2luZ2xldG9uLnggPT0gJzEyMycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KE1vZGVsLCAnc2luZ2xldG9uJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTW9kZWwub25lKCkudGhlbihmdW5jdGlvbiAoc2luZ2xldG9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2luZ2xldG9uLnggPSAnMTIzJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaWVzdGEubm90aWZ5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZG9uZSk7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIH0pXG5cblxuICAgIH0pO1xuXG5cbn0pO1xuIl19