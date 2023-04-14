service Sue {
  // unbound actions & functions
  function sum (x:Integer, y:Integer) returns Integer;
  function stock (id : Foo:ID) returns Integer;
  action add (x:Integer, to: Integer) returns Integer;

  // bound actions & functions
  entity Foo { key ID:Integer } actions {
    function getStock() returns Integer;
    action order (x:Integer) returns Integer;
  }
}
