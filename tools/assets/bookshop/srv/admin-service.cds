using { sap.capire.bookshop } from '../db/data-model';

/**
 * For maintenance of the book catalog and the authors
 */
service AdminService {
  entity Books as projection on bookshop.Books;
  entity Authors as projection on bookshop.Authors;
}
