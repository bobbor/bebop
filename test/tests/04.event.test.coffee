$ = window.bebop
fix = null
fixtures = null
html = null
oldready = document.readyState
newReady = null

$.ready (ev) ->
  newReady = ev

describe '::EVENT::', ->
  before ->
    fix = new Fixture 'test/fixtures'
    fixtures = fix.load 'event.html'

  after ->
    fix.cleanup()

  describe '.click', ->
    it 'should click', ->
      eventhandler = sinon.spy()
      elm = $.one('#event a')._node
      elm.addEventListener 'click', eventhandler, false
      $.one('#event a').click()
      elm.removeEventListener 'click', eventhandler
      expect(eventhandler.called).to.be.true

  describe 'on and off', ->
    it 'should allow to listen and to stop listening to an event', ->
      eventhandler = sinon.spy()
      elm = $.one '#event a'
      elm.on 'click', eventhandler
      elm.click()
      elm.off 'click', eventhandler
      elm.click()

      expect(eventhandler.called).to.be.true
      expect(eventhandler.callCount).to.equal 1

    it 'should be possible to unbind', ->
      handler1 = sinon.spy()
      handler2 = sinon.spy()
      elm = $.one '#event a'

      elm.on 'click', handler1
      elm.on 'click', handler2
      elm.click()

      elm.off 'click', handler2
      elm.click()

      elm.off 'click', handler1

      expect(handler1.callCount).to.equal 2
      expect(handler2.callCount).to.equal 1

  describe 'on', ->
    it 'should bind to selector in child', ->
      handler1 = sinon.spy()

      elm = $.one '#event'

      elm.on 'click', handler1, 'a'
      elm.one('a').click()
      expect(handler1.callCount).to.equal 1

    it 'should not trigger, if selector is not in wrapper', ->
      handler1 = sinon.spy()

      elm = $.one '#event'
      elm.on 'click', handler1, 'pre'
      elm.one('a').click()

      expect(handler1.callCount).to.equal 0

    it 'should not trigger, if selector is in wrapper but not in target', ->
      handler = sinon.spy()
      elm = $.one '#event'
      elm.on 'click', handler, 'span'
      elm.one('a').click()

      expect(handler.callCount).to.equal 0

  describe 'off', ->
    it 'should throw all if no callback defined', ->
      elm = $.one '#event a'
      _off = -> elm.off 'click'
      expect(_off).to.throw(Error).and.to.match /no callback defined/

    it 'should throw if callback was never bound', ->
      elm = $.one '#event a'
      a = ->
      b = ->
      elm.on 'click', a
      _off = -> elm.off 'click', b

      expect(_off).to.throw(Error).and.to.match /no such callback/

  describe 'once', ->
    it 'should listen', ->
      eventhandler = sinon.spy()
      elm = $.one '#event a'
      elm.once 'click', eventhandler
      elm.click()

      expect(eventhandler.called).to.be.true
      expect(eventhandler.callCount).to.equal 1

    it 'should listen', ->
      eventhandler = sinon.spy()
      elm = $.one '#event a'
      elm.once 'click', eventhandler
      elm.click()
      elm.click()

      expect(eventhandler.called).to.be.true
      expect(eventhandler.callCount).to.equal 1
  describe 'purge', ->
    it 'should unbind all', ->
      handler1 = sinon.spy()
      handler2 = sinon.spy()

      elm = $.one '#event a'

      elm.on 'click', handler1
      elm.on 'click', handler2

      elm.click()
      elm.purge 'click'
      elm.click()

      expect(handler1.callCount).to.equal 1
      expect(handler2.callCount).to.equal 1

    it 'should deep unbind all', ->
      handler1 = sinon.spy()
      handler2 = sinon.spy()

      elm = $.one '#event'

      elm.on 'click', handler1
      elm.on 'click', handler2, 'a'
      elm.one('a').click()
      elm.purge 'click', undefined, true
      elm.one('a').click()

      expect(handler1.callCount).to.equal 1
      expect(handler2.callCount).to.equal 1
  describe 'fire', ->
    it 'should fire', ->
      eventhandler = sinon.spy()
      elm = $.one '#event a'
      elm.once 'mouseover', eventhandler
      elm.fire 'mouseover'

      expect(eventhandler.called).to.be.true

    it 'should fire with data', ->
      eventhandler = sinon.spy()
      elm = $.one '#event a'
      elm.once 'mouseover', eventhandler
      elm.fire 'mouseover', 'data'

      expect(eventhandler.called).to.be.true
      expect(eventhandler.args[0][1]).to.not.be.undefined
      expect(eventhandler.args[0][1]).to.equal 'data'

    it 'should fire custom events', ->
      eventhandler = sinon.spy()
      elm = $.one '#event a'
      elm.once 'xyz', eventhandler
      elm.fire 'xyz', 'data'

      expect(eventhandler.called).to.be.true
      expect(eventhandler.args[0][1]).to.not.be.undefined
      expect(eventhandler.args[0][1]).to.equal 'data'

  describe 'ready', ->
    it 'should be called when (already) ready', (done) ->
      expect(oldready).to.not.equal 'complete'
      $.ready ->
        expect(document.readyState).to.match /\bcomplete|interactive\b/
        expect(newReady).to.equal 'DOMContentLoaded'
        done()
