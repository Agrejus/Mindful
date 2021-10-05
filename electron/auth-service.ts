import jwtDecode from 'jwt-decode';
import axios, { AxiosRequestConfig } from 'axios';
import * as url from 'url';
import * as keytar from 'keytar';
import * as os from 'os';

const { apiIdentifier, auth0Domain, clientId } = { apiIdentifier: "", auth0Domain: "mindful-emergentsoftware.us.auth0.com", clientId: "Da9HSSTRUECz9V6zAadGRpYIzMYfgfiZ" };

const redirectUri = "http://localhost/callback";

const keytarService = "electron-openid-oauth";
const keytarAccount = os.userInfo().username;

let accessToken: string | null = null;
let profile: any = null;
let refreshToken = null;

export const getAccessToken = () => {
    return accessToken;
}

export const getProfile = () => {
    return profile;
}

export const getAuthenticationURL = () => {
    return (
        "https://" +
        auth0Domain +
        "/authorize?" +
        "scope=openid profile offline_access&" +
        "response_type=code&" +
        "client_id=" +
        clientId +
        "&" +
        "redirect_uri=" +
        redirectUri
    );
}

export const refreshTokens = async () => {
    const refreshToken = await keytar.getPassword(keytarService, keytarAccount);

    if (refreshToken) {
        const refreshOptions: AxiosRequestConfig = {
            method: "POST",
            url: `https://${auth0Domain}/oauth/token`,
            headers: { "content-type": "application/json" },
            data: {
                grant_type: "refresh_token",
                client_id: clientId,
                refresh_token: refreshToken,
            },
        };

        try {
            const response = await axios(refreshOptions);

            accessToken = response.data.access_token;
            profile = jwtDecode(response.data.id_token);
        } catch (error) {
            await logout();

            throw error;
        }
    } else {
        throw new Error("No available refresh token.");
    }
}

export const loadTokens = async (callbackURL: string) => {
    const urlParts = url.parse(callbackURL, true);
    const query = urlParts.query;

    const exchangeOptions = {
        grant_type: "authorization_code",
        client_id: clientId,
        code: query.code,
        redirect_uri: redirectUri,
    };

    const options: AxiosRequestConfig = {
        method: "POST",
        url: `https://${auth0Domain}/oauth/token`,
        headers: {
            "content-type": "application/json",
        },
        data: JSON.stringify(exchangeOptions),
    };

    try {
        const response = await axios(options);

        accessToken = response.data.access_token;
        profile = jwtDecode(response.data.id_token);
        refreshToken = response.data.refresh_token;

        if (refreshToken) {
            await keytar.setPassword(keytarService, keytarAccount, refreshToken);
        }
    } catch (error) {
        await logout();

        throw error;
    }
}

export const logout = async () => {
    await keytar.deletePassword(keytarService, keytarAccount);
    accessToken = null;
    profile = null;
    refreshToken = null;
}

export const getLogOutUrl = () => {
    return `https://${auth0Domain}/v2/logout`;
}