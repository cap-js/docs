const cds = require ('@sap/cds')
const stocks = [0,11,22,33]

module.exports = function Sue(){
  this.on('sum', ({data:{x,y}}) => x+y)
  this.on('add', ({data:{x,to}}) => stocks[to] += x)
  this.on('stock', ({data:{id}}) => stocks[id])
  this.on('getStock','Foo', ({params:[id]}) => stocks[id])
  this.on('order','Foo', ({params:[id],data:{x}}) => stocks[id] -= x)
}

async function programmatic_usage1(){
  const srv = await cds.connect.to(Sue)
  await srv.send('sum',{x:1,y:2})
  await srv.send('add',{x:11,to:2})
  await srv.send('stock',{id:2})
  await srv.send('getStock','Foo',{id:2})
  await srv.send('order','Foo',{id:2,x:3})
}

async function programmatic_usage2(){
  const srv = await cds.connect.to(Sue)
  srv.sum(1,2)
  srv.add(11,2)
  srv.stock(2)
  srv.getStock('Foo',2)
  srv.order('Foo',2,3)
}

class Sue extends cds.Service {
  sum(x,y) { return x+y }
  add(x,to) { return stocks[to] += x }
  stock(id) { return stocks[id] }
  getStock(Foo,id) { return stocks[id] }
  order(Foo,id,x) { return stocks[id] -= x }
}
module.exports = Sue
