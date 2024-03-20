entity Book {
    title: String;
    // '$pages' is prefixed with a dollar sign ($).
    $pages: Integer; // [!code warning]
}

entity $self {
  key id : String;
  // '$self' is prefixed with a dollar sign ($).
  $self: String; // [!code warning]
}
view V as select from $self as self {
  self.$self as $self
};
