const IG_API = 'https://graph.instagram.com/v21.0';

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

async function createMediaContainer(accessToken, igUserId, options) {
  const { imageUrl, videoUrl, caption, children } = options;

  const params = { access_token: accessToken };
  if (caption) params.caption = caption;

  if (children) {
    params.media_type = 'CAROUSEL';
    params.children = children.join(',');
  } else if (videoUrl) {
    params.media_type = 'REELS';
    params.video_url = videoUrl;
  } else {
    params.image_url = imageUrl;
  }

  return (await _request(`${IG_API}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })).id;
}

async function publishMedia(accessToken, igUserId, creationId, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(`${IG_API}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: creationId, access_token: accessToken }),
    });
    const data = await res.json();
    if (res.ok && !data.error) return data.id;
    if (data.error?.code === 9007 && i < maxRetries - 1) {
      // Media not ready yet, wait and retry
      await _sleep(3000);
      continue;
    }
    throw Object.assign(new Error(data.error?.message || 'Publish failed'), { response: { status: res.status, data } });
  }
}

async function postPhoto(accessToken, igUserId, imageUrl, caption) {
  const creationId = await createMediaContainer(accessToken, igUserId, { imageUrl, caption });
  const mediaId = await publishMedia(accessToken, igUserId, creationId);
  return { id: mediaId };
}

async function postVideo(accessToken, igUserId, videoUrl, caption) {
  const creationId = await createMediaContainer(accessToken, igUserId, { videoUrl, caption });
  const mediaId = await publishMedia(accessToken, igUserId, creationId);
  return { id: mediaId };
}

async function postCarousel(accessToken, igUserId, childrenIds, caption) {
  const creationId = await createMediaContainer(accessToken, igUserId, { children: childrenIds, caption });
  const mediaId = await publishMedia(accessToken, igUserId, creationId);
  return { id: mediaId };
}

async function getMediaStatus(accessToken, mediaId) {
  return _request(`${IG_API}/${mediaId}?fields=id,media_type,media_url,permalink,caption,timestamp&access_token=${accessToken}`);
}

module.exports = {
  postPhoto,
  postVideo,
  postCarousel,
  getMediaStatus,
  createMediaContainer,
  publishMedia,
};
