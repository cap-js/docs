entity Books {
  key ID: UUID;
  author: Association to Author;
};

entity Author {
  key ID: UUID;
  books: Association to many Books on books.author = $self;
}

view AuthorView as select from Author {
  // Ambiguous key in 'AuthorView'. Element 'bookIDs' leads to multiple
  // entries so that key 'ID' is not unique.
  key ID, // [!code error]
  books.ID as bookIDs
};