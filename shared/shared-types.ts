export type User = {
    username: string;
    email?: string;
    password?: string;
    theme?: string;
}

export enum APIEndpoints {
    REGISTER = "/api/register",
    GET_USER = "/api/get-user",
    CHANGE_THEME = "/api/theme/change",
    GET_THEME = "/api/theme/get"
}