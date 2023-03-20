service ProductService {

  entity Products {
    key ID     : UUID;
    title      : localized String;
    descr      : localized String;
    country    : Country;
    createdAt  : Timestamp @cds.on.insert : $now;
    createdBy  : User      @cds.on.insert : $user;
    modifiedAt : Timestamp @cds.on.insert : $now  @cds.on.update : $now;
    modifiedBy : User      @cds.on.insert : $user @cds.on.update : $user;
    localized  : Association to many Products_texts
      on localized.language = session_context('locale')
      and localized.product = $self;
  }

  entity Products_texts {
    key product  : Association to Products;
    key language : String(3);
    title : String;
    descr : String;
  }

  type User : String(111);
  type Country : Association to sap.common.Countries;
  type Language : Association to sap.common.Languages;

  annotate Country  with @(
    title:'{i18n>Country}',
    Common.ValueList.entity: 'Countries'
  );
  annotate Language with @(
    title:'{i18n>Language}',
    Common.ValueList.entity: 'Languages'
  );

}

context sap.common {

  entity Languages  : CodeList{}
  entity Countries  : CodeList{}
  entity Currencies : CodeList{}

  abstract entity CodeList @(
    UI.Identification: [{ $Type: 'UI.DataField', Value: name }],
  ) {
    key code  : String(3);  // ISO codes
        name  : localized String;
        descr : localized String;
  }

}
