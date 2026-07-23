class ThreadsClient {
    constructor(accessToken, threadsUserId) {
        if (!accessToken) throw new Error('accessToken is required');
        this.accessToken = accessToken;
        this.threadsUserId = threadsUserId;
        this.baseUrl = 'https://threads.net/v1.0';
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async _request(url, options) {
        let response;
        let data;
        try {
            response = await fetch(url, options);
            data = await response.json();
            if (response.ok && !data.error) return data;
        } catch (error) {
            throw new Error('Request failed: ' + error.message);
        }
        throw Object.assign(
            new Error(data.error?.message || 'Request failed'),
            { response: { status: response.status, data } }
        );
    }

    async _createContainer(body) {
        const data = await this._request(
            `${this.baseUrl}/${this.threadsUserId}/threads?access_token=${this.accessToken}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }
        );
        return data.id;
    }

    async _publish(creationId) {
        const data = await this._request(
            `${this.baseUrl}/${this.threadsUserId}/threads_publish?access_token=${this.accessToken}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creation_id: creationId }),
            }
        );
        return data.id;
    }

    async _waitForContainer(containerId) {
        for (let attempt = 0; attempt < 30; attempt++) {
            if (attempt > 0) await this._sleep(3000);
            const data = await this._request(
                `${this.baseUrl}/${containerId}?fields=status&access_token=${this.accessToken}`
            );
            if (data.status === 'FINISHED' || data.status === 'PUBLISHED') return;
            if (data.status === 'ERROR') throw new Error(`Container failed`);
        }
        throw new Error('Container did not finish in time');
    }

    async createFeed(items, options = {}) {
        if (!Array.isArray(items)) items = [items];
        const item = items[0];

        if (item?.videoUrl) {
            const containerId = await this._createContainer({
                media_type: 'VIDEO',
                video_url: item.videoUrl,
                text: options.caption || '',
            });
            await this._waitForContainer(containerId);
            const id = await this._publish(containerId);
            return { id };
        }

        if (item?.imageUrl) {
            const containerId = await this._createContainer({
                media_type: 'IMAGE',
                image_url: item.imageUrl,
                text: options.caption || '',
            });
            const id = await this._publish(containerId);
            return { id };
        }

        const containerId = await this._createContainer({
            media_type: 'TEXT',
            text: options.caption || '',
        });
        const id = await this._publish(containerId);
        return { id };
    }

    async getThreadStatus(threadId) {
        return this._request(
            `${this.baseUrl}/${threadId}?fields=id,text,media_type,media_url,permalink,timestamp&access_token=${this.accessToken}`
        );
    }
}

module.exports = ThreadsClient;
