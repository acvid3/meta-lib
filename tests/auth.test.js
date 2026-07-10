const auth = require('../src/auth');

const OLD_ENV = process.env;

function mockFetchResponse(data, { ok = true, status = 200 } = {}) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data.error ? { ...data } : data),
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  process.env = { ...OLD_ENV };
  process.env.META_CLIENT_ID = 'test_client_id';
  process.env.META_CLIENT_SECRET = 'test_client_secret';
  global.fetch = jest.fn();
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe('getAuthorizationUrl', () => {
  it('builds correct authorization URL', () => {
    const url = auth.getAuthorizationUrl('https://example.com/callback', 'pages_manage_posts', 'abc123');
    expect(url).toContain('https://www.facebook.com/v19.0/dialog/oauth');
    expect(url).toContain('client_id=test_client_id');
    expect(url).toContain('redirect_uri=https%3A%2F%2Fexample.com%2Fcallback');
    expect(url).toContain('scope=pages_manage_posts');
    expect(url).toContain('state=abc123');
  });

  it('throws when META_CLIENT_ID is missing', () => {
    process.env.META_CLIENT_ID = '';
    expect(() => auth.getAuthorizationUrl('uri')).toThrow('META_CLIENT_ID');
  });
});

describe('getAccessToken', () => {
  it('exchanges code for token', async () => {
    const fake = { access_token: 'token123', expires_in: 3600 };
    global.fetch.mockResolvedValue(mockFetchResponse(fake));

    const result = await auth.getAccessToken('code', 'uri');

    expect(global.fetch.mock.calls[0][0]).toContain('graph.facebook.com');
    expect(result).toEqual(fake);
  });

  it('throws on API error', async () => {
    global.fetch.mockResolvedValue(mockFetchResponse({ error: { message: 'Invalid code' } }, { ok: false, status: 400 }));

    await expect(auth.getAccessToken('bad', 'uri')).rejects.toThrow('Invalid code');
  });
});

describe('getLongLivedToken', () => {
  it('exchanges short token for long-lived', async () => {
    const fake = { access_token: 'long_token', expires_in: 5184000 };
    global.fetch.mockResolvedValue(mockFetchResponse(fake));

    const result = await auth.getLongLivedToken('short_token');
    expect(result.access_token).toBe('long_token');
  });
});

describe('getPageAccessToken', () => {
  it('fetches page access token', async () => {
    global.fetch.mockResolvedValue(mockFetchResponse({ access_token: 'page_token', id: '123', name: 'Page' }));

    const result = await auth.getPageAccessToken('user_token', '123');
    expect(result).toBe('page_token');
  });
});

describe('getUserInfo', () => {
  it('fetches user info', async () => {
    const fake = { id: '123', name: 'Test User' };
    global.fetch.mockResolvedValue(mockFetchResponse(fake));

    const result = await auth.getUserInfo('token');
    expect(result).toEqual(fake);
  });
});
