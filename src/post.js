const GRAPH_API = 'https://graph.facebook.com/v19.0';

async function createPost(accessToken, pageId, message, options = {}) {
  const { link, published = true } = options;

  const params = new URLSearchParams({
    message,
    access_token: accessToken,
    published: String(published),
  });

  if (link) params.append('link', link);

  const res = await fetch(`${GRAPH_API}/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Post failed'), { response: { status: res.status, data } });
  }

  return { id: data.id, postId: data.id };
}

async function createPostWithImage(accessToken, pageId, message, imageBuffer, mimeType, options = {}) {
  const { published = true } = options;

  const boundary = '----' + Math.random().toString(36).slice(2);
  const chunks = [];

  chunks.push(Buffer.from(`--${boundary}\r\n`));
  chunks.push(Buffer.from(`Content-Disposition: form-data; name="access_token"\r\n\r\n${accessToken}\r\n`));
  chunks.push(Buffer.from(`--${boundary}\r\n`));
  chunks.push(Buffer.from(`Content-Disposition: form-data; name="message"\r\n\r\n${message}\r\n`));
  chunks.push(Buffer.from(`--${boundary}\r\n`));
  chunks.push(Buffer.from(`Content-Disposition: form-data; name="published"\r\n\r\n${published}\r\n`));
  chunks.push(Buffer.from(`--${boundary}\r\n`));
  chunks.push(Buffer.from(`Content-Disposition: form-data; name="source"; filename="image.${mimeType.split('/')[1] || 'png'}"\r\nContent-Type: ${mimeType}\r\n\r\n`));
  chunks.push(imageBuffer);
  chunks.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  const body = Buffer.concat(chunks);

  const res = await fetch(`${GRAPH_API}/${pageId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Post with image failed'), { response: { status: res.status, data } });
  }

  return { id: data.id, postId: data.id };
}

async function deletePost(accessToken, pageId, postId) {
  const res = await fetch(`${GRAPH_API}/${postId}?access_token=${accessToken}`, {
    method: 'DELETE',
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw Object.assign(new Error(data.error?.message || 'Delete failed'), { response: { status: res.status, data } });
  }

  return { deleted: true, postId };
}

module.exports = {
  createPost,
  createPostWithImage,
  deletePost,
};
