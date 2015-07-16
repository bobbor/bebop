(function() {
  var $ = window.bebop;
  var fix,fixtures,html;
  describe('::Utils::', function() {
    before(function() {
      fix = new Fixture('test/fixtures');
      fixtures = fix.load('node.html');
    });

    after(function() {
      fix.cleanup();
    });

    describe('uuids', function() {
      it('should create uuids', function() {
        var id = $.uuid();
        //noinspection BadExpressionStatementJS
        expect(id).to.not.be.undefined;
      });

      it('should create unique ids', function() {
        var id1 = $.uuid();
        var id2 = $.uuid();
        var id3 = $.uuid();

        expect(id1).to.not.equal(id2).and.to.not.equal(id3);
      });

      it('should create uuids on node', function() {
        var el = $.one('#id2 button');
        expect(el.prop('id')).to.equal('');
        //noinspection BadExpressionStatementJS
        expect(el.hasAttr('id')).to.be.false;
        var id = el.uuid();
        expect(el.prop('id')).to.equal(id);
        //noinspection BadExpressionStatementJS
        expect(el.hasAttr('id')).to.be.true;
      });

      it('should return the existing uuid', function() {
        var el = $.one('#id2');
        expect(el.uuid()).to.equal('id2');
      })
    });

    describe('noConflict', function() {
      var bebopStore;
      before(function() {
        bebopStore = window.bebop;
      });
      after(function() {
        window.$ = window.bebop = bebopStore;
      });

      it('should noConflict', function() {
        var own = $.noConflict();
        expect(own.VERSION).to.equal('1.1.0');
        expect(bebop.VERSION).to.equal('1.1.0');
        expect(window.$).to.be.undefined;
      });
      it('should deep noConflict', function() {
        var own = $.noConflict(true);
        expect(own.VERSION).to.equal('1.1.0');
        expect(window.bebop).to.be.undefined;
        expect(window.$).to.be.undefined;
      });
    });
  });
}());
