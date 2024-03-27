service CatalogService @(requires: 'Admin'){  
  entity Products {
      ID: Integer;
  }
  actions {
    @(requires: 'Admin')
    action addRating (stars: Integer);
  }
  function getViewsCount @(requires: 'Admin') () returns Integer;
}