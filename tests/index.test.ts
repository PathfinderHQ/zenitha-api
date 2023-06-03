import Server from '../src/server';

test('Server starts successfully', async () => {
    const server = await Server.start();
    expect(server.listening).toBe(true);
    await Server.stop();
    expect(server.listening).toBe(false);
});
