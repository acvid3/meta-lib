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
  const { imageUrl, videoUrl, caption, children, mediaType } = options;

  const params = { access_token: accessToken };
  if (caption) params.caption = caption;

  if (mediaType) {
    params.media_type = mediaType;
    if (imageUrl) params.image_url = imageUrl;
    if (videoUrl) params.video_url = videoUrl;
  } else if (children) {
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

async function publishMedia(accessToken, igUserId, creationId) {
  await waitForContainer(accessToken, creationId);

  // Publish
  const res = await fetch(`${IG_API}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: creationId, access_token: accessToken }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Publish failed'), { response: { status: res.status, data } });
  }
  return data.id;
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

async function waitForContainer(accessToken, containerId, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(`${IG_API}/${containerId}?fields=status_code&access_token=${accessToken}`);
    const data = await res.json();
    if (data.status_code === 'FINISHED') return;
    if (data.status_code === 'ERROR') throw new Error('Container processing failed');
    await _sleep(2000);
  }
  throw new Error('Container processing timed out');
}

async function postCarousel(accessToken, igUserId, childrenIds, caption) {
  await Promise.all(childrenIds.map(id => waitForContainer(accessToken, id)));
  const creationId = await createMediaContainer(accessToken, igUserId, { children: childrenIds, caption });
  const mediaId = await publishMedia(accessToken, igUserId, creationId);
  return { id: mediaId };
}

async function postStoryPhoto(accessToken, igUserId, imageUrl) {
  const creationId = await createMediaContainer(accessToken, igUserId, { imageUrl, mediaType: 'STORIES' });
  const mediaId = await publishMedia(accessToken, igUserId, creationId);
  return { id: mediaId };
}

async function postStoryVideo(accessToken, igUserId, videoUrl) {
  const creationId = await createMediaContainer(accessToken, igUserId, { videoUrl, mediaType: 'STORIES' });
  const mediaId = await publishMedia(accessToken, igUserId, creationId);
  return { id: mediaId };
}

async function getMediaStatus(accessToken, mediaId) {
  return _request(`${IG_API}/${mediaId}?fields=id,media_type,media_url,permalink,caption,timestamp&access_token=${accessToken}`);
}

module.exports = {
  postPhoto,
  postVideo,
  postStoryPhoto,
  postStoryVideo,
  postCarousel,
  getMediaStatus,
  createMediaContainer,
  publishMedia,
};
