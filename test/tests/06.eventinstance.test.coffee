$ = window.bebop;
fix = null
fixtures = null

describe 'EventInstance', ->
  before ->
    fix = new Fixture 'test/fixtures'
    fixtures = fix.load 'eventinstance.html'

  after ->
    fix.cleanup()

  describe 'instance', ->
    it 'should be the first parameter on event callback', (done) ->
      el = $.one '#instance a', fix.el
      el.on 'click', (e) ->
        expect(e).to.be.an 'object'
        expect(e).to.have.property('target').and.to.be.an.instanceOf $.Element
        expect(e).to.have.property('originalTarget').and.to.be.an.instanceOf $.Element
        done()
      el.click()

    it 'should allow the event to not do the default', (done) ->
      el = $.one '#instance a', fix.el
      el.on 'click', (e) ->
        preventDefault = sinon.spy e._e, 'preventDefault'
        e.noDefault()
        expect(preventDefault.callCount).to.equal 1
        e._e.preventDefault.restore()
        done()

      el.click()

    it 'should allow the event to stop bubbling', (done) ->
      el = $.one '#instance a', fix.el
      el.on 'click', (e) ->
        stopPropagation = sinon.spy e._e, 'stopPropagation'
        e.noBubble()
        expect(stopPropagation.callCount).to.equal 1
        e._e.stopPropagation.restore()
        done()
      el.click()
    it 'should allow the event to stop bubbling and do no default', (done) ->
      el = $.one '#instance a', fix.el
      el.on 'click', (e) ->
        preventDefault = sinon.spy e._e, 'preventDefault'
        stopPropagation = sinon.spy e._e, 'stopPropagation'
        e.stop()
        expect(preventDefault.callCount).to.equal 1
        expect(stopPropagation.callCount).to.equal 1
        e._e.preventDefault.restore()
        e._e.stopPropagation.restore()
        done()
      el.click()

    it 'should have key (code) and mouse (pageX,pageY) props', (done) ->
      el = $.one '#instance a', fix.el
      el.on 'click', (e) ->
        expect(e.pageX()).to.equal 0
        expect(e.pageY()).to.equal 0
        code = e.code();
        expect(code).to.equal 0
        done()
      el.click()
