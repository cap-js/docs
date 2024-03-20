// Missing event/action on Products for `@restrict.grant`.
entity Products @(restrict : [{ // [!code warning]
  grant   : '',
}]) {
  Name : String;
}

// Missing event/action on Orders for `@restrict.grant`.
entity Orders @(restrict : [{ // [!code warning]
  grant   : [],
}]) {
  Name : String;
}

// Invalid item 'read'. Did you mean 'READ'?
// Invalid item '[read]'. Did you mean '["WRITE"]'?
entity MoreBooks @(restrict : [{ // [!code warning]
  grant   : ['read'],
}]) {
  Name : String;
}

// Invalid item 'REAAD'. Did you mean 'READ'?
entity MoreProducts @(restrict : [{ // [!code warning]
  grant   : 'REAAD',
}]) {
  Name : String;
}

// Invalid item '[READ,*]'. Did you mean '["*"]'?
entity EvenMoreProducts @(restrict : [{ // [!code warning]
  grant   : ['READ', '*'],
}]) {
  Name : String;
}

// Invalid item 'wriite'. Did you mean 'WRITE'?
entity MoreOrders @(restrict : [{ // [!code warning]
  grant   : ['READ', 'wriite'],
}]) {
  Name : String;
}

entity EvenMoreOrders @(restrict : [{
  grant   : ['CREATE', 'UPDATE', 'DELETE', 'INSERT', 'UPSERT', 'WRITE'],
}]) {
  Name : String;
}
