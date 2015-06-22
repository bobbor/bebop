/*jshint browser:true */
/*globals define, describe, before, after, it, expect, Fixture, sinon */
(function() {
    'use strict';
    var $ = window.DOM, fix, fixtures, json;
    describe('::Selector::', function() {
        before(function() {
            fix = new Fixture('test/fixtures');
            var fixtures = fix.load('selector.html', 'create_markup.json');
            json = fixtures[1];
        });
        after(function() {
            fix.cleanup();
        });

        describe('$.one', function() {
            it('should find one div', function() {
                expect($.one('div', fix.el)).to.not.equal(null);
            });
            it('should find only one div', function() {
                expect($.one('div', fix.el)).to.not.be.an.instanceOf($.ElementList);
            });
            it('should be null, if it does not find anything', function() {
                expect($.one('p', fix.el)).to.equal(null);
            });
            it('should find the first div', function() {
                expect($.one('div', fix.el)._node).to.equal(fix.el.getElementsByTagName('div')[0]);
            });
            it('should find by different selectors', function() {
                expect($.one('[lang|="en"]', fix.el)).to.not.equal(null);
                expect($.one('div > a[href^="#"]', fix.el)).to.not.equal(null);
            });
            it('should definitely find itself', function() {
                var el1 = $.one('div', fix.el);
                var el2 = $.one(el1);
                expect(el2._node).to.deep.equal(el1._node);
            });
            it('should be null if it does not find shit', function() {
                var el1 = $.one('p', fix.el);
                var el2 = $.one(el1);
                expect(el2).to.equal(el1).and.to.equal(null);
            });
        });

        describe('$.all', function() {
            it('should find a list of divs', function() {
                expect($.all('div')).to.be.an.instanceOf($.ElementList);
            });
            it('should find the right amount', function() {
                expect($.all('div', fix.el).size()).to.equal(2);
            });
            it('should still be a list, even if only one element', function() {
                var allA = $.all('a', fix.el);
                expect(allA).to.have.property('size');
                expect(allA).to.be.an.instanceOf($.ElementList);
            });
        });

        describe('$.create', function() {
            it('should create an element', function() {
                //noinspection BadExpressionStatementJS
                var newDOM = $.create(json.ex1);
                expect(newDOM).to.be.an.instanceOf($.Element);
            });

            it('should create an element with dom', function() {
                var newDOM = $.create(json.ex1);
                // this test actually passes successfully already when accessing innerHTML
                // coz this proves that _node is a documentFragment
                expect(newDOM._node.innerHTML).to.equal('text');
            });

            it('should create an element the way the browser does', function() {
                var code = json.error;
                var div = document.createElement('div');
                div.innerHTML = code;
                expect($.one('p', $.create(code)._node)._node.innerHTML).to.equal($.one('p', div)._node.innerHTML);
            });
        });
    });
}());
