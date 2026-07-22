class Publisher {
    constructor(client) {
        this.client = client;
    }

    async waitForVideo(videoId) {
        for (let attempt = 0; attempt < 30; attempt++) {
            if (attempt > 0) await this.client._sleep(3000);
            const data = await this.client.get(`/${videoId}`, {
                fields: 'status',
            });
            const status = data.status?.video_status || data.status;
            if (status === 'ready') return;
            if (status === 'error') throw new Error(`Video failed: ${JSON.stringify({ video_status: status })}`);
        }
        throw new Error('Video did not finish processing in time');
    }
}

module.exports = Publisher;
