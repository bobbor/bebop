$ = window.bebop
fix = null
describe '::ElementList::', ->
  before ->
    fix = new Fixture('test/fixtures')
    fixtures = fix.load('list.html')

  after ->
    fix.cleanup()

  describe '::core::', ->
    it 'should be around :D', ->
      expect($.ElementList).to.be.a('function')

    it 'should be the result of all', ->
      collection = $.all('section')
      expect(collection).to.be.an('object')
      expect(collection).to.be.an.instanceof($.ElementList)

    it 'should be the result of all proxied', ->
      wrapper = $.one('#section_two', fix.el)
      collection = wrapper.all('a')
      expect(collection).to.be.an('object')
      expect(collection).to.be.an.instanceof($.ElementList)

    it 'should be a collection even if only one element', ->
      wrapper = $.one('#section_two', fix.el)
      collection = wrapper.all('span')
      expect(collection).to.be.an('object')
      expect(collection).to.be.an.instanceof($.ElementList)


  describe '::collection of nodes::', ->
    it 'should provide several core apis', ->
      collection = $.all('section')
      methods = ['remove', 'addClass', 'removeClass', 'toggleClass', 'prop', 'attr', 'setStyle',
                 'setStyles', 'removeStyle', 'removeStyles']
      expect(collection[method]).to.be.a('function') for method in methods

    it 'should not provide useless stuff', ->
      collection = $.all('section')
      expect(collection.prependTo).to.not.be.a('function')

    it 'should behave as used on single node', ->
      collection = $.all('section')
      collection.attr('data-foo', 'bar')
      collectionAlt = $.all('[data-foo="bar"]')
      expect(collection.nodes).to.deep.equal(collectionAlt.nodes)


  describe '::specialties::', ->
    it 'should provide several specific functions', ->
      collection = $.all('section')
      methods = ['forEach', 'map', 'reduce', 'item', 'size', 'get']
      expect(collection[method]).to.be.a('function') for method in methods

    describe 'size', ->
      it 'should count multiple items', ->
        collection = $.all('section')
        expect(collection.size()).to.equal(2)

      it 'should count single items', ->
        wrapper = $.one('#section_two', fix.el)
        collection = wrapper.all('span')
        expect(collection.size()).to.equal(1)

      it 'should (not) count non-existing items', ->
        wrapper = $.one('#section_two', fix.el)
        collection = wrapper.all('p')
        expect(collection.size()).to.equal(0)


    describe 'item', ->
      it 'should get an item at an index', ->
        collection = $.all('section')
        item = collection.item(0)
        expect(item).to.be.an.instanceOf($.Element)

      it 'should get the correct item at an index', ->
        collection = $.all('section')
        item = collection.item(0)
        expect(item).to.be.equal(collection.nodes[0])

      it 'should return null if no index provided', ->
        collection = $.all('section')
        item = collection.item()
        expect(item).to.be.null

      it 'should return undefined if index out of bounds', ->
        collection = $.all('section')
        item = collection.item(2)
        expect(item).to.be.undefined
        item = collection.item(-1)
        expect(item).to.be.undefined


    describe 'get', ->
      it 'should return the dom-node at an index', ->
        collection = $.all('section')
        item = collection.get(0)
        expect(item).to.be.an.instanceOf(window.HTMLElement)
        expect(item.nodeType).to.equal(1)

      it 'should return all nodes if no index specified', ->
        collection = $.all('section')
        items = collection.get()
        expect(items).to.be.an('array')
        expect(items.length).to.equal(2)

      it 'should return undefined if index out of bounds', ->
        collection = $.all('section')
        item = collection.get(2)
        expect(item).to.be.undefined
        item = collection.get(-1)
        expect(item).to.be.undefined

      it 'should not be the same as item', ->
        collection = $.all('section')
        domItem = collection.get(1)
        nodeItem = collection.item(1)
        expect(domItem).to.not.equal(nodeItem)
        expect(nodeItem._node).to.equal(domItem)


    it 'should do stuff for Each entry', ->
      collection = $.all('section')
      collection.forEach((node, idx) ->
        expect(node).to.equal collection.item idx
      )


    it 'should map', ->
      collection = $.all('section')
      mapped = collection.map((node, idx) ->
        return {
        idx: idx
        node: node
        }
      )

      expect(mapped).to.be.an('array')
      expect(mapped[0]).to.have.property('node')
      expect(mapped[0].node).to.equal(collection.item(0))

    it 'should reduce', ->
      collection = $.all('section')
      reduced = collection.reduce((current, node) ->
        return current + node.prop('id')
      , '')
      expect(reduced).to.equal('section_onesection_two')


