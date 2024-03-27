// Invalid `where` expression, CDS compilation failed.
entity Products @(restrict : [{ // [!code warning]
  grant : '*',
  to    : 'Customer',
  where : 'CreatedBy === $user'
}]) {
  Name : String;
}
