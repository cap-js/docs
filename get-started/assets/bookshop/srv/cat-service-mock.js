/**
 * Mock data provider for CatalogService in ./cat-service.cds
 */
module.exports = (srv)=>{

  srv.on ('READ','Books', ()=>[
    { ID:201, title:'Wuthering Heights', author_ID:101, stock:12 },
    { ID:251, title:'The Raven', author_ID:150, stock:333 },
    { ID:252, title:'Eleonora', author_ID:150, stock:555 },
    { ID:271, title:'Catweazle', author_ID:170, stock:222 },
  ])

  srv.on ('READ','Authors', ()=>[
    { ID:101, name:'Emily Brontë' },
    { ID:150, name:'Edgar Allen Poe' },
    { ID:170, name:'Richard Carpenter' },
  ])

  srv.reject ('READ','Orders')
  srv.on ('CREATE','Orders', (req)=>{
    console.debug ('> incoming order:', req.data)
    req.reject (501)
  })

}
