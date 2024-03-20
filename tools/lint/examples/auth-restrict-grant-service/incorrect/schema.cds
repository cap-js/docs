@(restrict: [{
  grant: 'WRITE',
  to   : [
    'scope1',
    'scope2'
  ]
}])
// The grant value provided in @restrict is limited to '*' for service
// 'service1'.
service service1 {} // [!code error]

@(restrict: [{
  grant: ['WRITE'],
  to   : [
    'scope1',
    'scope2'
  ]
}])
// The grant value provided in @restrict is limited to '*' for service
// 'service2'.
service service2 {} // [!code error]

@(restrict: [{to: [
  'scope1',
  'scope2'
]}])
service service3 {}

service service4 {
  entity entity4 {}
  actions {
    // The grant value provided in @restrict is limited to '*' for action
    // 'addRating'.
    action addRating  @(restrict: [{ grant: ['WRITE'], to: 'Admin' }])  (stars: Integer); // [!code error]
  }
  // The grant value provided in @restrict is limited to '*' for function
  // 'service4.getViewsCount'.
  function getViewsCount @(restrict: [{ grant: ['WRITE'], to: 'Admin' }]) () returns Integer; // [!code error]
}
