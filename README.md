# meta-lib

Instagram posting SDK. Publish photos, videos, carousels, and stories via Instagram Graph API.

## Install

```bash
npm i github:acvid3/meta-lib
```

## Setup

Create `.env`:

```env
INSTAGRAM_ACCESS_TOKEN=your_igaa_token
IG_USER_ID=your_instagram_business_account_id
```

## Getting IG_USER_ID

**With IGAA token (simplest):**

```http
GET https://graph.instagram.com/v21.0/me?fields=user_id,username
```

→ `{ "user_id": "17841480467485962" }` — это и есть IG_USER_ID.

**With Facebook token:**

1. `GET /me/accounts` → copy **Page ID**
2. `GET /{page-id}?fields=instagram_business_account` → copy **id** from `instagram_business_account`

## Usage

```js
const { igPost, igGetMediaStatus } = require('meta-lib');
```

### Single photo

```js
const post = await igPost(token, igUserId, [
  { imageUrl: 'https://example.com/photo.jpg' }
], { caption: 'My photo' });
```

### Single video (REELS)

```js
const post = await igPost(token, igUserId, [
  { videoUrl: 'https://example.com/video.mp4' }
], { caption: 'My reel' });
```

### Carousel (2-10 items)

```js
const post = await igPost(token, igUserId, [
  { imageUrl: 'https://.../img1.jpg' },
  { imageUrl: 'https://.../img2.jpg' },
  { videoUrl: 'https://.../video.mp4' },
], { caption: 'Carousel' });
```

### Story

```js
const story = await igPost(token, igUserId, [
  { imageUrl: 'https://.../story.jpg' }
], { mediaType: 'STORIES' });
```

### Get media status

```js
const info = await igGetMediaStatus(token, mediaId);
// { media_type, permalink, caption, media_url, timestamp }
```

## API

| Method | Description |
|---|---|
| `igPost(token, igUserId, items, options?)` | Post photo, video, carousel, or story |
| `igGetMediaStatus(token, mediaId)` | Get post info (permalink, type, etc.) |

`items` — array of `{ imageUrl }` or `{ videoUrl }`. Max 10 items for carousel.

`options.mediaType` — `'FEED'` (default) or `'STORIES'`.

## Images

Images must be publicly accessible URLs. The server uploads files to a free hosting before posting. Video format: MP4, H.264.
