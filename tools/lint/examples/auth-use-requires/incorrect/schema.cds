service CatalogService @(restrict: [{to: 'Admin'}]) {
  entity Products {
      ID: Integer;
  }
  actions {
    @restrict: [{grant:'*', to: 'Admin'}]
    // Use `@requires` instead of `@restrict.to` at action `addRating`.
    action addRating (stars: Integer); // [!code warning]
  }
  function getViewsCount @(restrict: [{ to: 'Admin' }]) () returns Integer;
}