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
  // Potential issue - Missing SQL cast for column expression?
  // Potential issue - Missing SQL cast for column expression?
  entity ListOfEmployees2 as ( // [!code warning]
    SELECT from Employees {
      firstname || lastname as name1 : String,
    }
  ) UNION (
    SELECT from Employees {
      firstname || lastname as name1 : String,
    }
  );