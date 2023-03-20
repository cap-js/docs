using { Country, managed }        //> reusing common types
 from '@sap/cds/common';          //> ...from foundation models

service ProductService {

  entity Products : managed {     //> auto-filled admin data 
    key ID  : UUID;               //> auto-filled primary keys
    title   : localized String;   //> automatic text tables 
    descr   : localized String;   //> automatic text tables 
    country : Country;            //> automatic value help
  }                               //> auto-exposed code lists
  
}