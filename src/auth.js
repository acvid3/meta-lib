const API_VERSION = 'v19.0';
const AUTH_URL = `https://www.facebook.com/${API_VERSION}/dialog/oauth`;
const TOKEN_URL = `https://graph.facebook.com/${API_VERSION}/oauth/access_token`;
const GRAPH_API = `https://graph.facebook.com/${API_VERSION}`;

function getAuthorizationUrl(redirectUri, scope = 'pages_manage_posts,pages_read_engagement', state = '') {
  const clientId = process.env.META_CLIENT_ID;
  if (!clientId) {
    throw new Error('META_CLIENT_ID is not set');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    response_type: 'code',
    state,
  });

  return `${AUTH_URL}?${params.toString()}`;
}

async function getAccessToken(code, redirectUri) {
  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('META_CLIENT_ID and META_CLIENT_SECRET must be set');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(`${TOKEN_URL}?${params.toString()}`);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Token request failed'), { response: { status: res.status, data } });
  }

  return data;
}

async function getLongLivedToken(shortLivedToken) {
  const clientId = process.env.META_CLIENT_ID;
  const clientSecret = process.env.META_CLIENT_SECRET;

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: clientId,
    client_secret: clientSecret,
    fb_exchange_token: shortLivedToken,
  });

  const res = await fetch(`${GRAPH_API}/oauth/access_token?${params.toString()}`);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Token exchange failed'), { response: { status: res.status, data } });
  }

  return data;
}

async function getPageAccessToken(userAccessToken, pageId) {
  const res = await fetch(`${GRAPH_API}/${pageId}?fields=access_token&access_token=${userAccessToken}`);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Failed to get page token'), { response: { status: res.status, data } });
  }

  return data.access_token;
}

async function getUserInfo(accessToken) {
  const res = await fetch(`${GRAPH_API}/me?fields=id,name,email,picture&access_token=${accessToken}`);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Failed to fetch user info'), { response: { status: res.status, data } });
  }

  return data;
}

module.exports = {
  getAuthorizationUrl,
  getAccessToken,
  getLongLivedToken,
  getPageAccessToken,
  getUserInfo,
};
