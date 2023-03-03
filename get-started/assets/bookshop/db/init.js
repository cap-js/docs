const cds = require ('@sap/cds')
module.exports = cds.run (()=>{"serialized"

  let { Books, Authors } = cds.entities('sap.capire.bookshop')

  INSERT.into (Books) .columns (
    'ID', 'title', 'author_id', 'stock'
  ) .rows (
    [ 201, 'Wuthering Heights', 101, 12 ],
    [ 207, 'Jane Eyre', 107, 11 ],
    [ 251, 'The Raven', 150, 333 ],
    [ 252, 'Eleonora', 150, 555 ],
    [ 271, 'Catweazle', 170, 222 ]
  )

  INSERT.into (Authors) .entries (
    { ID:101, name:'Emily Brontë' },
    { ID:107, name:'Charlote Brontë' },
    { ID:150, name:'Edgar Allen Poe' },
    { ID:170, name:'Richard Carpenter' }
  )

  // two test reads
  SELECT.from (Books) .then (console.log)
  SELECT.from (Books, ['title']) .where ({
    author_id: SELECT('id').from(Authors) .where ({name: {like:'%Brontë%'}})
  }) .then (all => console.log (
    `\nby Brontës: \n\n  ${all.map(b=>b.title).join('\n  ')}
  `))

})