entity Products @(restrict : [{
  grant : 'READ',
  to    : 'Vendor',
  where : 'CreatedBy = $user'
}]) {
  Name : String;
}
