namespace incidents;

/** Ticket priority */
type Priority: String enum {
  LOW = 'Low';
  MEDIUM = 'Medium';
  HIGH = 'High';
}

/** Ticket with status and priority */
entity Tickets {
  priority: Priority;
  /** Assignment status  */
  status: String enum {
    ASSIGNED = 'A';
    UNASSIGNED = 'U';
  }
}