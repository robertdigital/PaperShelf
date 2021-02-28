import { Application } from 'spectron';

describe('App', () => {
  it('should start', async () => {
    const app = new Application({
      path: 'release/mac/PaperShelf.app/Contents/MacOS/PaperShelf',
    });
    await app.start();

    const isVisible = app.browserWindow.isVisible();
    expect(isVisible).toBeTruthy();

    // const title = await app.client.getTitle();
    // expect(title).toEqual('My App');

    await app.stop();
    return true;
  });
});
