entity Products @(restrict : [{
  grant : '*',
  to    : 'Customer',
  where : 'CreatedBy = $user'
}]) {
  Name : String;
}
