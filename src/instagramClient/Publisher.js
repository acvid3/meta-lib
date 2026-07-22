class Publisher {
    constructor(httpClient, igUserId) {
        this.client = httpClient;
        this.igUserId = igUserId;
    }

    async _checkRateLimit() {
        try {
            const data = await this.client.get(`/${this.igUserId}/content_publishing_limit`, {
                fields: 'config,quota_usage',
            });
            const { config: { quota_total }, quota_usage } = data.data[0];
            console.log(`Rate limit: ${quota_total - quota_usage}/${quota_total} remaining`);
        } catch {
            // non-critical
        }
    }

    async publish(creationId) {
        await this._waitForContainer(creationId);

        for (let attempt = 0; attempt <= 3; attempt++) {
            if (attempt > 0) await this.client._sleep(3000);
            try {
                const data = await this.client.post(`/${this.igUserId}/media_publish`, {
                    creation_id: creationId,
                });
                await this._checkRateLimit();
                return data.id;
            } catch (error) {
                const code = error.response?.data?.error?.code;
                const msg = error.response?.data?.error?.error_user_msg
                    || error.response?.data?.error?.message
                    || error.message;
                const isMediaNotReady = code === 9007
                    || msg.includes('not available')
                    || msg.includes('not ready')
                    || msg.includes('Media ID');
                const isRateLimited = code === 4 || error.message === 'Rate limited';
                if (isMediaNotReady || isRateLimited) continue;
                throw error;
            }
        }
        throw new Error('Publish failed after retries');
    }

    async _waitForContainer(creationId) {
        for (let attempt = 0; attempt < 30; attempt++) {
            if (attempt > 0) await this.client._sleep(3000);
            const { status_code } = await this.client.get(`/${creationId}`, {
                fields: 'status_code',
            });
            if (status_code === 'FINISHED' || status_code === 'PUBLISHED') return;
            if (status_code === 'ERROR') throw new Error(`Container failed: ${JSON.stringify({ status_code })}`);
        }
        throw new Error('Container did not finish in time');
    }
}

module.exports = Publisher;
