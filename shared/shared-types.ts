export type User = {
  username: string;
  email?: string;
  password?: string;
  theme?: string;
  ownedLobbies?: string[];
  joinedLobbies?: string[];
  friends?: Friendship[]; // ✨ array of friendship :) ✨
};

export type Friendship = {
  username: string;
  status: "pending" | "accepted";
};

export type Room = {
  id: string;
  name: string;
  createdAt: Date;
  createdBy: User;
  isAnonymous: boolean;
  isPrivate: boolean;
  roomID: string;
  members: string[]; // List of usernames
  password?: string;
  requests?: DRequest[];
};

export type VotingRecord = {
  username: string;
  upvote: boolean; // false for downvote, true for upvote
};

export type DRequest = {
  id: string; // generated ID for tracking and referencing
  timeStamp: Date;
  sentBy: string; // username
  title: string;
  details: string;
  votingHistory: VotingRecord[];
};

export type Message = {
  type: "success" | "error";
  text: string;
};

export type GeminiRequest = {
  description: string;
  factors: Factor[];
};

export type Factor = {
  id: string | number;
  title: string; // Price
  details: string; // "I want it to be under $5,000"
  user_weighting: number; // 2 votes up, or 1 vote net negative
};

export type ResponseFactor = {
  factorId: string | number;
  matchPercent: number;
};

export enum API {
  BASE = "/api",
  LOGIN = "/login",
  REGISTER = "/register",
  GET_USER = "/get-user",
  CHANGE_THEME = "/theme/change",
  GET_THEME = "/theme/get",
  CREATE_ROOM = "/new",
  ROOM_BASE = "/room",
  ROOM_LEAVE = "/leave",
  CALL_GEMINI = "/gemini",
  ADD_TO_ROOM = "/add-member",
  FRIEND_BASE = "/friend",
  ADD_FRIEND = "/add",
  ACCEPT_FRIEND = "/accept",
  GET_FRIENDS_LIST = "/get",
  REMOVE_FRIEND = "/remove",
  ADD_MESSAGE = "/message/add",
  GET_MESSAGES = "/message/get",
  REMOVE_MESSAGE = "/message/remove",
  ADD_VOTE = "/vote/add",
  REMOVE_VOTE = "/vote/remove",
}
