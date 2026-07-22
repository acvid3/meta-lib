class HttpClient {
    constructor(baseUrl, accessToken) {
        this.baseUrl = baseUrl;
        this.accessToken = accessToken;
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async get(path, params = {}) {
        const query = new URLSearchParams({ access_token: this.accessToken, ...params }).toString();
        return this._request(`${this.baseUrl}${path}?${query}`);
    }

    async post(path, body = {}) {
        return this._request(`${this.baseUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, access_token: this.accessToken }),
        });
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
        if (data.error?.code === 4 && data.error?.is_transient) {
            throw Object.assign(new Error('Rate limited'), { response: { status: response.status, data } });
        }
        throw Object.assign(
            new Error(data.error?.message || 'Request failed'),
            { response: { status: response.status, data } }
        );
    }
}

module.exports = HttpClient;
