namespace db;

entity Books @(restrict: [
  { grant: 'READ', to: 'Buyer' },
]) {
    Name: String;
}

service BuyerService @(requires: ''){
    entity Books @(restrict: '') as projection on db.Books;
}

service AnotherService @(requires: []){
    entity Books @(restrict: []) as projection on db.Books;
}