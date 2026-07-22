const { InstagramClient, FacebookClient, ThreadsClient } = require('../src/index.js');

describe('InstagramClient', () => {
  it('exports InstagramClient', () => {
    expect(InstagramClient).toBeDefined();
  });

  it('creates instance with igUserId', () => {
    const client = new InstagramClient('my-token', 'my-user');
    expect(client.igUserId).toBe('my-user');
  });

  it('has createFeed, createStories, createReels', () => {
    const client = new InstagramClient('my-token', 'my-user');
    expect(typeof client.createFeed).toBe('function');
    expect(typeof client.createStories).toBe('function');
    expect(typeof client.createReels).toBe('function');
  });
});
