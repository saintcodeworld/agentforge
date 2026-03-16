import { TwitterApi } from "twitter-api-v2";

// App-level client for checking usernames etc.
export function getAppClient(): TwitterApi {
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) throw new Error("X_BEARER_TOKEN not configured");
  return new TwitterApi(bearerToken);
}

// User-level client for posting on behalf of an agent
export function getUserClient(accessToken: string): TwitterApi {
  return new TwitterApi(accessToken);
}

// OAuth 2.0 client for authorization flow
export function getOAuthClient(): TwitterApi {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("X_CLIENT_ID and X_CLIENT_SECRET not configured");
  return new TwitterApi({ clientId, clientSecret });
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  // Basic validation first
  if (!username || username.length < 1 || username.length > 15) return false;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return false;
  
  // Reserved/common usernames that are definitely taken
  const reserved = ["twitter", "x", "admin", "support", "api", "dev", "help", "elon", "elonmusk", "jack"];
  if (reserved.includes(username.toLowerCase())) return false;

  // Skip API check if bearer token is not configured or known to fail
  // Just return true (available) for valid usernames since we can't verify
  const bearerToken = process.env.X_BEARER_TOKEN;
  if (!bearerToken) {
    console.log("X_BEARER_TOKEN not set, skipping API check, assuming username available");
    return true;
  }

  try {
    const client = getAppClient();
    if (!client) return true;
    const user = await client.v2.userByUsername(username);
    // If we get data back, the username is taken
    return !user.data;
  } catch (error: unknown) {
    const err = error as { code?: number; statusCode?: number };
    // 404 means user not found = available
    if (err.code === 404 || err.statusCode === 404) return true;
    // 402 payment required or other API errors — assume available (can't verify)
    // User will find out during OAuth if it's actually taken
    console.log("Username check API error (code:", err.code || err.statusCode, "), assuming available");
    return true;
  }
}

export async function postTweet(
  accessToken: string,
  content: string,
  inReplyTo?: string
): Promise<{ id: string; text: string } | null> {
  try {
    const client = getUserClient(accessToken);
    const payload: { text: string; reply?: { in_reply_to_tweet_id: string } } = { text: content };
    if (inReplyTo) {
      payload.reply = { in_reply_to_tweet_id: inReplyTo };
    }
    const tweet = await client.v2.tweet(payload);
    return { id: tweet.data.id, text: tweet.data.text };
  } catch (error) {
    console.error("Failed to post tweet:", error);
    return null;
  }
}

export async function updateProfile(
  accessToken: string,
  opts: { name?: string; description?: string; url?: string }
): Promise<boolean> {
  try {
    const client = getUserClient(accessToken);
    await client.v1.updateAccountProfile({
      name: opts.name,
      description: opts.description,
      url: opts.url,
    });
    return true;
  } catch (error) {
    console.error("Failed to update profile:", error);
    return false;
  }
}

export async function followUser(
  accessToken: string,
  myUserId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    const client = getUserClient(accessToken);
    await client.v2.follow(myUserId, targetUserId);
    return true;
  } catch (error) {
    console.error("Failed to follow user:", error);
    return false;
  }
}

// Generate the OAuth 2.0 authorization URL
export function generateOAuthLink(state: string): {
  url: string;
  codeVerifier: string;
} {
  const client = getOAuthClient();
  const callbackUrl = process.env.NEXT_PUBLIC_X_CALLBACK_URL || "http://localhost:3000/api/x-automation/callback";

  const { url, codeVerifier } = client.generateOAuth2AuthLink(callbackUrl, {
    scope: ["tweet.read", "tweet.write", "users.read", "follows.write", "offline.access"],
    state,
  });

  return { url, codeVerifier };
}

// Exchange authorization code for access token
export async function exchangeOAuthCode(
  code: string,
  codeVerifier: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
}> {
  const client = getOAuthClient();
  const callbackUrl = process.env.NEXT_PUBLIC_X_CALLBACK_URL || "http://localhost:3000/api/x-automation/callback";

  const result = await client.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callbackUrl,
  });

  // Get the user ID
  const me = await result.client.v2.me();

  return {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken || "",
    expiresIn: result.expiresIn,
    userId: me.data.id,
  };
}

// Refresh an expired access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  try {
    const client = getOAuthClient();
    const result = await client.refreshOAuth2Token(refreshToken);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken || refreshToken,
      expiresIn: result.expiresIn,
    };
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
}
