$ = window.bebop
describe '::Selector::', ->
  fix = null
  fixtures = null
  json = null

  before ->
    fix = new Fixture 'test/fixtures'
    fixtures = fix.load 'selector.html', 'create_markup.json'
    json = fixtures[1]

  after ->
    fix.cleanup()

  describe '$.one', ->
    it 'should find one div', ->
      expect($.one 'div', fix.el ).to.not.equal null

    it 'should find only one div', ->
      expect($.one 'div', fix.el).to.not.be.an.instanceOf $.ElementList

    it 'should be null, if it does not find anything', ->
      expect($.one 'p', fix.el).to.equal null

    it 'should find the first div', ->
      expect($.one('div', fix.el)._node).to.equal(fix.el.getElementsByTagName('div')[0])

    it 'should find by different selectors', ->
      expect($.one('[lang|="en"]', fix.el)).to.not.equal null
      expect($.one('div > a[href^="#"]', fix.el)).to.not.equal null

    it 'should definitely find itself', ->
      el1 = $.one 'div', fix.el
      el2 = $.one el1
      expect(el2._node).to.deep.equal el1._node

    it 'should be null if it does not find shit', ->
      el1 = $.one 'p', fix.el
      el2 = $.one el1
      expect(el2).to.equal(el1).and.to.equal null

  describe '$.all', ->
    it 'should find a list of divs', ->
      expect($.all 'div').to.be.an.instanceOf $.ElementList

    it 'should find the right amount', ->
      expect($.all('div', fix.el).size()).to.equal 2

    it 'should still be a list, even if only one element', ->
      allA = $.all 'a', fix.el
      expect(allA).to.have.property 'size'
      expect(allA).to.be.an.instanceOf $.ElementList

  describe '$.create', ->
    it 'should create an element', ->
      newDOM = $.create json.ex1
      expect(newDOM).to.be.an.instanceOf $.Element

    it 'should create an element with dom', ->
      newDOM = $.create json.ex1
      # this test actually passes successfully already when accessing innerHTML
      # coz this proves that _node is a documentFragment
      expect(newDOM._node.innerHTML).to.equal 'text'

    it 'should create an element the way the browser does', ->
      code = json.error;
      div = document.createElement 'div'
      div.innerHTML = code;
      expect($.one('p', $.create(code)._node)._node.innerHTML).to.equal($.one('p', div)._node.innerHTML)
