$ = window.bebop
fix = null
fixtures = null
html = null
describe '::Element::', ->
  before ->
    fix = new Fixture 'test/fixtures'
    fixtures = fix.load 'node.html'

  after ->
    fix.cleanup()


  describe 'selector proxies', ->
    it 'should select the same one', ->
      ctx = $.one '#id2'
      expect($.one('button', ctx)._node).to.equal ctx.one('button')._node

    it 'should select the same all', ->
      ctx = $.one '#id2'
      all1 = $.all 'input', ctx
      all2 = ctx.all 'input'
      expect(all1.size()).to.equal all2.size()
      all1.forEach((el, idx) ->
        expect(el._node).to.equal all2.item(idx)._node
      )

  describe 'region', ->
    it 'should calculate the region', ->
      el = $.one '#id3', fix.el
      region = el.region()
      expect(region.top).to.equal 100
      expect(region.left).to.equal 100
      expect(region.width).to.equal 50
      expect(region.height).to.equal 50
      expect(region).to.have.property 'left'
      expect(region).to.have.property 'bottom'

    it 'should not find intersections', ->
      el = $.one '#id3', fix.el
      other = $.one '#id3nonintersect', fix.el
      expect(el.intersects other).to.be.false

    it 'should find intersections', ->
      el = $.one '#id3', fix.el
      other = $.one '#id3intersect', fix.el
      expect(el.intersects other).to.be.true

  describe 'ancestors', ->
    it 'should create a ElementList of ancestors', ->
      nested = $.one('ul i', fix.el)
      tree = nested.ancestors()
      expect(tree).to.be.an.instanceOf($.ElementList)

    it 'should include the node itself', ->
      nested = $.one('ul i', fix.el)
      tree = nested.ancestors()

      expect(tree.item(0).is(nested)).to.be.true

    it 'should return an one element list, if on topmost element', ->
      nullEl = $.one(document)
      expect(nullEl.ancestors().size()).to.equal(1)

    it 'should sort the list bottom top', ->
      nested = $.one('ul i', fix.el)
      tree = nested.ancestors()

      expect(tree.item(0).parent().is(tree.item(1))).to.be.true

  describe 'matches', ->
    it 'should say yay if a selector matches', ->
      expect($.one('form').matches('[action]')).to.equal(true)

    it 'should say ney if a selector does not match', ->
      expect($.one('form').matches('[target]')).to.equal(false)

    describe 'nativeProperties', ->
      it 'document.body', ->
        expect($.one('form').matches(document.body)).to.equal(false)
        expect($.one('body').matches(document.body)).to.equal(true)

      it 'document.documentElement', ->
        expect($.one('form').matches(document.documentElement)).to.equal(false)
        expect($.one('html').matches(document.documentElement)).to.equal(true)

      it 'document', ->
        expect($.one('form').matches(document)).to.equal(false)
        expect($.one(document).matches(document)).to.equal(true)

  describe 'is', ->
    it 'should tell if two element instances are the same node', ->
      el1 = $.one('form', fix.el)
      el2 = $.all('form', fix.el).item(0)

      expect(el1.is(el2)).to.equal(true)

    it 'should tell if not the same', ->
      el1 = $.one('a', fix.el)
      el2 = $.one('ul a', fix.el)
      expect(el1.is(el2)).to.equal(false)

  describe 'closest', ->
    it 'should find the correct element', ->
      expect($.one('i').closest('#parent').is($.one('#parent'))).to.be.true

    it 'should find itself', ->
      expect($.one('#id1 span').closest('#inner')._node).to.equal($.one('#id1 span')._node)

    it 'should return null if nuthing was found', ->
      expect($.one('i').closest('b')).to.equal(null)

    it 'should walk up to the document', ->
      expect($.one('i').closest(document)._node).to.equal(document)


  describe 'parent', ->
    it 'should always find a parent when in dom', ->
      expect($.one('div').parent()).to.be.an.instanceOf($.Element)

    it 'should find the same as the document', ->
      expect($.one('div').parent()._node).to.equal($.one('div')._node.parentNode)

    it 'should find none if on document', ->
      expect($.one(document).parent()._node).to.equal(null)


  describe 'next \'n\' prev', ->
    it 'should find the next sibling', ->
      expect($.one('#id1').next().matches('#id2')).to.be.true

    it 'should find the next sibling (string)', ->
      expect($.one('#id1').next('#id3').matches('span')).to.be.true

    it 'should find the next sibling (function)', ->
      expect($.one('#id1').next((el) ->
        return el.matches('#id4')
      ).matches('ul')).to.be.true

    it 'should not find any next if last child', ->
      expect($.one('#id4').next()).to.equal(null)

    it 'should not find any next if only child', ->
      expect($.one('i').next()).to.equal(null)

    it 'should find the previous sibling', ->
      expect($.one('#id4').prev().matches('#id3')).to.be.true

    it 'should find the previous sibling (string)', ->
      expect($.one('#id4').prev('form').matches('#id2')).to.be.true

    it 'should find the previous sibling (function)', ->
      expect($.one('#id4').prev((el) ->
        return el.matches('#id1')
      ).matches('a')).to.be.true

    it 'should not find any prev if first child', ->
      expect($.one('#id1').prev()).to.equal(null)

    it 'should not find any prev if only child', ->
      expect($.one('i').prev()).to.equal(null)


  describe 'classes', ->
    describe 'hasClass', ->
      it 'should say yay if class is around', ->
        expect($.one('#id1').hasClass('myclass')).to.be.true

      it 'should say ney if class is not around', ->
        expect($.one('#id1').hasClass('myotherclass')).to.be.false

      it 'should say ney if class attribute is not set', ->
        expect($.one('#id2').hasClass('myclass')).to.be.false


    it 'addClass', ->
      expect($.one('#id2').hasClass('myclass')).to.be.false
      $.one('#id2').addClass('myclass')

      expect($.one('#id2').hasClass('myclass')).to.be.true

    it 'removeClass', ->
      expect($.one('#id2').hasClass('myclass')).to.be.true
      $.one('#id2').removeClass('myclass')

      expect($.one('#id2').hasClass('myclass')).to.be.false

    it 'toggleClass', ->
      expect($.one('#id2').hasClass('myclass')).to.be.false
      $.one('#id2').toggleClass('myclass')

      expect($.one('#id2').hasClass('myclass')).to.be.true
      $.one('#id2').toggleClass('myclass')

      expect($.one('#id2').hasClass('myclass')).to.be.false


  describe 'data', ->
    it 'should work like the attribute', ->
      el = $.one('#id1')
      expect(el.data('key')).to.equal(el._node.getAttribute('data-key'))

    it 'should get all data if no argument passed', ->
      el = $.one('#id1')
      el.data('foo', 'bar')
      result = el.data()
      expect(Object.keys(result)).to.have.length(2)
      expect(result).to.have.property('foo').that.equals('bar')

    describe 'types', ->
      it 'strings', ->
        el = $.one('#id4')
        el.data('foo', 'bar')
        expect(el.data('foo')).to.equal('bar')

      it 'numbers', ->
        el = $.one('#id4')
        el.data('foo', 3)
        expect(el.data('foo')).to.equal('3')


    it 'should set the value via functions', ->
      el = $.one('#id4')
      el.data('foo', (name) ->
        return name + 'bar'
      )
      expect(el.data('foo')).to.equal('foobar')

    it 'should remove Data', ->
      el = $.one('#id1')
      expect(el.rmData('foo').data('foo')).to.equal(null)


  describe 'prop', ->
    it 'should test if it has a property', ->
      el = $.one('#id2 input')

      expect(el.prop('name')).to.not.be.undefined

    it 'should get a property', ->
      el = $.one('#id2 input')
      expect(el.prop('name')).to.equal('foo')

    it 'should set a property', ->
      el = $.one('#id2 input')
      ret = el.prop('name', 'baz')
      expect(ret).to.be.an.instanceOf($.Element)
      expect(el.prop('name')).to.equal('baz')
      el.prop('name', 'foo')

    it 'should return null if no property was defined', ->
      el = $.one('#id2 input')
      p = el.prop()
      expect(p).to.equal(null)


  describe 'attr', ->
    it 'should test if it has the attribute', ->
      el = $.one('#id1')

      expect(el.hasAttr('id')).to.be.true

    it 'should test if it a node does not have the attribute', ->
      el = $.one('#id1')

      expect(el.hasAttr('kacnksacsa0')).to.be.false

    it 'should set and get attributes', ->
      el = $.one('#id1')
      expect(el.attr('id')).to.equal('id1')
      el.attr('rel', 'asdf')
      expect(el.attr('rel')).to.equal('asdf')

    it 'should get all attibutes, when no argument is passed', ->
      el = $.one('#id1')
      att = el.attr()
      expect(Object.keys(att)).to.have.length(5)
      expect(att).to.have.property('href').that.equals('#')

    it 'should remove Attributes', ->
      el = $.one('#id1')
      el.rmAttr('rel')

      expect(el.hasAttr('rel')).to.be.false


  describe 'html \'n\' text', ->
    it 'should get html', ->
      expect($.one('#inner').html()).to.equal('Hello')

    it 'should set html', ->
      el = $.one('#inner')
      el.html('<p>Damn</p>')
      expect(el.one('p')).to.not.equal(null)
      expect(el.one('p').html()).to.equal('Damn')


    it 'should set html /w scripts - but they get escaped', ->
      el = $.one('#inner')
      window.__COUNTER__ = 1
      el.html('<script type="text/javascript">window.__COUNTER__++;</script>')
      expect(window.__COUNTER__).to.equal(1)

    it 'should set text', ->
      el = $.one('#inner')
      el.text('foo')
      expect(el.text()).to.equal('foo')

    it 'should not set html with text', ->
      el = $.one('#inner')
      el.text('<p>lorem ipsum</p>')
      expect(el.html()).to.equal('&lt;p&gt;lorem ipsum&lt;/p&gt;')

    it 'should get text', ->
      el = $.one('#inner')
      el.html('Hello')
      expect(el.text()).to.equal('Hello')
      expect(el.closest('#id1').text().replace(/^\s*|\s*$/g, '')).to.equal('Hello')


  describe 'empty', ->
    it 'should empty an element', ->
      el = $.one('#id4')
      el.empty()
      expect(el.html()).to.equal('')


  describe 'prepend', ->
    it 'should prepend to empty node', ->
      el = $.one('#id4')
      el.prepend('<em id="woohoo">bbq</em>')
      expect(el.html()).to.equal('<em id="woohoo">bbq</em>')


    it 'should prepend to non-empty node', ->
      newEl = $.create('<i>i</i>')
      el = $.one('#id4').prepend(newEl)
      expect(el.html()).to.equal('<i>i</i><em id="woohoo">bbq</em>')


    describe 'browser fallback', ->
      it 'prepends regular node', ->
        el = $.one('#id4')
        el2 = document.createElement('span')
        el2.textContent = 'so?'
        el.empty()
        el.prepend(el2)
        expect(el.html()).to.equal('<span>so?</span>')

      it 'throws exception if no node', ->
        el = $.one('#id4')
        el.empty()

        expect(-> el.prepend(3)).to.throw('NOT_FOUND_ERR')


  describe 'prependTo', ->
    it 'should prepend and chain', ->
      el = $.one('#id4').html('<p>foo</p>')
      $.create('<span>ja?</span>').prependTo(el).prop('id', 'id4prep')
      expect(el.html()).to.equal('<span id="id4prep">ja?</span><p>foo</p>')

    it 'should prepend to a dom element', ->
      el = $.one('#id4').empty()
      $.create('<span>ja?</span>').prependTo(document.getElementById('id4')).prop('id', 'id4prep')
      expect(el.html()).to.equal('<span id="id4prep">ja?</span>')


  describe 'Tests Node.append.', ->
    it 'should append to empty node', ->
      el = $.one('#id4').empty()
      el.append('<em id="woohoo">bbq</em>')
      expect(el.html()).to.equal('<em id="woohoo">bbq</em>')

    it 'should append to not empty node', ->
      newEl = $.create('<i>i</i>')
      el = $.one('#id4').append(newEl)
      expect(el.html()).to.equal('<em id="woohoo">bbq</em><i>i</i>')

    describe 'browser fallback', ->
      it 'appends regular node', ->
        el = $.one('#id4')
        el2 = document.createElement('span')
        el2.textContent = 'so?'
        el.empty()
        el.append(el2)
        expect(el.html()).to.equal('<span>so?</span>')

      it 'throws exception if no node', ->
        el = $.one('#id4')
        el.empty()

        expect(-> el.append(3)).to.throw('NOT_FOUND_ERR')


  describe 'appendTo', ->
    it 'should append and chain', ->
      el = $.one('#id4').html('<p>foo</p>')
      $.create('<span>ja?</span>').appendTo(el).prop('id', 'id4app')
      expect(el.html()).to.equal('<p>foo</p><span id="id4app">ja?</span>')

    it 'should append to a dom element', ->
      el = $.one('#id4').empty()
      $.create('<span>ja?</span>').appendTo(document.getElementById('id4')).prop('id', 'id4app')
      expect(el.html()).to.equal('<span id="id4app">ja?</span>')


  describe 'after / insertAfter', ->
    it 'should insert an element after the element', ->
      el = $.one('#id4').html('<p>foo</p>').one('p')
      el2 = $.create('<p>bar</p>')
      el.after(el2).attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p title="baz">foo</p><p>bar</p>')

    it 'should insert html after the element', ->
      el = $.one('#id4').html('<p>foo</p>').one('p')
      el.after('<p>bar</p>').attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p title="baz">foo</p><p>bar</p>')

    it 'should insert the element after another element', ->
      el = $.one('#id4').html('<p>foo</p>').one('p')
      el2 = $.create('<p>bar</p>')
      el2.insertAfter(el).attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p>foo</p><p title="baz">bar</p>')

    it 'should insert html after the element', ->
      el = $.one('#id4').html('<p>foo</p>').one('p')
      $.create('<p>bar</p>').insertAfter(el).attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p>foo</p><p title="baz">bar</p>')


    it 'should insert after a selected element', ->
      $.one('#id4').html('<p>foo</p>')
      el2 = $.create('<p>bar</p>')
      el2.insertAfter('#id4 p').attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p>foo</p><p title="baz">bar</p>')


    it 'should insert after an element which is not last', ->
      $.one('#id4').html('<p>foo</p><span>yay</span>')
      el2 = $.create('<p>bar</p>')
      el2.insertAfter('#id4 p').attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p>foo</p><p title="baz">bar</p><span>yay</span>')


  describe 'before / insertBefore', ->
    it 'should insert an element before the element', ->
      el = $.one('#id4').html('<p>foo</p>').one('p')
      el2 = $.create('<p>bar</p>')
      el.before(el2).attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p>bar</p><p title="baz">foo</p>')

    it 'should insert html after the element', ->
      el = $.one('#id4').html('<p>foo</p>').one('p')
      el.before('<p>bar</p>').attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p>bar</p><p title="baz">foo</p>')

    it 'should insert the element after another element', ->
      el = $.one('#id4').html('<p>foo</p>').one('p')
      el2 = $.create('<p>bar</p>')
      el2.insertBefore(el).attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p title="baz">bar</p><p>foo</p>')

    it 'should insert html after the element', ->
      el = $.one('#id4').html('<p>foo</p>').one('p')
      $.create('<p>bar</p>').insertBefore(el).attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p title="baz">bar</p><p>foo</p>')

    it 'should insert before a selected element', ->
      $.one('#id4').html('<p>foo</p>')
      el2 = $.create('<p>bar</p>')
      el2.insertBefore('#id4 p').attr('title', 'baz')
      expect($.one('#id4').html()).to.equal('<p title="baz">bar</p><p>foo</p>')

  describe 'getStyle', ->
    it 'should get style', ->
      el = $.one('#id3')
      expect(el.getStyle('left')).to.equal('100px')
    it 'should not get style where no style is', ->
      el = $.one('#id4')
      expect(el.getStyle('top')).to.equal(null)

  describe 'setStyle', ->
    it 'should set style with 2 strings as params', ->
      el = $.one('#id3')
      el.setStyle('float', 'left')
      expect(el.getStyle('float')).to.equal('left')

    it 'should style with a passed in object', ->
      el = $.one('#id3')
      el.setStyles({
        left: '200px',
        top: '150px'
      })

      expect(el.getStyle('left')).to.equal('200px')
      expect(el.getStyle('top')).to.equal('150px')

    it 'should set style on any element', ->
      el = $.one('#id2')
      el.setStyle('background-color', 'red')
      expect(el.getStyle('background-color')).to.equal('red')


  describe 'serialize', ->
    it 'should serialize a form', ->
      form = $.one('form', fix.el)
      cerials = form.serialize()
      expect(cerials).to.equal('foo=bar&rad=rad_val2&check1=on')

  describe 'remove', ->
    it 'should remove a node', ->
      el = $.one('#inner')
      el.remove()
      expect($.one('#inner')).to.equal(null)
      expect(el).to.not.equal(null)
      expect(el._node).to.have.property('tagName')

  describe 'remove Style', ->
    it 'should remove a single style', ->
      el = $.one('#id3')
      f = el.getStyle('float')
      expect(f).to.equal('left')

      el.removeStyle('float')

      f = el.getStyle('float')
      expect(f).to.equal(null)
    it 'should remove multiple styles', ->
      el = $.one('#id3')
      l = el.getStyle('left')
      expect(l).to.equal('200px')

      el.removeStyles(['left'])

      l = el.getStyle('left')
      expect(l).to.equal(null)

  describe 'computeCss', ->
    it 'should compute css of elements inherited', ->
      el = $.one('#id3')
      comp = parseInt(el.computeCss('top'), 10)
      expect(comp).to.equal(150)
    it 'should return the default-css of elements', ->
      el = $.one('#id3 p')
      comp = el.computeCss('top')
      expect(comp).to.equal('auto')
    it 'should return a property map, if an array is passed', ->
      el = $.one('#id3')
      comp = el.computeCss(['top'])
      expect(comp).to.be.an('object')
      expect(comp).to.have.a.property('top').that.equals('150px')
