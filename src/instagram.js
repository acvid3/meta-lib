const GRAPH_API = 'https://graph.facebook.com/v19.0';

async function createMediaContainer(accessToken, igUserId, options) {
  const { imageUrl, videoUrl, caption, mediaType, children } = options;

  const params = { access_token: accessToken };
  if (caption) params.caption = caption;

  if (children) {
    params.media_type = 'CAROUSEL';
    params.children = children.join(',');
  } else if (videoUrl) {
    params.media_type = 'VIDEO';
    params.video_url = videoUrl;
  } else {
    params.image_url = imageUrl;
  }

  const res = await fetch(`${GRAPH_API}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Create media container failed'), { response: { status: res.status, data } });
  }

  return data.id;
}

async function publishMedia(accessToken, igUserId, creationId) {
  const res = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
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
  const creationId = await createMediaContainer(accessToken, igUserId, { videoUrl, caption, mediaType: 'VIDEO' });
  const mediaId = await publishMedia(accessToken, igUserId, creationId);
  return { id: mediaId };
}

async function postCarousel(accessToken, igUserId, childrenIds, caption) {
  const creationId = await createMediaContainer(accessToken, igUserId, { children: childrenIds, caption });
  const mediaId = await publishMedia(accessToken, igUserId, creationId);
  return { id: mediaId };
}

async function getMediaStatus(accessToken, mediaId) {
  const res = await fetch(`${GRAPH_API}/${mediaId}?fields=id,media_type,media_url,permalink,caption,timestamp&access_token=${accessToken}`);
  const data = await res.json();
  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Fetch failed'), { response: { status: res.status, data } });
  }
  return data;
}

module.exports = {
  postPhoto,
  postVideo,
  postCarousel,
  getMediaStatus,
  createMediaContainer,
  publishMedia,
};
