service AuditLogService {

  // ------------------------------------------------------------
  // Generic log messages

  /**
   * Generic method to log any kind of messages
   */
  action log (event: String, data: LogMessage);

  /**
   * Common signature of all log messages.
   * Missing fields are filled in automatically
   */
  @insertonly entity LogMessage {
    tenant: String;
    user: String;
    time: String;
  }


  // ------------------------------------------------------------
  // Personal Data

  type DataSubject : DataObject { role: String }
  type DataObject  : { type: String; id: {} }

  /**
   * Logs read access to sensitive personal data
   */
  event SensitiveDataRead : LogMessage {
    data_subjects : many DataSubject;
    data_subject  : DataSubject;
    object        : DataObject;
    channel       : String;
    attributes    : many { name: String };
    attachments   : many { name: String; id: String };
  }

  /**
   * Logs changes to personal data
   */
  event PersonalDataChanged : LogMessage {
    data_subject  : DataSubject;
    object        : DataObject;
    attributes    : ChangedAttributes;
  }

  type ChangedAttributes : many {
    name: String;
    old: String;
    new: String
  }


  // ------------------------------------------------------------
  // Config & Security events

  event ConfigChange : LogMessage {
    object        : DataObject;
    attributes    : ChangedAttributes;
  }

  event FailedLogin : LogMessage {
    action : String;
    data   : String;
  }
}
