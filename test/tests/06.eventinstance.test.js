/*jshint browser:true */
/*globals define,before,after,it,expect,describe,Fixture,sinon */
(function() {
    'use strict';
    var $ = window.DOM, fix, fixtures;
    describe('EventInstance', function() {

        before(function() {
            fix = new Fixture('test/fixtures');
            fixtures = fix.load('eventinstance.html');
        });

        after(function() {
            fix.cleanup();
        });

        describe('instance', function() {
            it('should be the first parameter on event callback', function(done) {
                var el = $.one('#instance a', fix.el);
                el.on('click', function(e) {
                    expect(e).to.be.an('object');
                    expect(e).to.have.property('target').and.to.be.an.instanceOf($.Element);
                    expect(e).to.have.property('originalTarget').and.to.be.an.instanceOf($.Element);
                    done();
                });
                el.click();
            });
            it('should allow the event to not do the default', function(done) {
                var el = $.one('#instance a', fix.el);
                el.on('click', function(e) {
                    var preventDefault = sinon.spy(e._e, 'preventDefault');
                    e.noDefault();
                    expect(preventDefault.callCount).to.equal(1);
                    e._e.preventDefault.restore();
                    done();
                });
                el.click();
            });
            it('should allow the event to stop bubbling', function(done) {
                var el = $.one('#instance a', fix.el);
                el.on('click', function(e) {
                    var stopPropagation = sinon.spy(e._e, 'stopPropagation');
                    e.noBubble();
                    expect(stopPropagation.callCount).to.equal(1);
                    e._e.stopPropagation.restore();
                    done();
                });
                el.click();
            });
            it('should allow the event to stop bubbling and do no default', function(done) {
                var el = $.one('#instance a', fix.el);
                el.on('click', function(e) {
                    var preventDefault = sinon.spy(e._e, 'preventDefault');
                    var stopPropagation = sinon.spy(e._e, 'stopPropagation');
                    e.stop();
                    expect(preventDefault.callCount).to.equal(1);
                    expect(stopPropagation.callCount).to.equal(1);
                    e._e.preventDefault.restore();
                    e._e.stopPropagation.restore();
                    done();
                });
                el.click();
            });

            it('should have key (code) and mouse (pageX,pageY) props', function(done) {
                var el = $.one('#instance a', fix.el);
                el.on('click', function(e) {
                    expect(e.pageX()).to.equal(0);
                    expect(e.pageY()).to.equal(0);
                    done();
                });
                el.click();
            });
        });
    });
}());
