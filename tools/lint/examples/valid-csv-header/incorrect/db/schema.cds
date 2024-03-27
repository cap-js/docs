namespace my.bookshop;

aspect managed {
  createdAt  : Timestamp;
  modifiedAt : Timestamp;
}

entity Currencies {
  key code   : String(3);
      symbol : String(5);
}

entity Books : managed {
  key ID       : Integer;
      title    : localized String(111);
      descr    : localized String(1111);
      author   : Association to Authors;
      stock    : Integer;
      price    : Decimal(9, 2);
      currency : Association to Currencies;
}

entity Authors : managed {
  key ID    : Integer;
      name  : String;
      books : Association to many Books
                on books.author = $self;
}
