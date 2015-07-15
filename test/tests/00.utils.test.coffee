$ = window.bebop
describe '::Utils::', ->
  fix = null
  fixtures = null

  before ->
    fix = new Fixture 'test/fixtures'
    fixtures = fix.load 'node.html'
  after ->
    fix.cleanup()

  describe 'uuids', ->
    it 'should create uuids', ->
      id = $.uuid()
      expect(id).to.not.be.undefined

    it 'should create unique ids', ->
      id1 = $.uuid();
      id2 = $.uuid();
      id3 = $.uuid();

      expect(id1).to.not.equal(id2).and.to.not.equal(id3)

    it 'should create uuids on node', ->
      el = $.one '#id2 button'

      expect(el.prop 'id' ).to.equal ''
      expect(el.hasAttr 'id' ).to.be.false

      id = el.uuid();
      expect(el.prop 'id' ).to.equal id
      expect(el.hasAttr 'id' ).to.be.true

    it 'should return the existing uuid', ->
      el = $.one '#id2'
      expect(el.uuid()).to.equal 'id2'

  describe 'noConflict', ->
    bebopStore = null

    before ->
      bebopStore = window.bebop

    after ->
      window.$ = window.bebop = bebopStore

    it 'should noConflict', ->
      own = window.bebop.noConflict()
      expect(own.VERSION).to.equal '1.0.5'
      expect(bebop.VERSION).to.equal '1.0.5'
      expect(window.$).to.be.undefined

    it 'should deep noConflict', ->
      own = window.bebop.noConflict true
      expect(own.VERSION).to.equal '1.0.5'
      expect(window.bebop).to.be.undefined
      expect(window.$).to.be.undefined
