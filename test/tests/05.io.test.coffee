$ = window.bebop
fix = null
fixtures = null
html = null

describe 'IO', ->
  before ->
    fix = new Fixture 'test/fixtures'
    fixtures = fix.load 'node.html'

  after ->
    fix.cleanup()

  describe 'types', ->

    it 'should do a get request', (done) ->
      $.io.get({
        bust: true
        url: '/io/one.txt'
        type: 'text'
      }).then((xhr) ->
        expect(xhr.res.status).to.not.equal 404
        done()
      ).catch((err) -> done err )

    it 'should do a head request', (done) ->
      $.io.head({
        bust: true
        url: '/io/one.txt'
        type: 'text'
      }).then((xhr) ->
        expect(xhr.res.status).to.not.equal 404
        done()
      ).catch((err) -> done err )

    it 'should do a post request', (done) ->
      $.io.post({
        bust: true
        url: '/io/one.txt'
        type: 'text'
      }).then((xhr) ->
        expect(xhr.res.status).to.not.equal 404
        done()
      ).catch((err) -> done err )

    it 'should do a put request', (done) ->
      $.io.put({
        bust: true
        url: '/io/one.txt'
        type: 'text'
      }).then((xhr) ->
        expect(xhr.res.status).to.not.equal 404
        done()
      ).catch((err) -> done err )

    it 'should do a del request', (done) ->
      $.io.del({
        bust: true
        url: '/io/one.txt'
        type: 'text'
      }).then((xhr) ->
        expect(xhr.res.status).to.not.equal 404
        done()
      ).catch((err) -> done err )
  describe 'content', ->
    it 'should request text', (done) -> # this one hits the cache
      $.io.get({
        url: '/io/one.txt'
      }).then((xhr) ->
        expect(xhr.res.data).to.equal 'foo bar'
        done()
      ).catch((err) -> done err )

    it 'should request json', (done) ->
      $.io.get({
        url: '/io/two.json'
        type: 'json'
      }).then((xhr) ->
        expect(xhr.res.data).to.be.an('object').and.to.have.property 'foo'
        done()
      ).catch((err) -> done err)

    it 'should return unparsable json as text', (done) ->
      $.io.get({
        url: '/io/fail.json',
        type: 'json'
      }).then((xhr)->
        # the responseText is the blank text (even if parsed)
        expect(xhr.res.data).to.be.equal xhr.req.responseText
        done()
      ).catch((err) -> done err)

    it 'should request html', (done) ->
      $.io.get({
        url: '/io/three.html'
        type: 'html'
      }).then((xhr) ->
        expect(xhr.res.data.matches 'span.foo').to.be.true
        done()
      ).catch((err) -> done err)

    it 'should return broken html as text', (done) ->
      $.io.get({
        url: '/io/fail.html'
        type: 'html'
      }).then((xhr) ->
        expect(xhr.res.data._node).to.be.undefined
        done()
      ).catch((err) -> done err)

    it 'should request xml', (done) ->
      $.io.get({
        url: '/io/four.xml'
        type: 'xml'
      }).then((xhr) ->
        expect(xhr.res.data).to.be.ok
        done()
      ).catch((err) -> done err)

  describe 'data', ->
    it 'should get with data', (done) ->
      $.io.get({
        url: '/io/one.txt'
        bust: true
        data: {foo:'bar'}
      }).then((xhr) ->
        expect(xhr.res.url).to.match /one\.txt\?foo=bar$/
        done()
      ).catch((err) -> done err)

    it 'should post with form', (done) ->
      form = $.one 'form', fix.el
      $.io.post({
        url: '/io/one.txt'
        bust: true
        data: new FormData form._node
      }).then((xhr) ->
        expect(xhr.res.url).to.match /one\.txt$/
        done()
      ).catch (err) -> done err

    describe 'header', ->
      it 'should set custom header', (done) ->
        $.io.get({
          url: '/io/one.txt'
          bust: true
          head: {
            'X-Sent-By': 'Karma'
          }
        }).then(() ->
          done()
        ).catch (err) -> done err
