/*jshint browser:true */
/*globals define,before,after,it,expect,describe,Fixture */
(function () {
    'use strict';
    var $ = window.DOM;
    var fix;
    describe('::ElementList::', function () {
        before(function () {
            fix = new Fixture('test/fixtures');
            var fixtures = fix.load('list.html');
        });
        after(function () {
            fix.cleanup();
        });
        describe('::core::', function () {
            it('should be around :D', function () {
                expect($.ElementList).to.be.a('function');
            });
            it('should be the result of all', function () {
                var collection = $.all('section');
                expect(collection).to.be.an('object');
                expect(collection).to.be.an.instanceof($.ElementList);
            });
            it('should be the result of all proxied', function () {
                var wrapper = $.one('#section_two', fix.el);
                var collection = wrapper.all('a');
                expect(collection).to.be.an('object');
                expect(collection).to.be.an.instanceof($.ElementList);
            });
            it('should be a collection even if only one element', function () {
                var wrapper = $.one('#section_two', fix.el);
                var collection = wrapper.all('span');
                expect(collection).to.be.an('object');
                expect(collection).to.be.an.instanceof($.ElementList);
            });
        });
        describe('::collection of nodes::', function () {
            it('should provide several core apis', function () {
                var collection = $.all('section');
                var methods = ['remove', 'addClass', 'removeClass', 'toggleClass', 'prop', 'attr', 'setStyle',
                    'setStyles', 'removeStyle', 'removeStyles'];
                for (var i = 0; i < methods.lenth; i++) {
                    expect(collection[methods[i]]).to.be.a('function');
                }
            });
            it('should not provide useless stuff', function () {
                var collection = $.all('section');
                expect(collection.prependTo).to.not.be.a('function');
            });
            it('should behave as used on single node', function () {
                var collection = $.all('section');
                collection.attr('data-foo', 'bar');
                var collectionAlt = $.all('[data-foo="bar"]');
                expect(collection.nodes).to.deep.equal(collectionAlt.nodes);
            });
        });
        describe('::specialties::', function () {
            it('should provide several specific functions', function () {
                var collection = $.all('section');
                var methods = ['forEach', 'map', 'reduce', 'item', 'size', 'get'];
                for (var i = 0; i < methods.lenth; i++) {
                    expect(collection[methods[i]]).to.be.a('function');
                }
            });
            describe('size', function () {
                it('should count multiple items', function () {
                    var collection = $.all('section');
                    expect(collection.size()).to.equal(2);
                });
                it('should count single items', function () {
                    var wrapper = $.one('#section_two', fix.el);
                    var collection = wrapper.all('span');
                    expect(collection.size()).to.equal(1);
                });
                it('should (not) count non-existing items', function () {
                    var wrapper = $.one('#section_two', fix.el);
                    var collection = wrapper.all('p');
                    expect(collection.size()).to.equal(0);
                });
            });
            describe('item', function () {
                it('should get an item at an index', function () {
                    var collection = $.all('section');
                    var item = collection.item(0);
                    expect(item).to.be.an.instanceOf($.Element);
                });
                it('should get the correct item at an index', function () {
                    var collection = $.all('section');
                    var item = collection.item(0);
                    expect(item).to.be.equal(collection.nodes[0]);
                });
                it('should return null if no index provided', function () {
                    var collection = $.all('section');
                    var item = collection.item();
                    //noinspection BadExpressionStatementJS
                    expect(item).to.be.null; // jshint ignore:line
                });
                it('should return undefined if index out of bounds', function () {
                    var collection = $.all('section');
                    var item = collection.item(2);
                    //noinspection BadExpressionStatementJS
                    expect(item).to.be.undefined; // jshint ignore:line
                    item = collection.item(-1);
                    //noinspection BadExpressionStatementJS
                    expect(item).to.be.undefined; // jshint ignore:line
                });
            });
            describe('get', function () {
                it('should return the dom-node at an index', function () {
                    var collection = $.all('section');
                    var item = collection.get(0);
                    expect(item).to.be.an.instanceOf(window.HTMLElement);
                    expect(item.nodeType).to.equal(1);
                });
                it('should return all nodes if no index specified', function () {
                    var collection = $.all('section');
                    var items = collection.get();
                    expect(items).to.be.an('array');
                    expect(items.length).to.equal(2);
                });
                it('should return undefined if index out of bounds', function () {
                    var collection = $.all('section');
                    var item = collection.get(2);
                    //noinspection BadExpressionStatementJS
                    expect(item).to.be.undefined; // jshint ignore:line
                    item = collection.get(-1);
                    //noinspection BadExpressionStatementJS
                    expect(item).to.be.undefined; // jshint ignore:line
                });
                it('should not be the same as item', function () {
                    var collection = $.all('section');
                    var domItem = collection.get(1);
                    var nodeItem = collection.item(1);
                    expect(domItem).to.not.equal(nodeItem);
                    expect(nodeItem._node).to.equal(domItem);
                });
            });
            it('should do stuff for Each entry', function () {
                var collection = $.all('section');
                collection.forEach(function (node, idx) {
                    expect(node).to.equal(collection.item(idx));
                });
            });
            it('should map', function () {
                var collection = $.all('section');
                var mapped = collection.map(function (node, idx) {
                    return {
                        idx: idx,
                        node: node
                    };
                });
                expect(mapped).to.be.an('array');
                expect(mapped[0]).to.have.property('node');
                expect(mapped[0].node).to.equal(collection.item(0));
            });
            it('should reduce', function () {
                var collection = $.all('section');
                var reduced = collection.reduce(function (current, node) {
                    return current + node.prop('id');
                }, '');
                expect(reduced).to.equal('section_onesection_two');
            });
        });
    });
}());