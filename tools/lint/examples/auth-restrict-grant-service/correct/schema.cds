@(restrict: [{
  grant: '*',
  to   : [
    'scope1',
    'scope2'
  ]
}])
service service1 {}

@(restrict: [{
  grant: ['*'],
  to   : [
    'scope1',
    'scope2'
  ]
}])
service service2 {}

@(restrict: [{to: [
  'scope1',
  'scope2'
]}])
service service3 {}

service service4 {
  entity entity4 {}
  actions {
    action addRating  @(restrict: [{ to: 'Admin' }])  (stars: Integer);
  }
  function getViewsCount @(restrict: [{ to: 'Admin' }]) () returns Integer;
}