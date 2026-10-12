export interface ConnectRequest {
    grant_type: string;
    client_id: string;
    username?: string;
    password?: string;
    refresh_token?: string;
    workplace_id?: string;
}

export interface ConnectResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}