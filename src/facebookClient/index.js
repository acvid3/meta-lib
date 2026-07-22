class FacebookClient {
    constructor(accessToken, pageId) {
        if (!accessToken) throw new Error('accessToken is required');
        this.accessToken = accessToken;
        this.pageId = pageId;
    }
}

module.exports = FacebookClient;
