entity Products @(restrict : [{
  grant   : 'READ',
}]) {
  Name : String;
}

entity Orders @(restrict : [{
  grant   : ['READ', 'WRITE'],
}]) {
  Name : String;
}

entity Books @(restrict : [{
  grant   : ['*'],
}]) {
  Name : String;
}

entity Shops @(restrict : [{
  grant   : ['any'],
}]) {
  Name : String;
}

