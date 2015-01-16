var assert = chai.assert;


describe('nested mixins', function () {
    var Collection, Model;
    beforeEach(function (done) {
        siesta.reset(done);
    });
    it('initialised', function (done) {
        var AnotherMixin = {
            mixins: [SiestaMixin]
        };
        Collection = siesta.collection('Collection');
        Model = Collection.model('Model', {
            attributes: ['x'],
            singleton: true
        });
        siesta.install().then(function () {
            var Component = React.createClass({
                mixins: [AnotherMixin],
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

