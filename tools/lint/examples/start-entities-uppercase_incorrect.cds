namespace sap.capire.bookshop;

// Entity name 'books' should start with an uppercase letter.
entity books { // [!code error]
  key ID: UUID;
  Title: localized String(1111);
};