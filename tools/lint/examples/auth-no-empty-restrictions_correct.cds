namespace db;

entity Books @(restrict: [
  { grant: 'READ', to: 'Buyer' },
]) {
    Name: String;
}

service BuyerService @(requires: 'authenticated-user'){
    entity Books @(restrict: [
    { grant: '*', to: 'Admin'}
  ]) as projection on db.Books;
}