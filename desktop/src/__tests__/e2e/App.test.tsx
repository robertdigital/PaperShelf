import { Application } from 'spectron';

describe.skip('App', () => {
  let app: Application;

  beforeAll(() => {
    switch (process.platform) {
      case 'darwin':
        app = new Application({
          path: 'release/mac/PaperShelf.app/Contents/MacOS/PaperShelf',
        });
        break;
      case 'win32':
        app = new Application({
          path: 'release/win/PaperShelf.exe',
        });
        break;
      case 'linux':
        app = new Application({
          path: 'release/linux/paper-shelf',
        });
        break;
      default:
        return null;
    }

    return app.start();
  });

  it('should start', async () => {
    const isVisible = app.browserWindow.isVisible();
    expect(isVisible).toBeTruthy();

    const title = await app.client.getTitle();
    expect(title).toEqual('PaperShelf');

    return true;
  });

  afterAll(() => {
    if (app && app.isRunning()) {
      // return app.stop();
    }
    return true;
  });
});
