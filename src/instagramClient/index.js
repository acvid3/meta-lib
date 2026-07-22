const HttpClient = require('../utils/HttpClient');
const Publisher = require('./Publisher');

class InstagramClient {
    constructor(accessToken, igUserId) {
        this.igUserId = igUserId;
        this.client = new HttpClient('https://graph.instagram.com/v25.0', accessToken);
        this.publisher = new Publisher(this.client, igUserId);
    }

    async createFeed(items, options = {}) {
        const { caption } = options;
        if (!Array.isArray(items)) items = [items];

        if (items.length === 1) {
            return this._publishSingleItem(items[0], caption);
        }

        return this._publishCarousel(items, caption);
    }

    async createStories(items, options = {}) {
        if (!Array.isArray(items)) items = [items];
        const item = items[0];

        const media = await this.client.post(`/${this.igUserId}/media`, {
            media_type: 'STORIES',
            image_url: item.imageUrl,
            video_url: item.videoUrl,
            caption: options.caption || '',
        });
        const id = await this.publisher.publish(media.id);
        return { id };
    }

    async createReels(items, options = {}) {
        if (!Array.isArray(items)) items = [items];
        const item = items[0];

        const media = await this.client.post(`/${this.igUserId}/media`, {
            media_type: 'REELS',
            video_url: item.videoUrl,
            caption: options.caption || '',
        });
        const id = await this.publisher.publish(media.id);
        return { id };
    }

    async getMediaStatus(mediaId) {
        return this.client.get(`/${mediaId}`, {
            fields: 'id,media_type,media_url,permalink,caption,timestamp',
        });
    }

    async _publishSingleItem(item, caption) {
        const params = { caption: caption || '' };
        if (item.videoUrl) {
            params.media_type = 'REELS';
            params.video_url = item.videoUrl;
        } else {
            params.image_url = item.imageUrl;
        }
        const media = await this.client.post(`/${this.igUserId}/media`, params);
        const id = await this.publisher.publish(media.id);
        return { id };
    }

    async _publishCarousel(items, caption) {
        const childIds = [];
        for (const item of items) {
            const params = { is_carousel_item: true };
            if (item.videoUrl) {
                params.media_type = 'VIDEO';
                params.video_url = item.videoUrl;
            } else {
                params.image_url = item.imageUrl;
            }
            const container = await this.client.post(`/${this.igUserId}/media`, params);
            childIds.push(container.id);
        }

        for (const childId of childIds) {
            await this.publisher._waitForContainer(childId);
        }

        const carousel = await this.client.post(`/${this.igUserId}/media`, {
            media_type: 'CAROUSEL',
            children: childIds.join(','),
            caption: caption || '',
        });
        const id = await this.publisher.publish(carousel.id);
        return { id };
    }
}

module.exports = InstagramClient;
