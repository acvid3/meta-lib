const auth = require('./auth');
const post = require('./post');
const instagram = require('./instagram');

/**
 * Build Facebook OAuth authorization URL. Redirect user here to authorize.
 * @param {string} redirectUri
 * @param {string} [scope='pages_manage_posts,pages_read_engagement']
 * @param {string} [state='']
 * @returns {string} Authorization URL.
 */
function getAuthorizationUrl(redirectUri, scope = 'pages_manage_posts,pages_read_engagement', state = '') {
  return auth.getAuthorizationUrl(redirectUri, scope, state);
}

/**
 * Exchange authorization code for access token.
 * @param {string} code - Code from callback query param.
 * @param {string} redirectUri - Must match getAuthorizationUrl.
 * @returns {Promise<{access_token: string, expires_in: number}>}
 */
function getAccessToken(code, redirectUri) {
  return auth.getAccessToken(code, redirectUri);
}

/**
 * Exchange short-lived token (1-2h) for long-lived token (60d).
 * @param {string} shortLivedToken
 * @returns {Promise<{access_token: string, expires_in: number}>}
 */
function getLongLivedToken(shortLivedToken) {
  return auth.getLongLivedToken(shortLivedToken);
}

/**
 * Get a page-specific access token from a user access token.
 * @param {string} userAccessToken
 * @param {string} pageId
 * @returns {Promise<string>} Page access token.
 */
function getPageAccessToken(userAccessToken, pageId) {
  return auth.getPageAccessToken(userAccessToken, pageId);
}

/**
 * Get authenticated user/ page info.
 * @param {string} accessToken
 * @returns {Promise<{id: string, name: string, email?: string}>}
 */
function getUserInfo(accessToken) {
  return auth.getUserInfo(accessToken);
}

/**
 * Create a text post on a Facebook page feed.
 * @param {string} accessToken - Page access token.
 * @param {string} pageId - Facebook page ID.
 * @param {string} message - Post text.
 * @param {object} [options]
 * @param {string} [options.link] - URL to attach.
 * @returns {Promise<{id: string, postId: string}>}
 */
function createPost(accessToken, pageId, message, options) {
  return post.createPost(accessToken, pageId, message, options);
}

/**
 * Create a post with an image on a Facebook page.
 * @param {string} accessToken - Page access token.
 * @param {string} pageId
 * @param {string} message
 * @param {Buffer} imageBuffer
 * @param {string} mimeType - e.g. 'image/png', 'image/jpeg'
 * @param {object} [options]
 * @returns {Promise<{id: string, postId: string}>}
 */
function createPostWithImage(accessToken, pageId, message, imageBuffer, mimeType, options) {
  return post.createPostWithImage(accessToken, pageId, message, imageBuffer, mimeType, options);
}

/**
 * Delete a Facebook post.
 * @param {string} accessToken
 * @param {string} pageId
 * @param {string} postId
 * @returns {Promise<{deleted: boolean, postId: string}>}
 */
function deletePost(accessToken, pageId, postId) {
  return post.deletePost(accessToken, pageId, postId);
}

module.exports = {
  getAuthorizationUrl,
  getAccessToken,
  getLongLivedToken,
  getPageAccessToken,
  getUserInfo,
  createPost,
  createPostWithImage,
  deletePost,
  // Instagram
  postPhoto: instagram.postPhoto,
  postVideo: instagram.postVideo,
  postStoryPhoto: instagram.postStoryPhoto,
  postStoryVideo: instagram.postStoryVideo,
  postCarousel: instagram.postCarousel,
  getMediaStatus: instagram.getMediaStatus,
};
