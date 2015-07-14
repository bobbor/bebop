/*jshint browser:true */
/*globals define,before,after,it,expect,describe,Fixture */
(function () {
  'use strict';
  var $ = window.bebop, fix, fixtures, html;
  describe('::Element::', function () {

    before(function () {
      fix = new Fixture('test/fixtures');
      fixtures = fix.load('node.html');
    });
    after(function () {
      fix.cleanup();
    });

    describe('selector proxies', function () {
      it('should select the same one', function () {
        var ctx = $.one('#id2');
        expect($.one('button', ctx)._node).to.equal(ctx.one('button')._node);
      });
      it('should select the same all', function () {
        var ctx = $.one('#id2');
        var all1 = $.all('input', ctx);
        var all2 = ctx.all('input');
        expect(all1.size()).to.equal(all2.size());
        all1.forEach(function (el, idx) {
          expect(el._node).to.equal(all2.item(idx)._node);
        });
      });
    });

    describe('region', function() {
      it('should calculate the region', function() {
        var el = $.one('#id3', fix.el);
        var region = el.region();
        expect(region.top).to.equal(100);
        expect(region.left).to.equal(100);
        expect(region.width).to.equal(50);
        expect(region.height).to.equal(50);
        expect(region).to.have.property('left');
        expect(region).to.have.property('bottom');
      });
      it('should not find intersections', function() {
        var el = $.one('#id3', fix.el);
        var other = $.one('#id3nonintersect', fix.el);
        expect(el.intersects(other)).to.be.false;
      });
      it('should find intersections', function() {
        var el = $.one('#id3', fix.el);
        var other = $.one('#id3intersect', fix.el);
        expect(el.intersects(other)).to.be.true;
      });
    });

    describe('ancestors', function () {
      it('should create a ElementList of ancestors', function () {
        var nested = $.one('ul i', fix.el);
        var tree = nested.ancestors();
        expect(tree).to.be.an.instanceOf($.ElementList);
      });
      it('should include the node itself', function () {
        var nested = $.one('ul i', fix.el);
        var tree = nested.ancestors();
        //noinspection BadExpressionStatementJS
        expect(tree.item(0).is(nested)).to.be.true; // jshint ignore:line
      });
      it('should return an one element list, if on topmost element', function () {
        var nullEl = $.one(document);
        expect(nullEl.ancestors().size()).to.equal(1);
      });
      it('should sort the list bottom top', function () {
        var nested = $.one('ul i', fix.el);
        var tree = nested.ancestors();
        //noinspection BadExpressionStatementJS
        expect(tree.item(0).parent().is(tree.item(1))).to.be.true; // jshint ignore:line
      });
    });

    describe('matches', function () {
      it('should say yay if a selector matches', function () {
        expect($.one('form').matches('[action]')).to.equal(true);
      });
      it('should say ney if a selector does not match', function () {
        expect($.one('form').matches('[target]')).to.equal(false);
      });
      describe('nativeProperties', function () {
        it('document.body', function () {
          expect($.one('form').matches(document.body)).to.equal(false);
          expect($.one('body').matches(document.body)).to.equal(true);
        });
        it('document.documentElement', function () {
          expect($.one('form').matches(document.documentElement)).to.equal(false);
          expect($.one('html').matches(document.documentElement)).to.equal(true);
        });
        it('document', function () {
          expect($.one('form').matches(document)).to.equal(false);
          expect($.one(document).matches(document)).to.equal(true);
        });
      });
    });

    describe('is', function () {
      it('should tell if two element instances are the same node', function () {
        var el1 = $.one('form', fix.el);
        var el2 = $.all('form', fix.el).item(0);

        expect(el1.is(el2)).to.equal(true);
      });
      it('should tell if not the same', function () {
        var el1 = $.one('a', fix.el);
        var el2 = $.one('ul a', fix.el);
        expect(el1.is(el2)).to.equal(false);
      });
    });

    describe('closest', function () {
      it('should find the correct element', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('i').closest('#parent').is($.one('#parent'))).to.be.true; // jshint ignore:line
      });
      it('should find itself', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id1 span').closest('#inner')._node).to.equal($.one('#id1 span')._node);
      });
      it('should return null if nuthing was found', function () {
        expect($.one('i').closest('b')).to.equal(null);
      });
      it('should walk up to the document', function () {
        expect($.one('i').closest(document)._node).to.equal(document);
      });
    });

    describe('parent', function () {
      it('should always find a parent when in dom', function () {
        expect($.one('div').parent()).to.be.an.instanceOf($.Element);
      });
      it('should find the same as the document', function () {
        expect($.one('div').parent()._node).to.equal($.one('div')._node.parentNode);
      });
      it('should find none if on document', function () {
        expect($.one(document).parent()._node).to.equal(null);
      });
    });

    describe('next \'n\' prev', function () {
      it('should find the next sibling', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id1').next().matches('#id2')).to.be.true; // jshint ignore:line
      });
      it('should find the next sibling (string)', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id1').next('#id3').matches('span')).to.be.true; // jshint ignore:line
      });
      it('should find the next sibling (function)', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id1').next(function (el) {
          return el.matches('#id4');
        }).matches('ul')).to.be.true; // jshint ignore:line
      });
      it('should not find any next if last child', function () {
        expect($.one('#id4').next()).to.equal(null);
      });
      it('should not find any next if only child', function () {
        expect($.one('i').next()).to.equal(null);
      });
      it('should find the previous sibling', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id4').prev().matches('#id3')).to.be.true; // jshint ignore:line
      });
      it('should find the previous sibling (string)', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id4').prev('form').matches('#id2')).to.be.true; // jshint ignore:line
      });
      it('should find the previous sibling (function)', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id4').prev(function (el) {
          return el.matches('#id1');
        }).matches('a')).to.be.true; // jshint ignore:line
      });
      it('should not find any prev if first child', function () {
        expect($.one('#id1').prev()).to.equal(null);
      });
      it('should not find any prev if only child', function () {
        expect($.one('i').prev()).to.equal(null);
      });
    });

    describe('classes', function () {
      describe('hasClass', function () {
        it('should say yay if class is around', function () {
          //noinspection BadExpressionStatementJS
          expect($.one('#id1').hasClass('myclass')).to.be.true; // jshint ignore:line
        });
        it('should say ney if class is not around', function () {
          //noinspection BadExpressionStatementJS
          expect($.one('#id1').hasClass('myotherclass')).to.be.false; // jshint ignore:line
        });
        it('should say ney if class attribute is not set', function () {
          //noinspection BadExpressionStatementJS
          expect($.one('#id2').hasClass('myclass')).to.be.false; // jshint ignore:line
        });
      });
      it('addClass', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id2').hasClass('myclass')).to.be.false; // jshint ignore:line
        $.one('#id2').addClass('myclass');
        //noinspection BadExpressionStatementJS
        expect($.one('#id2').hasClass('myclass')).to.be.true; // jshint ignore:line
      });
      it('removeClass', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id2').hasClass('myclass')).to.be.true; // jshint ignore:line
        $.one('#id2').removeClass('myclass');
        //noinspection BadExpressionStatementJS
        expect($.one('#id2').hasClass('myclass')).to.be.false; // jshint ignore:line
      });
      it('toggleClass', function () {
        //noinspection BadExpressionStatementJS
        expect($.one('#id2').hasClass('myclass')).to.be.false; // jshint ignore:line
        $.one('#id2').toggleClass('myclass');
        //noinspection BadExpressionStatementJS
        expect($.one('#id2').hasClass('myclass')).to.be.true; // jshint ignore:line
        $.one('#id2').toggleClass('myclass');
        //noinspection BadExpressionStatementJS
        expect($.one('#id2').hasClass('myclass')).to.be.false; // jshint ignore:line
      });
    });

    describe('data', function () {
      it('should work like the attribute', function () {
        var el = $.one('#id1');
        expect(el.data('key')).to.equal(el._node.getAttribute('data-key'));
      });
      it('should get all data if no argument passed', function () {
        var el = $.one('#id1');
        el.data('foo', 'bar');
        var result = el.data();
        expect(Object.keys(result)).to.have.length(2);
        expect(result).to.have.property('foo').that.equals('bar');
      });
      describe('types', function () {
        it('strings', function () {
          var el = $.one('#id4');
          el.data('foo', 'bar');
          expect(el.data('foo')).to.equal('bar');
        });
        it('numbers', function () {
          var el = $.one('#id4');
          el.data('foo', 3);
          expect(el.data('foo')).to.equal('3');
        });
      });
      it('should set the value via functions', function () {
        var el = $.one('#id4');
        el.data('foo', function (name) {
          return name + 'bar';
        });

        expect(el.data('foo')).to.equal('foobar');
      });

      it('should remove Data', function () {
        var el = $.one('#id1');
        expect(el.rmData('foo').data('foo')).to.equal(null);
      });
    });

    describe('prop', function () {
      it('should test if it has a property', function () {
        var el = $.one('#id2 input');
        //noinspection BadExpressionStatementJS
        expect(el.prop('name')).to.not.be.undefined; // jshint ignore:line
      });
      it('should get a property', function () {
        var el = $.one('#id2 input');
        expect(el.prop('name')).to.equal('foo');
      });
      it('should set a property', function () {
        var el = $.one('#id2 input');
        var ret = el.prop('name', 'baz');
        expect(ret).to.be.an.instanceOf($.Element);
        expect(el.prop('name')).to.equal('baz');
        el.prop('name', 'foo');
      });
      it('should return null if no property was defined', function () {
        var el = $.one('#id2 input');
        var p = el.prop();
        expect(p).to.equal(null);
      });
      it('should fallback to parent if the property is "parentNode"', function () {
        var el = $.one('#id2 input');
        //noinspection BadExpressionStatementJS
        expect(el.prop('parentNode').is(el.parent())).to.be.true; // jshint ignore:line
      });
    });

    describe('attr', function () {
      it('should test if it has the attribute', function () {
        var el = $.one('#id1');
        //noinspection BadExpressionStatementJS
        expect(el.hasAttr('id')).to.be.true; // jshint ignore:line
      });
      it('should test if it a node does not have the attribute', function () {
        var el = $.one('#id1');
        //noinspection BadExpressionStatementJS
        expect(el.hasAttr('kacnksacsa0')).to.be.false; // jshint ignore:line
      });
      it('should set and get attributes', function () {
        var el = $.one('#id1');
        expect(el.attr('id')).to.equal('id1');
        el.attr('rel', 'asdf');
        expect(el.attr('rel')).to.equal('asdf');
      });
      it('should get all attibutes, when no argument is passed', function () {
        var el = $.one('#id1');
        var att = el.attr();
        expect(Object.keys(att)).to.have.length(5);
        expect(att).to.have.property('href').that.equals('#');
      });
      it('should remove Attributes', function () {
        var el = $.one('#id1');
        el.rmAttr('rel');
        //noinspection BadExpressionStatementJS
        expect(el.hasAttr('rel')).to.be.false; // jshint ignore:line
      });
    });

    describe('html \'n\' text', function () {
      it('should get html', function () {
        expect($.one('#inner').html()).to.equal('Hello');
      });
      it('should set html', function () {
        var el = $.one('#inner');
        el.html('<p>Damn</p>');
        expect(el.one('p')).to.not.equal(null);
        expect(el.one('p').html()).to.equal('Damn');
      });

      it('should set html /w scripts - but they get escaped', function () {
        var el = $.one('#inner');
        window.__COUNTER__ = 1;
        el.html('<script type="text/javascript">window.__COUNTER__++;</script>');
        expect(window.__COUNTER__).to.equal(1);
      });
      it('should set text', function () {
        var el = $.one('#inner');
        el.text('foo');
        expect(el.text()).to.equal('foo');
      });
      it('should not set html with text', function () {
        var el = $.one('#inner');
        el.text('<p>lorem ipsum</p>');
        expect(el.html()).to.equal('&lt;p&gt;lorem ipsum&lt;/p&gt;');
      });
      it('should get text', function () {
        var el = $.one('#inner');
        el.html('Hello');
        expect(el.text()).to.equal('Hello');
        expect(el.closest('#id1').text().replace(/^\s*|\s*$/g, '')).to.equal('Hello');
      });
    });

    describe('empty', function () {
      it('should empty an element', function () {
        var el = $.one('#id4');
        el.empty();
        expect(el.html()).to.equal('');
      });
    });

    describe('prepend', function () {
      it('should prepend to empty node', function () {
        var el = $.one('#id4');
        el.prepend('<em id="woohoo">bbq</em>');
        expect(el.html()).to.equal('<em id="woohoo">bbq</em>');

      });
      it('should prepend to non-empty node', function () {
        var newEl = $.create('<i>i</i>');
        var el = $.one('#id4').prepend(newEl);
        expect(el.html()).to.equal('<i>i</i><em id="woohoo">bbq</em>');
      });

      describe('browser fallback', function () {
        it('prepends regular node', function() {
          var el = $.one('#id4');
          var el2 = document.createElement('span');
          el2.textContent = 'so?'
          el.empty();
          el.prepend(el2);
          expect(el.html()).to.equal('<span>so?</span>');
        });
        it('throws exception if no node', function () {
          var el = $.one('#id4');
          el.empty();
          //noinspection BadExpressionStatementJS
          expect(function () {
            el.prepend(3)
          }).to.throw('NOT_FOUND_ERR'); //jshint ignore:line
        });
      });
    });

    describe('prependTo', function () {
      it('should prepend and chain', function () {
        var el = $.one('#id4').html('<p>foo</p>');
        $.create('<span>ja?</span>').prependTo(el).prop('id', 'id4prep');
        expect(el.html()).to.equal('<span id="id4prep">ja?</span><p>foo</p>');
      });
      it('should prepend to a dom element', function () {
        var el = $.one('#id4').empty();
        $.create('<span>ja?</span>').prependTo(document.getElementById('id4')).prop('id', 'id4prep');
        expect(el.html()).to.equal('<span id="id4prep">ja?</span>');
      });
    });

    describe('Tests Node.append.', function () {
      it('should append to empty node', function () {
        var el = $.one('#id4').empty();
        el.append('<em id="woohoo">bbq</em>');
        expect(el.html()).to.equal('<em id="woohoo">bbq</em>');
      });
      it('should append to not empty node', function () {
        var newEl = $.create('<i>i</i>');
        var el = $.one('#id4').append(newEl);
        expect(el.html()).to.equal('<em id="woohoo">bbq</em><i>i</i>');
      });
      describe('browser fallback', function () {
        it('appends regular node', function() {
          var el = $.one('#id4');
          var el2 = document.createElement('span');
          el2.textContent = 'so?'
          el.empty();
          el.append(el2);
          expect(el.html()).to.equal('<span>so?</span>');
        });
        it('throws exception if no node', function () {
          var el = $.one('#id4');
          el.empty();
          //noinspection BadExpressionStatementJS
          expect(function () {
            el.append(3)
          }).to.throw('NOT_FOUND_ERR'); //jshint ignore:line
        });
      });
    });

    describe('appendTo', function () {
      it('should append and chain', function () {
        var el = $.one('#id4').html('<p>foo</p>');
        $.create('<span>ja?</span>').appendTo(el).prop('id', 'id4app');
        expect(el.html()).to.equal('<p>foo</p><span id="id4app">ja?</span>');
      });
      it('should append to a dom element', function () {
        var el = $.one('#id4').empty();
        $.create('<span>ja?</span>').appendTo(document.getElementById('id4')).prop('id', 'id4app');
        expect(el.html()).to.equal('<span id="id4app">ja?</span>');
      });
    });

    describe('after / insertAfter', function () {
      it('should insert an element after the element', function () {
        var el = $.one('#id4').html('<p>foo</p>').one('p');
        var el2 = $.create('<p>bar</p>');
        el.after(el2).attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p title="baz">foo</p><p>bar</p>');
      });
      it('should insert html after the element', function () {
        var el = $.one('#id4').html('<p>foo</p>').one('p');
        el.after('<p>bar</p>').attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p title="baz">foo</p><p>bar</p>');
      });
      it('should insert the element after another element', function () {
        var el = $.one('#id4').html('<p>foo</p>').one('p');
        var el2 = $.create('<p>bar</p>');
        el2.insertAfter(el).attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p>foo</p><p title="baz">bar</p>');
      });
      it('should insert html after the element', function () {
        var el = $.one('#id4').html('<p>foo</p>').one('p');
        $.create('<p>bar</p>').insertAfter(el).attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p>foo</p><p title="baz">bar</p>');
      });

      it('should insert after a selected element', function () {
        $.one('#id4').html('<p>foo</p>');
        var el2 = $.create('<p>bar</p>');
        el2.insertAfter('#id4 p').attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p>foo</p><p title="baz">bar</p>');
      });

      it('should insert after an element which is not last', function () {
        $.one('#id4').html('<p>foo</p><span>yay</span>');
        var el2 = $.create('<p>bar</p>');
        el2.insertAfter('#id4 p').attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p>foo</p><p title="baz">bar</p><span>yay</span>');
      });
    });

    describe('before / insertBefore', function () {
      it('should insert an element before the element', function () {
        var el = $.one('#id4').html('<p>foo</p>').one('p');
        var el2 = $.create('<p>bar</p>');
        el.before(el2).attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p>bar</p><p title="baz">foo</p>');
      });
      it('should insert html after the element', function () {
        var el = $.one('#id4').html('<p>foo</p>').one('p');
        el.before('<p>bar</p>').attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p>bar</p><p title="baz">foo</p>');
      });
      it('should insert the element after another element', function () {
        var el = $.one('#id4').html('<p>foo</p>').one('p');
        var el2 = $.create('<p>bar</p>');
        el2.insertBefore(el).attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p title="baz">bar</p><p>foo</p>');
      });
      it('should insert html after the element', function () {
        var el = $.one('#id4').html('<p>foo</p>').one('p');
        $.create('<p>bar</p>').insertBefore(el).attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p title="baz">bar</p><p>foo</p>');
      });

      it('should insert before a selected element', function () {
        $.one('#id4').html('<p>foo</p>');
        var el2 = $.create('<p>bar</p>');
        el2.insertBefore('#id4 p').attr('title', 'baz');
        expect($.one('#id4').html()).to.equal('<p title="baz">bar</p><p>foo</p>');
      });
    });

    describe('getStyle', function () {
      it('should get style', function () {
        var el = $.one('#id3');
        expect(el.getStyle('left')).to.equal('100px');
      });
      it('should not get style where no style is', function () {
        var el = $.one('#id4');
        //noinspection BadExpressionStatementJS
        expect(el.getStyle('top')).to.equal(null);
      });
    });

    describe('setStyle', function () {
      it('should set style with 2 strings as params', function () {
        var el = $.one('#id3');
        el.setStyle('float', 'left');
        expect(el.getStyle('float')).to.equal('left');
      });

      it('should style with a passed in object', function () {
        var el = $.one('#id3');
        el.setStyles({
          left: '200px',
          top: '150px'
        });

        expect(el.getStyle('left')).to.equal('200px');
        expect(el.getStyle('top')).to.equal('150px');
      });

      it('should set style on any element', function () {
        var el = $.one('#id2');
        el.setStyle('background-color', 'red');
        expect(el.getStyle('background-color')).to.equal('red');
      });
    });

    describe('serialize', function () {
      it('should serialize a form', function () {
        var form = $.one('form', fix.el);
        var cerials = form.serialize();
        expect(cerials).to.equal('foo=bar&rad=rad_val2&check1=on');
      });
    });

    describe('remove', function () {
      it('should remove a node', function () {
        var el = $.one('#inner');
        el.remove();
        expect($.one('#inner')).to.equal(null);
        expect(el).to.not.equal(null);
        expect(el._node).to.have.property('tagName');
      });
    });

    describe('remove Style', function () {
      it('should remove a single style', function () {
        var el = $.one('#id3');
        var f = el.getStyle('float');
        expect(f).to.equal('left');

        el.removeStyle('float');

        f = el.getStyle('float');
        expect(f).to.equal(null);
      });
      it('should remove multiple styles', function () {
        var el = $.one('#id3');
        var l = el.getStyle('left');
        expect(l).to.equal('200px');

        el.removeStyles(['left']);

        l = el.getStyle('left');
        expect(l).to.equal(null);
      });
    });

    describe('computeCss', function () {
      it('should compute css of elements inherited', function () {
        var el = $.one('#id3');
        var comp = parseInt(el.computeCss('top'), 10);
        expect(comp).to.equal(150);
      });
      it('should return the default-css of elements', function () {
        var el = $.one('#id3 p');
        var comp = el.computeCss('top');
        expect(comp).to.equal('auto');
      });
      it('should return a property map, if an array is passed', function () {
        var el = $.one('#id3');
        var comp = el.computeCss(['top']);
        expect(comp).to.be.an('object');
        expect(comp).to.have.a.property('top').that.equals('150px');
      });
    });
  });
}());
