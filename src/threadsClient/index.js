class ThreadsClient {
    constructor(accessToken, threadsUserId) {
        if (!accessToken) throw new Error('accessToken is required');
        this.accessToken = accessToken;
        this.threadsUserId = threadsUserId;
    }
}

module.exports = ThreadsClient;