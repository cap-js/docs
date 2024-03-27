entity Employees {
  key ID : UUID;
  firstname : String;
  lastname : String;
}
entity ListOfEmployees as SELECT from Employees {
  *, ID,
  1 as one : Integer,
  firstname || lastname as name1 : String,
  cast (firstname || lastname as String) as name2,
  cast (firstname || lastname as String) as name3 : String,
};