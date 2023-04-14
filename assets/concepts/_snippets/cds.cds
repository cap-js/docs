



entity Books : cuid {
  title : localized String;
  author : Association to Authors;
}

entity Orders : cuid, managed {
  descr : String;
  Items : Composition of many {
    book : Association to Books;
    quantity : Integer;
  }
}



// Separation of Concerns
extend Books with @restrict[
  {grant:'WRITE', to:'admin'}
];

// Verticalization
extend Books with {
  ISBN : String
};

// Customization
extend Orders with {
  customer_specific : String
};


// In JavaScript code
orders = await SELECT.from (Orders, o=>{
  o.ID, o.descr, o.Items (oi=>{
    oi.book.title, oi.quantity
  })
})

// Via OData
GET .../Orders?$select=ID,descr
$expand=Items(
  $select=book/title,quantity
)

// Projections in CDS
service OrdersService {
  define entity OrderDetails
  as select from Orders {
     ID, descr, Items
  }
}


// Service Definition in CDS
service OrdersService {
  entity Orders as projection on my.Orders;
  action cancelOrder (ID:Orders.ID);
  event orderCanceled : { ID:Orders.ID }
}
