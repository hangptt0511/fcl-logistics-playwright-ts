export interface LoginData {
    id: string,
    description: string,
    username: string,
    password: string,
    expectedUrl: string,
    expectedErorMsg:string
}

export interface connectRequest {
    grant_type: string;
    client_id: string;
    username?: string;
    password?: string;
    refresh_token?: string;
    workplace_id?: string;
}

export interface UserProfile {
    id: number;
    username: string;
    fullName: string;
    email: string;
    roles: string[];
}

export interface connectResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
}
