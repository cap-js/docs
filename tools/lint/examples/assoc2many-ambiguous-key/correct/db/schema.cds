entity Books {
  key ID: UUID;
  author: Association to Author;
};

entity Author {
  key ID: UUID;
  books: Association to many Books on books.author = $self;
}