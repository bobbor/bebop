(function() {
  var $ = window.DOM;
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

      it('should creae uuids on node', function() {
        var el = $.one('#id2 button');
        expect(el.prop('id')).to.equal('');
        //noinspection BadExpressionStatementJS
        expect(el.hasAttr('id')).to.be.false;
        var id = el.uuid();
        expect(el.prop('id')).to.equal(id);
        //noinspection BadExpressionStatementJS
        expect(el.hasAttr('id')).to.be.true;
      });
    })
  });
}());