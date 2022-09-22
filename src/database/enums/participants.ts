enum ParticipantStatus {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE"
  }
  
  enum ParticipantRole {
    PARTICIPANT = "PARTICIPANT",
    MODERATOR = "MOD",
    MANAGER = "MANAGER",
    ADMIN = "ADMIN",
    OWNER = "OWNER"
  }
  
  enum ParticipantState {
    JOINED = "JOINED",
    EXITED = "EXITED",
    BANNED = "BANNED",
    KICKED = "KICKED"
  }
  
  export { ParticipantStatus, ParticipantRole, ParticipantState }