# meta-lib

Meta SDK for Instagram and Facebook Content Publishing API.

## Install

```bash
npm i github:acvid3/meta-lib
```

## InstagramClient

Publish photos, videos, reels, carousels, and stories via Instagram Graph API.

### Setup

```env
INSTAGRAM_ACCESS_TOKEN=your_token
IG_USER_ID=your_instagram_business_account_id
```

### Usage

```js
const { InstagramClient } = require('meta-lib');
const client = new InstagramClient(process.env.INSTAGRAM_ACCESS_TOKEN, process.env.IG_USER_ID);
```

#### Single photo

```js
const post = await client.createFeed(
  [{ imageUrl: 'https://example.com/photo.jpg' }],
  { caption: 'My photo' }
);
```

#### Single video (REELS)

```js
const post = await client.createFeed(
  [{ videoUrl: 'https://example.com/video.mp4' }],
  { caption: 'My reel' }
);
```

#### Carousel (2-10 items)

```js
const post = await client.createFeed([
  { imageUrl: 'https://.../img1.jpg' },
  { imageUrl: 'https://.../img2.jpg' },
  { videoUrl: 'https://.../video.mp4' },
], { caption: 'My carousel' });
```

#### Reels

```js
const post = await client.createReels(
  [{ videoUrl: 'https://example.com/reel.mp4' }],
  { caption: 'My reel' }
);
```

#### Story (image)

```js
const post = await client.createStories(
  [{ imageUrl: 'https://example.com/story.jpg' }]
);
```

#### Get media status

```js
const info = await client.getMediaStatus(mediaId);
// { media_type, permalink, caption, media_url, timestamp }
```

### API

| Method | Description |
|---|---|
| `createFeed(items, options?)` | Post photo, video, or carousel (up to 10 items) |
| `createReels(items, options?)` | Post a reel |
| `createStories(items, options?)` | Post a story (image only) |
| `getMediaStatus(mediaId)` | Get post info |

## FacebookClient

Publish feed posts, photos, videos, and stories on a Facebook Page.

### Setup

```env
FB_PAGE_ACCESS_TOKEN=your_page_token
FB_PAGE_ID=your_page_id
```

### Usage

```js
const { FacebookClient } = require('meta-lib');
const client = new FacebookClient(process.env.FB_PAGE_ACCESS_TOKEN, process.env.FB_PAGE_ID);
```

#### Feed post

```js
const post = await client.createFeed(
  [],
  { message: 'Hello world!' }
);
```

#### Photo

```js
const post = await client.createPhoto(
  [{ imageUrl: 'https://example.com/photo.jpg' }],
  { caption: 'My photo' }
);
```

#### Video

```js
const post = await client.createVideo(
  [{ videoUrl: 'https://example.com/video.mp4' }],
  { caption: 'My video' }
);
```

#### Reels

```js
const post = await client.createReels(
  [{ videoUrl: 'https://example.com/reel.mp4' }],
  { caption: 'My reel' }
);
```

#### Story (photo)

```js
const post = await client.createStories(
  [{ imageUrl: 'https://example.com/story.jpg' }]
);
```

#### Story (video)

```js
const post = await client.createStories(
  [{ videoUrl: 'https://example.com/video.mp4' }]
);
```

#### Get feed / Delete

```js
const feed = await client.getFeed(10);
const r = await client.deletePost(postId);
const stats = await client.deleteAllFeed(); // delete all feed posts
```

#### Get post status

```js
const info = await client.getPostStatus(postId);
```

### API

| Method | Description |
|---|---|
| `createFeed(items, options?)` | Post to page feed with optional attached media |
| `createPhoto(items, options?)` | Post a photo |
| `createVideo(items, options?)` | Post a video (waits for processing) |
| `createReels(items, options?)` | Post a reel (3-step resumable upload) |
| `createStories(items, options?)` | Post a photo or video story |
| `getFeed(limit?)` | Get recent feed posts |
| `deletePost(postId)` | Delete a post/video/story |
| `deleteAllFeed()` | Delete all feed posts |
| `getPostStatus(postId)` | Get post details |
| `getPageInfo()` | Get page name, about, description |
| `updatePageInfo(fields)` | Update about, description, website, phone |
| `updatePagePicture(imageBuffer)` | Change profile picture (PNG buffer) |
| `updatePageCover(imageBuffer, offsetY?)` | Change cover photo (PNG buffer) |

## ThreadsClient

Post text, images, and videos to Threads via Threads API (container-based, like Instagram).

### Setup

```env
THREADS_ACCESS_TOKEN=your_token
THREADS_USER_ID=your_threads_user_id
```

### Usage

```js
const { ThreadsClient } = require('meta-lib');
const client = new ThreadsClient(process.env.THREADS_ACCESS_TOKEN, process.env.THREADS_USER_ID);
```

#### Text post

```js
const post = await client.createFeed([], { caption: 'Hello Threads!' });
```

#### Photo post

```js
const post = await client.createFeed(
  [{ imageUrl: 'https://example.com/photo.jpg' }],
  { caption: 'My photo' }
);
```

#### Video post

```js
const post = await client.createFeed(
  [{ videoUrl: 'https://example.com/video.mp4' }],
  { caption: 'My video' }
);
```

#### Get thread status

```js
const info = await client.getThreadStatus(threadId);
```

### API

| Method | Description |
|---|---|
| `createFeed(items, options?)` | Post text, image, or video (container → publish) |
| `getThreadStatus(threadId)` | Get thread details (id, text, media_type, permalink) |

## Media requirements

Images must be publicly accessible URLs. Video format: MP4, H.264.

Facebook Stories video: 9:16, ≥540×960, 3–90s, H.264 + AAC.
