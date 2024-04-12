namespace sap.capire.bookshop;

entity Books {
  key ID : Integer;
  @mandatory title  : localized String(111);
  @mandatory author : Association to Authors;
  // '$pages' is prefixed with a dollar sign ($).
  $pages: Integer; // [!code warning]
}

entity Authors {
  key ID : Integer;
  @mandatory name   : String(111);
  books  : Association to many Books on books.author = $self;
}