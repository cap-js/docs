


// In JavaScript code
orders = await SELECT.from (Orders, o=>{
  o.ID, o.descr, o.Items (oi=>{
    oi.book.title, oi.quantity
  })
})


// Consumption in JavaScript
let srv = cds.connect.to('OrdersService')
let { Orders } = srv.entities
order = await SELECT.one.from (Orders)
  .where({ ID:4711 })
srv.cancelOrder (order.ID)




// Service Implementation
cds.service.impl (function(){
  this.on ('UPDATE','Orders', (req)=>{})
  this.on ('cancelOrder', (req)=>{})
})


// Emitting Events
// e.g. in this.on ('cancelOrder', ...)
let { ID } = req.data
this.emit ('orderCancelled', {ID})


// Subscribing to Events
let srv = cds.connect.to('OrdersService')
srv.on ('orderCancelled', (msg)=>{})
