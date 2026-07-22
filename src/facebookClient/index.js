const HttpClient = require('../utils/HttpClient');

class FacebookClient {
    constructor(accessToken, pageId) {
        this.pageId = pageId;
        this.client = new HttpClient('https://graph.facebook.com/v25.0', accessToken);
    }

    async createFeed(items, options = {}) {
        const { message, link } = options;
        const body = { message: message || '' };
        if (link) body.link = link;

        if (Array.isArray(items) && items.length > 0) {
            const urls = [];
            for (const item of items) {
                if (item.imageUrl) {
                    const photo = await this.client.post(`/${this.pageId}/photos`, {
                        url: item.imageUrl,
                        published: false,
                    });
                    urls.push(photo.id);
                }
            }
            if (urls.length > 0) {
                body.attached_media = urls.map(id => ({ media_fbid: id }));
            }
        }

        const data = await this.client.post(`/${this.pageId}/feed`, body);
        return { id: data.id };
    }

    async createPhoto(items, options = {}) {
        const item = Array.isArray(items) ? items[0] : items;
        const body = { caption: options.caption || '' };
        if (item?.imageUrl) body.url = item.imageUrl;

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
        return { id: data.id };
    }

    async createStories(items, options = {}) {
        const item = Array.isArray(items) ? items[0] : items;

        if (item?.videoUrl) {
            const video = await this.client.post(`/${this.pageId}/videos`, {
                file_url: item.videoUrl,
                published: false,
            });
            const data = await this.client.post(`/${this.pageId}/stories`, {
                video_id: video.id,
            });
            return { id: data.id };
        }

        const photo = await this.client.post(`/${this.pageId}/photos`, {
            url: item?.imageUrl,
            published: false,
        });
        const data = await this.client.post(`/${this.pageId}/stories`, {
            image_id: photo.id,
        });
        return { id: data.id };
    }

    async getPostStatus(postId) {
        return this.client.get(`/${postId}`, {
            fields: 'id,message,permalink_url,created_time,status',
        });
    }
}

module.exports = FacebookClient;
