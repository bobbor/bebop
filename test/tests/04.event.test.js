/*jshint browser:true */
/*globals define,before,after,it,expect,describe,Fixture,sinon */
(function() {
    'use strict';
    var fix, fixtures, html;
    var oldready = document.readyState, newReady;
    window.$.ready(function(ev) {
        newReady = ev;
    });
    describe('::Event::', function() {

        before(function() {
            fix = new Fixture('test/fixtures');
            fixtures = fix.load('event.html');
        });

        after(function() {
            fix.cleanup();
        });

        describe('.click', function() {
            it('should click', function() {
                var eventhandler = sinon.spy();
                var elm = $.one('#event a')._node;
                elm.addEventListener('click', eventhandler, false);
                $.one('#event a').click();
                elm.removeEventListener('click', eventhandler);
                //noinspection BadExpressionStatementJS
                expect(eventhandler.called).to.be.true; // jshint ignore:line
            });
        });

        describe('on/off', function() {
            it('should allow to listen and to stop listening to an event', function() {
                var eventhandler = sinon.spy();
                var elm = $.one('#event a');
                elm.on('click', eventhandler);
                elm.click();
                elm.off('click', eventhandler);
                elm.click();
                //noinspection BadExpressionStatementJS
                expect(eventhandler.called).to.be.true; // jshint ignore:line
                expect(eventhandler.callCount).to.equal(1);
            });
            it('should be possible to unbind certain listener', function() {
                var handler1 = sinon.spy();
                var handler2 = sinon.spy();
                var elm = $.one('#event a');

                elm.on('click', handler1);
                elm.on('click', handler2);
                elm.click();
                elm.off('click', handler2);
                elm.click();
                elm.off('click', handler1);

                expect(handler1.callCount).to.equal(2);
                expect(handler2.callCount).to.equal(1);
            });

            it('should bind to selector in child', function() {
                var handler1 = sinon.spy();

                var elm = $.one('#event');
                elm.on('click', handler1, 'a');
                elm.one('a').click();

                expect(handler1.callCount).to.equal(1);

            });

            it('should not trigger, if selector is not in wrapper', function() {
                var handler1 = sinon.spy();

                var elm = $.one('#event');
                elm.on('click', handler1, 'pre');
                elm.one('a').click();
                expect(handler1.callCount).to.equal(0);
            });

            it('should not trigger, if selector is in wrapper but not target', function() {
                var handler1 = sinon.spy();

                var elm = $.one('#event');
                elm.on('click', handler1, 'span');
                elm.one('a').click();
                expect(handler1.callCount).to.equal(0);
            });
            it('(off) should throw all if no callback defined', function() {
                var elm = $.one('#event a');
                var off = function() {
                    elm.off('click');
                };

                expect(off).to.throw(Error).and.to.match(/no callback defined/);
            });

            it('(off) should throw if callback was never bound', function() {
                var elm = $.one('#event a');
                var a = function() {
                };
                var b = function() {
                };

                elm.on('click', a);
                var off = function() {
                    elm.off('click', b);
                };
                expect(off).to.throw(Error).and.to.match(/no such callback/);
            });
        });

        describe('once', function() {
            it('should listen', function() {
                var eventhandler = sinon.spy();
                var elm = $.one('#event a');
                elm.once('click', eventhandler);
                elm.click();
                //noinspection BadExpressionStatementJS
                expect(eventhandler.called).to.be.true; // jshint ignore:line
                expect(eventhandler.callCount).to.equal(1);
            });
            it('should listen only once', function() {
                var eventhandler = sinon.spy();
                var elm = $.one('#event a');
                elm.once('click', eventhandler);
                elm.click();
                elm.click();
                expect(eventhandler.callCount).to.equal(1);
            });
        });

        describe('purge', function() {
            it('should unbind all', function() {
                var handler1 = sinon.spy();
                var handler2 = sinon.spy();

                var elm = $.one('#event a');

                elm.on('click', handler1);
                elm.on('click', handler2);
                elm.click();
                elm.purge('click');
                elm.click();

                expect(handler1.callCount).to.equal(1);
                expect(handler2.callCount).to.equal(1);
            });

            it('should deep unbind', function() {
                var handler1 = sinon.spy();
                var handler2 = sinon.spy();

                var elm = $.one('#event');

                elm.on('click', handler1);
                elm.one('a').on('click', handler2);
                elm.one('a').click();
                elm.purge('click', undefined, true);
                elm.one('a').click();

                expect(handler1.callCount).to.equal(1);
                expect(handler2.callCount).to.equal(1);
            });
        });

        describe('fire', function() {
            it('should fire', function() {
                var eventhandler = sinon.spy();
                var elm = $.one('#event a');
                elm.once('mouseover', eventhandler);
                elm.fire('mouseover');

                //noinspection JSUnresolvedVariable
                expect(eventhandler.called).to.be.true; // jshint ignore:line
            });
            it('should fire with data', function() {
                var eventhandler = sinon.spy();
                var elm = $.one('#event a');
                elm.once('mouseover', eventhandler);
                elm.fire('mouseover', 'data');
                //noinspection JSUnresolvedVariable
                expect(eventhandler.called).to.be.true; // jshint ignore:line
                expect(eventhandler.args[0][1]).to.not.be.undefined; // jshint ignore:line
                expect(eventhandler.args[0][1]).to.equal('data');
            });

            it('should fire custom events', function() {
                var eventhandler = sinon.spy();
                var elm = $.one('#event a');
                elm.once('xyz', eventhandler);
                elm.fire('xyz', 'data');

                //noinspection BadExpressionStatementJS
                expect(eventhandler.called).to.be.true; // jshint ignore:line
                expect(eventhandler.args[0][1]).to.not.be.undefined; // jshint ignore:line
                expect(eventhandler.args[0][1]).to.equal('data');
            });
        });

        describe('ready', function() {
            it('should be called when (already) ready', function(done) {
                expect(oldready).to.not.equal('complete');
                $.ready(function() {
                    expect(document.readyState).to.match(/\bcomplete|interactive\b/);
                    expect(newReady).to.equal('DOMContentLoaded');
                    done();
                });
            });
        });
    });
}());
