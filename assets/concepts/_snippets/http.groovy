


// Via OData
GET .../Orders?$select=ID,descr
$expand=Items(
  $select=book/title,quantity
)


// Consumption via REST APIs
GET /orders/Orders/4711
POST /orders/cancelOrder/4711
