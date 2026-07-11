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

## Getting Token & IG_USER_ID

![Instagram Business API Setup](docs/images/instagram-business-setup.png)

1. Open https://developers.facebook.com/apps/{YOUR_APP_ID}/instagram-business/API-Setup/
2. Click **Generate token** and select required permissions (`instagram_basic`, `instagram_content_publish`)
3. Copy the generated token → it's your `INSTAGRAM_ACCESS_TOKEN`
4. In the same page you'll see `Instagram Account ID` → that's your `IG_USER_ID` (e.g. `17841480467485962`)

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
