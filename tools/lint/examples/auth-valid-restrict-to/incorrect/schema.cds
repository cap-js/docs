// Missing role on Products for `@restrict.to`.
entity Products @(restrict : [{ // [!code warning]
  to   : '',
}]) {
  Name : String;
}

// Missing roles on Orders for `@restrict.to`.
entity Orders @(restrict : [{ // [!code warning]
  to   : [],
}]) {
  Name : String;
}

// Invalid item '[authenticated-user,any]'. Did you mean '["any"]'?
entity Books @(restrict : [{ // [!code warning]
  to   : ['authenticated-user', 'any'],
}]) {
  Name : String;
}
// Invalid item 'authenticated-usr'. Did you mean 'authenticated-user'?
entity MoreProducts @(restrict : [{ // [!code warning]
  to   : 'authenticated-usr',
}]) {
  Name : String;
}

entity MoreOrders @(restrict : [{
  to   : ['authenticated-user', 'anonymous'],
}]) {
  Name : String;
}

service CustomerService @(requires: 'authenticated-user') {
  entity Products @(restrict: [
    { grant: 'READ' },
    { grant: 'WRITE', to: 'Vendor' },
    { grant: 'addRating', to: 'Customer'}
  ]) {/*...*/}
  actions {
     action addRating (stars: Integer);
  }
  entity Orders @(restrict: [
    { grant: '*', to: 'Customer', where: 'CreatedBy = $user' }
  ]) {/*...*/}
  action monthlyBalance @(requires: 'Vendor') ();
}