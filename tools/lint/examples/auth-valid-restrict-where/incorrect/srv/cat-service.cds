using { sap.capire.bookshop as my } from '../db/schema';

service CatalogService {
  @(restrict: [{ grant: 'READ', to: '', where: 'CreatedBy === $user' }])
  // Invalid `where` expression, CDS compilation failed.
  @readonly entity ListOfBooks as projection on Books excluding { descr }; // [!code warning]

  @readonly entity Books as projection on my.Books { *,
    author.name as author
  } excluding { createdBy, modifiedBy };
}