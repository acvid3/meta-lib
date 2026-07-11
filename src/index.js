const auth = require('./auth');
const post = require('./post');
const ig = require('./instagram');

function getAuthorizationUrl(redirectUri, scope = 'pages_manage_posts,pages_read_engagement', state = '') {
  return auth.getAuthorizationUrl(redirectUri, scope, state);
}

function getAccessToken(code, redirectUri) {
  return auth.getAccessToken(code, redirectUri);
}

function getLongLivedToken(shortLivedToken) {
  return auth.getLongLivedToken(shortLivedToken);
}

function getPageAccessToken(userAccessToken, pageId) {
  return auth.getPageAccessToken(userAccessToken, pageId);
}

function getUserInfo(accessToken) {
  return auth.getUserInfo(accessToken);
}

function getInstagramBusinessAccount(accessToken, pageId) {
  return auth.getInstagramBusinessAccount(accessToken, pageId);
}

function createPost(accessToken, pageId, message, options) {
  return post.createPost(accessToken, pageId, message, options);
}

function createPostWithImage(accessToken, pageId, message, imageBuffer, mimeType, options) {
  return post.createPostWithImage(accessToken, pageId, message, imageBuffer, mimeType, options);
}

function deletePost(accessToken, pageId, postId) {
  return post.deletePost(accessToken, pageId, postId);
}

module.exports = {
  getAuthorizationUrl,
  getAccessToken,
  getLongLivedToken,
  getPageAccessToken,
  getUserInfo,
  getInstagramBusinessAccount,
  createPost,
  createPostWithImage,
  deletePost,
  // Instagram
  igPost: ig.createPost,
  igEditProfile: ig.editProfile,
  igGetMediaStatus: ig.getMediaStatus,
};
