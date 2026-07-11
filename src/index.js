const ig = require('./instagram');

function igPost(accessToken, igUserId, items, options) {
  return ig.createPost(accessToken, igUserId, items, options);
}

function igGetMediaStatus(accessToken, mediaId) {
  return ig.getMediaStatus(accessToken, mediaId);
}

module.exports = {
  igPost,
  igGetMediaStatus,
};
