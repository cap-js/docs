namespace sap.capire.bookshop;

/** Book written by an author */
entity Books {
  key ID : Integer;
  title  : localized String(111);
  descr  : localized String(1111);
  author : Association to Authors;
  stock  : Integer;
  price  : Decimal(9,2);
}

/** Writer of books */
entity Authors {
  key ID : Integer;
  name   : String(111);
  books  : Association to many Books on books.author = $self;
}
