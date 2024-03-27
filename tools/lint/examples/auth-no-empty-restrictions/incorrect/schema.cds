namespace db;

entity Books @(restrict: [
  { grant: 'READ', to: 'Buyer' },
]) {
    Name: String;
}

// No explicit restrictions provided on service `db.BuyerService`
// at `@requires`.
service BuyerService @(requires: '') { // [!code error]
    // No explicit restrictions provided on entity
    // `db.BuyerService.Books` at `@restrict`.
    entity Books @(restrict: '') as projection on db.Books; // [!code error]
}

// No explicit restrictions provided on service `db.AnotherService`
// at `@requires`.
service AnotherService @(requires: []) { // [!code error]
    // No explicit restrictions provided on entity
    // `db.AnotherService.Books` at `@restrict`.
    entity Books @(restrict: []) as projection on db.Books; // [!code error]
}
