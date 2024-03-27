// Entity name 'books' should start with an uppercase letter.
entity books { // [!code warning]
  key ID: UUID;
  title: localized String(1111);
};