// Misspelled key 'grrant'. Did you mean 'grant'?
// Misspelled key 'too'. Did you mean 'to'?
// Misspelled key 'wheree'. Did you mean 'where'?
entity Products @(restrict : [{ // [!code warning]
  grrant : 'READ',
  too    : 'Vendor',
  wheree : 'CreatedBy = $user'
}]) {
  Name : String;
}
