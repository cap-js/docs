using { sap.capire.orders, OrdersService, sap.common } from 'base-app';

namespace x_bookshop.extension;

extend orders.Orders with {
  x_priority    : String;
  x_SalesRegion : Association to x_SalesRegion;
  other         : String;
}

extend service OrdersService with {
  entity x_SalesRegion as projection on extension.x_SalesRegion;
  entity x_MyOrders as projection on orders.Orders;
}

@sql.append: 'foo'
entity x_SalesRegion: common.CodeList {
  key regionCode : String(11);
}
