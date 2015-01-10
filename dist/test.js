var assert = chai.assert;

describe('listen', function () {
    var Collection, Model;
    beforeEach(function (done) {
        siesta.reset(done);
    });

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
        it('reactive query, initialised', function (done) {
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
        it('reactive query, not initialised', function (done) {
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
        it('arranged reactive query, initialised', function (done) {
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
        it('arranged reactive query, not initialised', function (done) {
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
    });


});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWQuanMiLCJzb3VyY2VzIjpbbnVsbF0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O0FBRXpCLFFBQVEsQ0FBQyxRQUFRLEVBQUUsWUFBWTtJQUMzQixJQUFJLFVBQVUsRUFBRSxLQUFLLENBQUM7SUFDdEIsVUFBVSxDQUFDLFVBQVUsSUFBSSxFQUFFO1FBQ3ZCLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsS0FBSyxDQUFDLENBQUM7O0lBRUgsRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFVLElBQUksRUFBRTtRQUMzQixVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM3QyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7WUFDOUIsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ3BCLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDaEMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksK0JBQStCLHlCQUFBO2dCQUMvQixNQUFNLEVBQUUsQ0FBQyxXQUFXLENBQUM7Z0JBQ3JCLE1BQU0sRUFBRSxZQUFZO29CQUNoQixRQUFRLG9CQUFBLE1BQUssRUFBQSxJQUFRLENBQUEsRUFBRTtpQkFDMUI7Z0JBQ0QsaUJBQWlCLEVBQUUsWUFBWTtvQkFDM0IsSUFBSSxZQUFZLENBQUM7b0JBQ2pCLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRTt3QkFDOUMsWUFBWSxFQUFFLENBQUM7d0JBQ2YsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7d0JBQ3pDLE1BQU0sQ0FBQyxZ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LENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO29DQUMxQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUNoRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29DQUNoRCxJQUFJLEVBQUUsQ0FBQztpQ0FDVixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7eUJBQ2hDO3FCQUNKLENBQUMsQ0FBQztvQkFDSCxLQUFLLENBQUMsTUFBTTt3QkFDUixvQkFBQyxTQUFTLEVBQUEsSUFBQSxDQUFHLENBQUE7d0JBQ2IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7cUJBQ25DLENBQUM7QUFDdEIsaUJBQWlCLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7O1NBRXRCLENBQUMsQ0FBQztBQUNYLEtBQUssQ0FBQyxDQUFDO0FBQ1A7O0NBRUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGFzc2VydCA9IGNoYWkuYXNzZXJ0O1xuXG5kZXNjcmliZSgnbGlzdGVuJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBDb2xsZWN0aW9uLCBNb2RlbDtcbiAgICBiZWZvcmVFYWNoKGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIHNpZXN0YS5yZXNldChkb25lKTtcbiAgICB9KTtcblxuICAgIGl0KCdpbnN0YW5jZScsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgYXR0cmlidXRlczogWyd4J11cbiAgICAgICAgfSk7XG4gICAgICAgIE1vZGVsLm1hcCh7eDogMX0pLnRoZW4oZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgICAgIHZhciBpbnN0YW5jZSA9IG07XG4gICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYW5jZWxMaXN0ZW47XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbiA9IHRoaXMubGlzdGVuKGluc3RhbmNlLCBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsTGlzdGVuKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnVtTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KG51bUxpc3RlbmVycyA9PSAwLCAnU2hvdWxkIG5vdyBiZSAwIGxpc3RlbmVycyBidXQgdGhlcmUgYXJlICcgKyBudW1MaXN0ZW5lcnMgKyAnIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG51bUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KG51bUxpc3RlbmVycyA9PSAxLCAnU2hvdWxkIG5vdyBiZSAxIGxpc3RlbmVyIGJ1dCB0aGVyZSBhcmUgJyArIG51bUxpc3RlbmVycyArICcgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgIDxDb21wb25lbnQgLz4sXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpbnN0YW5jZS54ID0gMjtcbiAgICAgICAgfSkuY2F0Y2goZG9uZSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2luZ2xldG9uJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXSxcbiAgICAgICAgICAgIHNpbmdsZXRvbjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FuY2VsTGlzdGVuO1xuICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbiA9IHRoaXMubGlzdGVuKE1vZGVsLCBmdW5jdGlvbiAobikge1xuICAgICAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG51bUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXJ0KG51bUxpc3RlbmVycyA9PSAwLCAnU2hvdWxkIG5vdyBiZSAwIGxpc3RlbmVycyBidXQgdGhlcmUgYXJlICcgKyBudW1MaXN0ZW5lcnMgKyAnIGluc3RlYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdmFyIG51bUxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBhc3NlcnQobnVtTGlzdGVuZXJzID09IDEsICdTaG91bGQgbm93IGJlIDEgbGlzdGVuZXIgYnV0IHRoZXJlIGFyZSAnICsgbnVtTGlzdGVuZXJzICsgJyBpbnN0ZWFkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgKTtcbiAgICAgICAgTW9kZWwub25lKCkudGhlbihmdW5jdGlvbiAoaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIGluc3RhbmNlLnggPSAyO1xuICAgICAgICB9KVxuICAgIH0pO1xuXG4gICAgaXQoJ3JlYWN0aXZlIHF1ZXJ5JywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHJxID0gTW9kZWwucmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICBycS5pbml0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYW5jZWxMaXN0ZW47XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbiA9IHRoaXMubGlzdGVuKHJxLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBudW1MaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQobnVtTGlzdGVuZXJzID09IDAsICdTaG91bGQgbm93IGJlIDAgbGlzdGVuZXJzIGJ1dCB0aGVyZSBhcmUgJyArIG51bUxpc3RlbmVycyArICcgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbnVtTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQobnVtTGlzdGVuZXJzID09IDEsICdTaG91bGQgbm93IGJlIDEgbGlzdGVuZXIgYnV0IHRoZXJlIGFyZSAnICsgbnVtTGlzdGVuZXJzICsgJyBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIE1vZGVsLm1hcCh7eDogMX0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdhcnJhbmdlZCByZWFjdGl2ZSBxdWVyeScsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgYXR0cmlidXRlczogWyd4JywgJ2luZGV4J11cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBycSA9IE1vZGVsLmFycmFuZ2VkUmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICBycS5pbml0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYW5jZWxMaXN0ZW47XG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbiA9IHRoaXMubGlzdGVuKHJxLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBudW1MaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVycy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQobnVtTGlzdGVuZXJzID09IDAsICdTaG91bGQgbm93IGJlIDAgbGlzdGVuZXJzIGJ1dCB0aGVyZSBhcmUgJyArIG51bUxpc3RlbmVycyArICcgaW5zdGVhZCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbnVtTGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICBhc3NlcnQobnVtTGlzdGVuZXJzID09IDEsICdTaG91bGQgbm93IGJlIDEgbGlzdGVuZXIgYnV0IHRoZXJlIGFyZSAnICsgbnVtTGlzdGVuZXJzICsgJyBpbnN0ZWFkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIE1vZGVsLm1hcCh7eDogMX0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGl0KCdxdWVyeScsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgYXR0cmlidXRlczogWyd4J11cbiAgICAgICAgfSk7XG4gICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHVzZXJzKSB7XG4gICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgbWl4aW5zOiBbU2llc3RhTWl4aW5dLFxuICAgICAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5KE1vZGVsLCB7eDogMn0sICd1c2VycycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwodGhpcy5zdGF0ZS51c2Vycy5sZW5ndGgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLnVzZXJzLCB1c2Vyc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGRvbmUpO1xuXG4gICAgfSk7XG5cbiAgICBpdCgnYWxsJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnXVxuICAgICAgICB9KTtcbiAgICAgICAgTW9kZWwubWFwKFt7eDogMn0sIHt4OiAzfV0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodXNlcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWxsKE1vZGVsLCAndXNlcnMnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHRoaXMuc3RhdGUudXNlcnMubGVuZ3RoLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS51c2VycywgdXNlcnNbMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLnVzZXJzLCB1c2Vyc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgUmVhY3QucmVuZGVyKFxuICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGRvbmUpO1xuXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnbGlzdGVuIGFuZCBzZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGl0KCdyZWFjdGl2ZSBxdWVyeSwgaW5pdGlhbGlzZWQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJxID0gTW9kZWwucmVhY3RpdmVRdWVyeSgpO1xuICAgICAgICAgICAgICAgICAgICBycS5pbml0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgQ29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuQW5kU2V0KHJxLCAnbW9kZWxzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5lcXVhbCh0aGlzLnN0YXRlLm1vZGVscy5sZW5ndGgsIDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLm1vZGVscywgaW5zdGFuY2VzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1sxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlYWN0LnJlbmRlcihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZWFjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcblxuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ3JlYWN0aXZlIHF1ZXJ5LCBub3QgaW5pdGlhbGlzZWQnLCBmdW5jdGlvbiAoZG9uZSkge1xuICAgICAgICAgICAgQ29sbGVjdGlvbiA9IHNpZXN0YS5jb2xsZWN0aW9uKCdDb2xsZWN0aW9uJyk7XG4gICAgICAgICAgICBNb2RlbCA9IENvbGxlY3Rpb24ubW9kZWwoJ01vZGVsJywge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IFsneCddXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE1vZGVsLm1hcChbe3g6IDJ9LCB7eDogM31dKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChpbnN0YW5jZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2luc3RhbmNlcycsIGluc3RhbmNlcyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBycSA9IE1vZGVsLnJlYWN0aXZlUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbkFuZFNldChycSwgJ21vZGVscycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGF0ZScsIHRoaXMuc3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHRoaXMuc3RhdGUubW9kZWxzLmxlbmd0aCwgMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLm1vZGVscywgaW5zdGFuY2VzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcblxuICAgICAgICB9KTtcbiAgICAgICAgaXQoJ2FycmFuZ2VkIHJlYWN0aXZlIHF1ZXJ5LCBpbml0aWFsaXNlZCcsIGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICAgICAgICBDb2xsZWN0aW9uID0gc2llc3RhLmNvbGxlY3Rpb24oJ0NvbGxlY3Rpb24nKTtcbiAgICAgICAgICAgIE1vZGVsID0gQ29sbGVjdGlvbi5tb2RlbCgnTW9kZWwnLCB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczogWyd4JywgJ2luZGV4J11cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTW9kZWwubWFwKFt7eDogMn0sIHt4OiAzfV0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGluc3RhbmNlcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcnEgPSBNb2RlbC5hcnJhbmdlZFJlYWN0aXZlUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgcnEuaW5pdCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaXhpbnM6IFtTaWVzdGFNaXhpbl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbkFuZFNldChycSwgJ21vZGVscycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuZXF1YWwodGhpcy5zdGF0ZS5tb2RlbHMubGVuZ3RoLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmluY2x1ZGUodGhpcy5zdGF0ZS5tb2RlbHMsIGluc3RhbmNlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvbXBvbmVudCAvPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVhY3QnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZG9uZSk7XG5cbiAgICAgICAgfSk7XG4gICAgICAgIGl0KCdhcnJhbmdlZCByZWFjdGl2ZSBxdWVyeSwgbm90IGluaXRpYWxpc2VkJywgZnVuY3Rpb24gKGRvbmUpIHtcbiAgICAgICAgICAgIENvbGxlY3Rpb24gPSBzaWVzdGEuY29sbGVjdGlvbignQ29sbGVjdGlvbicpO1xuICAgICAgICAgICAgTW9kZWwgPSBDb2xsZWN0aW9uLm1vZGVsKCdNb2RlbCcsIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzOiBbJ3gnLCAnaW5kZXgnXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBNb2RlbC5tYXAoW3t4OiAyfSwge3g6IDN9XSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoaW5zdGFuY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpbnN0YW5jZXMnLCBpbnN0YW5jZXMpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcnEgPSBNb2RlbC5hcnJhbmdlZFJlYWN0aXZlUXVlcnkoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIENvbXBvbmVudCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1peGluczogW1NpZXN0YU1peGluXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpc3RlbkFuZFNldChycSwgJ21vZGVscycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdGF0ZScsIHRoaXMuc3RhdGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzZXJ0LmVxdWFsKHRoaXMuc3RhdGUubW9kZWxzLmxlbmd0aCwgMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NlcnQuaW5jbHVkZSh0aGlzLnN0YXRlLm1vZGVscywgaW5zdGFuY2VzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2VydC5pbmNsdWRlKHRoaXMuc3RhdGUubW9kZWxzLCBpbnN0YW5jZXNbMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpLmNhdGNoKGRvbmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBSZWFjdC5yZW5kZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICA8Q29tcG9uZW50IC8+LFxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlYWN0JylcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChkb25lKTtcblxuICAgICAgICB9KTtcbiAgICB9KTtcblxuXG59KTtcbiJdfQ==