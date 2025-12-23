"use server";

import axios from "axios";

const ML_API_BASE_URL = "https://api.mercadolibre.com";
const ML_AUTH_URL = "https://auth.mercadolibre.com.ar/authorization";

// Token response from MercadoLibre OAuth
export interface MLTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
}

// Item response from MercadoLibre API
export interface MLItemResponse {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  status: string;
  available_quantity: number;
  sold_quantity: number;
  category_id: string;
  permalink: string;
  thumbnail: string;
  pictures: Array<{ url: string }>;
  attributes: Array<{ id: string; name: string; value_name: string }>;
}

// Description response from MercadoLibre API
export interface MLDescriptionResponse {
  text: string;
  plain_text: string;
  last_updated: string;
  date_created: string;
}

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

/**
 * Generates the MercadoLibre OAuth authorization URL.
 */
export async function getAuthURL(): Promise<string> {
  const clientId = getEnvVar("ML_CLIENT_ID");
  const redirectUri = getEnvVar("ML_REDIRECT_URI");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
  });

  return `${ML_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges an authorization code for an access token.
 */
export async function exchangeCodeForToken(
  code: string
): Promise<MLTokenResponse> {
  const clientId = getEnvVar("ML_CLIENT_ID");
  const clientSecret = getEnvVar("ML_CLIENT_SECRET");
  const redirectUri = getEnvVar("ML_REDIRECT_URI");

  try {
    const response = await axios.post<MLTokenResponse>(
      `${ML_API_BASE_URL}/oauth/token`,
      {
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to exchange code for token: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw error;
  }
}

/**
 * Fetches item details from MercadoLibre API.
 */
export async function getItemDetails(
  itemId: string,
  accessToken: string
): Promise<MLItemResponse> {
  try {
    const response = await axios.get<MLItemResponse>(
      `${ML_API_BASE_URL}/items/${itemId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch item ${itemId}: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw error;
  }
}

/**
 * Fetches item description from MercadoLibre API.
 */
export async function getItemDescription(
  itemId: string,
  accessToken: string
): Promise<MLDescriptionResponse> {
  try {
    const response = await axios.get<MLDescriptionResponse>(
      `${ML_API_BASE_URL}/items/${itemId}/description`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch description for item ${itemId}: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw error;
  }
}

// User items search response from MercadoLibre API
export interface MLUserItemsResponse {
  results: Array<{
    id: string;
    title: string;
    price: number;
    currency_id: string;
    status: string;
    available_quantity: number;
    sold_quantity: number;
    category_id: string;
    permalink: string;
    thumbnail: string;
    pictures: Array<{ url: string }>;
    attributes: Array<{ id: string; name: string; value_name: string }>;
    condition: string;
  }>;
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

/**
 * Fetches user's listings from MercadoLibre API.
 */
export async function getUserListings(
  userId: string,
  accessToken: string,
  offset: number = 0,
  limit: number = 50
): Promise<MLUserItemsResponse> {
  try {
    const response = await axios.get<MLUserItemsResponse>(
      `${ML_API_BASE_URL}/users/${userId}/items/search`,
      {
        params: {
          offset,
          limit,
          status: "active",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to fetch user listings: ${
          error.response?.data?.message || error.message
        }`
      );
    }
    throw error;
  }
}
