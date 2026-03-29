export type User = {
    username: string;
    email?: string;
    password?: string;
    theme?: string;
}

export type Room = {
    id: string;
    name: string;
    createdAt: Date;
    createdBy: User;
    isAnonymous: boolean;
    isPrivate: boolean;
    password?: string;
}

export type Message = {
  type: "success" | "error";
  text: string;
};

export enum APIEndpoints {
    REGISTER = "/api/register",
    GET_USER = "/api/get-user",
    CHANGE_THEME = "/api/theme/change",
    GET_THEME = "/api/theme/get",
    CREATE_ROOM = "/api/room/new",
    ROOM_BASE = "/api/room/"
}