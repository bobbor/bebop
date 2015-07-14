(function () {
  'use strict';
  var $ = window.bebop, fix, fixtures, html;
  describe('IO', function () {
    before(function () {
      fix = new Fixture('test/fixtures');
      fixtures = fix.load('node.html');
    });
    after(function () {
      fix.cleanup();
    });

    describe('types', function () {
      it('should do a get request', function (done) {
        $.io.get({
          bust: true,
          url: '/io/one.txt',
          type: 'text'
        }).then(function (xhr) {
          expect(xhr.res.status).to.not.equal(404);
          done()
        }).catch(function (err) {
          done(err);
        });
      });
      it('should do a head request', function (done) {
        $.io.head({
          bust: true,
          url: '/io/one.txt'
        }).then(function (xhr) {
          expect(xhr.res.status).to.not.equal(404);
          done()
        }).catch(function (err) {
          done(err);
        });
      });
      it('should do a post request', function (done) {
        $.io.post({
          bust: true,
          url: '/io/one.txt'
        }).then(function (xhr) {
          expect(xhr.res.status).to.not.equal(404);
          done()
        }).catch(function (err) {
          done(err);
        });
      });
      it('should do a put request', function (done) {
        $.io.put({
          bust: true,
          url: '/io/one.txt'
        }).then(function (xhr) {
          expect(xhr.res.status).to.not.equal(404);
          done()
        }).catch(function (err) {
          done(err);
        });
      });
      it('should do a del request', function (done) {
        $.io.del({
          bust: true,
          url: '/io/one.txt'
        }).then(function (xhr) {
          expect(xhr.res.status).to.not.equal(404);
          done()
        }).catch(function (err) {
          done(err);
        });
      });
    });
    describe('content', function () {
      it('should request text', function (done) {
        $.io.get({
          url: '/io/one.txt'
        }).then(function (xhr) {
          expect(xhr.res.data).to.equal('foo bar');
          done()
        }).catch(function (err) {
          done(err);
        });
      });
      it('should request json', function (done) {
        $.io.get({
          url: '/io/two.json',
          type: 'json'
        }).then(function (xhr) {
          expect(xhr.res.data).to.be.an('object').and.to.have.property('foo');
          done()
        }).catch(function (err) {
          done(err);
        });
      });

      it('should return broken json as text', function (done) {
        $.io.get({
          url: '/io/fail.json',
          type: 'json'
        }).then(function (xhr) {
          expect(xhr.res.data).to.equal(xhr.req.responseText);
          done()
        }).catch(function (err) {
          done(err);
        });
      });

      it('should request html', function (done) {
        $.io.get({
          url: '/io/three.html',
          type: 'html'
        }).then(function (xhr) {
          expect(xhr.res.data.matches('span.foo')).to.be.true; //jshint ignore:line
          done()
        }).catch(function (err) {
          done(err);
        });
      });

      it('should return broken html as text', function (done) {
        $.io.get({
          url: '/io/fail.html',
          type: 'html'
        }).then(function (xhr) {
          expect(xhr.res.data._node).to.be.undefined;
          done()
        }).catch(function (err) {
          done(err);
        });
      });

      it('should request xml', function (done) {
        $.io.get({
          url: '/io/four.xml',
          type: 'xml'
        }).then(function (xhr) {
          expect(xhr.res.data).to.be.ok; //jshint ignore:line
          done()
        }).catch(function (err) {
          done(err);
        });
      });
    });
    describe('data', function () {
      it('should get with data', function (done) {
        $.io.get({
          url: '/io/one.txt',
          bust: true,
          data: {foo: 'bar'}
        }).then(function (xhr) {
          expect(xhr.res.url).to.match(/one\.txt\?foo=bar$/);
          done()
        }).catch(function (err) {
          done(err);
        });
      });

      it('should post with form', function(done) {
        var form = $.one('form', fix.el);

        $.io.post({
          url: '/io/one.txt',
          bust: true,
          data: new FormData(form._node)
        }).then(function (xhr) {
          expect(xhr.res.url).to.match(/one\.txt$/);
          done()
        }).catch(function (err) {
          done(err);
        });
      });
    });

    describe('header', function () {
      it('should set custom header', function () {
        $.io.get({
          url: '/io/one.txt',
          bust: true,
          head: {
            'X-Sent-By': 'Karma'
          }
        });
      });
    });
  });
}());
