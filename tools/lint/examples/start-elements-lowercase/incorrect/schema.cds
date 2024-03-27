entity Books {
  key ID: UUID;
  // Element name 'Books.Title' should start with a lowercase letter.
  Title: localized String(1111); // [!code warning]
};