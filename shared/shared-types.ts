export type User = {
    username: string;
    email?: string;
    password?: string;
    theme?: string;
    ownedLobbies?: string[];
    joinedLobbies?: string[];
    friends?: Friendship[]; // ✨ array of friendship :) ✨
}

export type Friendship = {
   username: string,
   status: "pending" | "accepted"
}

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
}

export type Message = {
  type: "success" | "error";
  text: string;
};

export type GeminiRequest = {
    description: string;
    factors: Factor[];
}

export type Factor = {
    id: number,
    title: string, // Price
    details: string, // "I want it to be under $5,000"
    user_weighting: number // 2 votes up, or 1 vote net negative
}

export type ResponseFactor = {
    factorId: number,
    matchPercent: number

}

export enum APIEndpoints {
    REGISTER = "/api/register",
    GET_USER = "/api/get-user",
    CHANGE_THEME = "/api/theme/change",
    GET_THEME = "/api/theme/get",
    CREATE_ROOM = "/api/room/new",
    ROOM_BASE = "/api/room/",
    CALL_GEMINI = "/api/gemini",
    ADD_TO_ROOM = "/add-member",
    ADD_FRIEND = "/api/add-friend",
    ACCEPT_FRIEND = "/api/accept-friend",
    GET_FRIENDS_LIST = "/api/get-friends",
    REMOVE_FRIEND = "/api/remove-friend"
}