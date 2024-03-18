namespace sap.capire.bookshop;

entity Books {
  key ID: UUID;
  Title: localized String(1111); // [!code error]
};