entity Products @(restrict : [{
  to   : 'authenticated-user',
}]) {
  Name : String;
}

entity Orders @(restrict : [{
  to   : ['authenticated-user', 'system-user'],
}]) {
  Name : String;
}