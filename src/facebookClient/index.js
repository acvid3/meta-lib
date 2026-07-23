const HttpClient = require('../utils/HttpClient');
const Publisher = require('./Publisher');

class FacebookClient {
    constructor(accessToken, pageId) {
        this.pageId = pageId;
        this.client = new HttpClient('https://graph.facebook.com/v25.0', accessToken);
        this.publisher = new Publisher(this.client);
    }

    async createFeed(items, options = {}) {
        const { message, link, scheduledPublishTime } = options;
        const body = { message: message || '' };
        if (link) body.link = link;

        if (scheduledPublishTime) {
            body.published = false;
            body.scheduled_publish_time = scheduledPublishTime;
        }

        if (Array.isArray(items) && items.length > 0) {
            const mediaIds = [];
            for (const item of items) {
                if (item.imageUrl) {
                    const photo = await this.client.post(`/${this.pageId}/photos`, {
                        url: item.imageUrl,
                        published: false,
                    });
                    mediaIds.push({ media_fbid: photo.id });
                }
            }
            if (mediaIds.length > 0) body.attached_media = mediaIds;
        }

        const data = await this.client.post(`/${this.pageId}/feed`, body);
        return { id: data.id };
    }

    async createPhoto(items, options = {}) {
        const item = Array.isArray(items) ? items[0] : items;
        const body = { caption: options.caption || '' };
        if (item?.imageUrl) body.url = item.imageUrl;
        if (options.scheduledPublishTime) {
            body.published = false;
            body.scheduled_publish_time = options.scheduledPublishTime;
        }

        const data = await this.client.post(`/${this.pageId}/photos`, body);
        return { id: data.id };
    }

    async createVideo(items, options = {}) {
        const item = Array.isArray(items) ? items[0] : items;
        const body = {
            description: options.caption || '',
            file_url: item?.videoUrl,
        };

        const data = await this.client.post(`/${this.pageId}/videos`, body);
        await this.publisher.waitForVideo(data.id);
        return { id: data.id };
    }

    async createReels(items, options = {}) {
        const item = Array.isArray(items) ? items[0] : items;
        const session = await this.client.post(`/${this.pageId}/video_reels`, {
            upload_phase: 'start',
        });

        await this._uploadVideo(session.upload_url, item?.videoUrl);

        await this.client.post(`/${this.pageId}/video_reels`, {
            video_id: session.video_id,
            upload_phase: 'finish',
            description: options.caption || '',
        });

        await this.publisher.waitForVideo(session.video_id);

        const publishBody = options.scheduledPublishTime
            ? { published: false, scheduled_publish_time: options.scheduledPublishTime }
            : { published: true };

        await this.client._request(
            `https://graph.facebook.com/v25.0/${session.video_id}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...publishBody, access_token: this.client.accessToken }),
            }
        );

        return { id: session.video_id };
    }

    async createStories(items, options = {}) {
        const item = Array.isArray(items) ? items[0] : items;

        if (item?.videoUrl) {
            const session = await this.client.post(`/${this.pageId}/video_stories`, {
                upload_phase: 'start',
            });
            await this._uploadVideo(session.upload_url, item.videoUrl);
            const result = await this.client.post(`/${this.pageId}/video_stories`, {
                video_id: session.video_id,
                upload_phase: 'finish',
            });
            return { id: result.post_id };
        }

        const photo = await this.client.post(`/${this.pageId}/photos`, {
            url: item?.imageUrl,
            published: false,
        });
        const story = await this.client.post(`/${this.pageId}/photo_stories`, {
            photo_id: photo.id,
        });
        return { id: story.post_id };
    }

    async _uploadVideo(uploadUrl, videoUrl) {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `OAuth ${this.client.accessToken}`,
                'file_url': videoUrl,
            },
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw Object.assign(
                new Error(data.debug_info?.message || 'Video upload failed'),
                { response: { status: response.status, data } }
            );
        }
    }

    async getPageInfo() {
        return this.client.get(`/${this.pageId}`, {
            fields: 'id,name,about,description,phone,emails,website,link',
        });
    }

    async updatePageInfo(fields = {}) {
        const data = await this.client.post(`/${this.pageId}`, fields);
        return { success: data.success };
    }

    async updatePagePicture(imageBuffer) {
        const boundary = '----' + Math.random().toString(36).slice(2);
        const body = Buffer.concat([
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="filedata"; filename="picture.png"\r\nContent-Type: image/png\r\n\r\n`),
            imageBuffer,
            Buffer.from(`\r\n--${boundary}--\r\n`),
        ]);

        const response = await fetch(
            `https://graph.facebook.com/v25.0/${this.pageId}/picture?access_token=${this.client.accessToken}`,
            {
                method: 'POST',
                headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
                body,
            }
        );
        const data = await response.json();
        return { success: data.success };
    }

    async updatePageCover(imageBuffer, offsetY = 50) {
        const boundary = '----' + Math.random().toString(36).slice(2);
        const body = Buffer.concat([
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="filedata"; filename="cover.png"\r\nContent-Type: image/png\r\n\r\n`),
            imageBuffer,
            Buffer.from(`\r\n--${boundary}--\r\n`),
        ]);

        const photoResponse = await fetch(
            `https://graph.facebook.com/v25.0/${this.pageId}/photos?published=false&access_token=${this.client.accessToken}`,
            {
                method: 'POST',
                headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
                body,
            }
        );
        const photoData = await photoResponse.json();
        if (!photoData.id) throw new Error('Photo upload failed: ' + JSON.stringify(photoData));

        const coverResponse = await fetch(
            `https://graph.facebook.com/v25.0/${this.pageId}?access_token=${this.client.accessToken}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cover: photoData.id, offset_y: offsetY }),
            }
        );
        const coverData = await coverResponse.json();
        return { success: coverData.success };
    }

    async getFeed(limit = 25) {
        return this.client.get(`/${this.pageId}/feed`, {
            fields: 'id,message,created_time,permalink_url',
            limit,
        });
    }

    async deletePost(postId) {
        const response = await fetch(
            `https://graph.facebook.com/v25.0/${postId}?access_token=${this.client.accessToken}`,
            { method: 'DELETE' }
        );
        const data = await response.json();
        if (!data.success) throw Object.assign(
            new Error(data.error?.message || 'Delete failed'),
            { response: { status: response.status, data } }
        );
        return { success: true };
    }

    async deleteAllFeed() {
        const feed = await this.getFeed(100);
        const ids = (feed.data || []).map(p => p.id);
        for (const id of ids) {
            await this.deletePost(id);
            await this.client._sleep(1000);
        }
        return { deleted: ids.length };
    }

    async getPostStatus(postId) {
        return this.client.get(`/${postId}`, {
            fields: 'id,message,permalink_url,created_time,status',
        });
    }
}

module.exports = FacebookClient;
