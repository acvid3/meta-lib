const ig = require('./instagram');

/**
 * Create an Instagram post (photo, video, carousel, story).
 * @param {string} accessToken - Instagram access token (IGAA...).
 * @param {string} igUserId - Instagram Business Account ID.
 * @param {object[]} items - Array of media items: [{ imageUrl }] or [{ videoUrl }].
 * @param {object} [options]
 * @param {string} [options.caption] - Post caption.
 * @param {'FEED'|'STORIES'} [options.mediaType='FEED'] - Post type.
 * @returns {Promise<{id: string}>}
 */
function igPost(accessToken, igUserId, items, options) {
  return ig.createPost(accessToken, igUserId, items, options);
}

/**
 * Edit Instagram profile (bio, website).
 * @param {string} accessToken
 * @param {string} igUserId
 * @param {object} updates - { biography?, website? }
 * @returns {Promise<{success: boolean}>}
 */
function igEditProfile(accessToken, igUserId, updates) {
  return ig.editProfile(accessToken, igUserId, updates);
}

/**
 * Get Instagram media status/info.
 * @param {string} accessToken
 * @param {string} mediaId
 * @returns {Promise<object>}
 */
function igGetMediaStatus(accessToken, mediaId) {
  return ig.getMediaStatus(accessToken, mediaId);
}

module.exports = {
  igPost,
  igEditProfile,
  igGetMediaStatus,
};
