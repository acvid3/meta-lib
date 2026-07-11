const IG_API = 'https://graph.instagram.com/v21.0';
const _POLL = 5000;
const _MAX_RETRIES = 36;

function _sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function _request(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Request failed'), { response: { status: res.status, data } });
  }
  return data;
}

async function _createContainer(accessToken, igUserId, params) {
  return (await _request(`${IG_API}/${igUserId}/media`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })).id;
}

async function _waitForContainer(accessToken, containerId) {
  for (let i = 0; i < _MAX_RETRIES; i++) {
    const res = await fetch(`${IG_API}/${containerId}?fields=status_code&access_token=${accessToken}`);
    const data = await res.json();
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') throw new Error('Container processing failed');
    await _sleep(_POLL);
  }
  throw new Error('Container processing timed out');
}

async function _publish(accessToken, igUserId, creationId) {
  await _waitForContainer(accessToken, creationId);
  return (await _request(`${IG_API}/${igUserId}/media_publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: creationId, access_token: accessToken }),
  })).id;
}

async function createPost(accessToken, igUserId, items, options = {}) {
  const { caption, mediaType } = options;
  const isFeed = !mediaType || mediaType === 'FEED';
  const type = mediaType || 'FEED';

  if (!Array.isArray(items)) items = [items];

  if (type === 'STORIES') {
    const item = items[0];
    const media = await _createContainer(accessToken, igUserId, {
      media_type: 'STORIES',
      image_url: item.imageUrl,
      video_url: item.videoUrl,
      access_token: accessToken,
    });
    const id = await _publish(accessToken, igUserId, media);
    return { id };
  }

  if (items.length === 1) {
    const item = items[0];
    const params = { access_token: accessToken, caption: caption || '' };
    if (item.videoUrl) {
      params.media_type = 'REELS';
      params.video_url = item.videoUrl;
    } else {
      params.image_url = item.imageUrl;
    }
    const media = await _createContainer(accessToken, igUserId, params);
    const id = await _publish(accessToken, igUserId, media);
    return { id };
  }

  // Carousel (2+ items)
  const childIds = await Promise.all(items.map(item => {
    const p = { is_carousel_item: true, access_token: accessToken };
    if (item.videoUrl) {
      p.media_type = 'VIDEO';
      p.video_url = item.videoUrl;
    } else {
      p.image_url = item.imageUrl;
    }
    return _createContainer(accessToken, igUserId, p);
  }));
  await Promise.all(childIds.map(id => _waitForContainer(accessToken, id)));
  const carousel = await _createContainer(accessToken, igUserId, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption: caption || '',
    access_token: accessToken,
  });
  const id = await _publish(accessToken, igUserId, carousel);
  return { id };
}

async function editProfile(accessToken, igUserId, updates) {
  const params = { access_token: accessToken };
  if (updates.biography !== undefined) params.biography = updates.biography;
  if (updates.website !== undefined) params.website = updates.website;
  await _request(`${IG_API}/${igUserId}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return { success: true };
}

async function getMediaStatus(accessToken, mediaId) {
  return _request(`${IG_API}/${mediaId}?fields=id,media_type,media_url,permalink,caption,timestamp&access_token=${accessToken}`);
}

module.exports = {
  createPost,
  editProfile,
  getMediaStatus,
};
