var assert = chai.assert;

describe('query', function () {
    var Collection, Model;
    beforeEach(function (done) {
        siesta.reset(done);
    });

    it('query', function (done) {
        Collection = siesta.collection('Collection');
        Model = Collection.model('Model', {
            attributes: ['x']
        });
        Model.map([{x: 2}, {x: 3}])
            .then(function (users) {
                var Component = React.createClass({
                    mixins: [SiestaMixin],
                    render: function () {
                        return (<span></span>);
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
                    <Component />,
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
                var Component = React.createClass({
                    mixins: [SiestaMixin],
                    render: function () {
                        return (<span></span>);
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
                    <Component />,
                    document.getElementById('react')
                );
            })
            .catch(done);

    });

});