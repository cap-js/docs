entity Books {
  key ID: UUID;
  title: localized String(1111);
};

event reviewed { book: Books:ID };
action review  ( book: Books:ID );
