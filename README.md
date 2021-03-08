# PaperShelf

<p align="center">
[![Version](https://img.shields.io/github/v/release/trungd/PaperShelf)](https://github.com/trungd/PaperShelf/releases)
[![Download](https://img.shields.io/github/downloads/trungd/PaperShelf/total)](https://github.com/trungd/PaperShelf/releases)
[![Issues](https://img.shields.io/github/issues/trungd/PaperShelf)](https://github.com/trungd/PaperShelf/issues)
[![Test](https://github.com/trungd/PaperShelf/actions/workflows/test.yml/badge.svg)](https://github.com/trungd/PaperShelf/actions/workflows/test.yml)
[![Publish](https://github.com/trungd/PaperShelf/actions/workflows/publish.yml/badge.svg)](https://github.com/trungd/PaperShelf/actions/workflows/publish.yml)
</p>

![Screenshot](./screenshot.png)

## Why [PaperShelf](trungd.github.io/papershelf/)?

As someone doing research, I usually get lost in a bunch of browser tabs or have to manually rename and organize PDF files in my Downloads folder. My bookmarks get messy over time, and sometimes I couldn't recall that paper I came across.

The goal of this project is to build a simple yet elegant tool to search, browse, and organize papers, so that you don't keep a long list of tabs and bookmarks in your browser. PaperShelf gathers data from different publicly available sources, so you always get the official, complete, and up-to-date version and information across different sites.

Some highlight features:

- Search, download, and gather paper information from ArXiv, Semantic Scholar, Google Scholar (experimental), and more sources coming.
- Add papers to your library and organize with _Tags_ and _Collections_.
- Render PDF files with readability. Crop margin for larger text size. Look up cited papers on mouse click, etc.

## Contributing

Feedback, feature requests, and contributions are welcome. Please add an issue with the appropriate tag. Next features may include:

- [ ] Enhance features for searching, organizing, and reading papers
- [ ] Sync with cloud services
- [ ] Build and share paper collections
- [ ] Popup for cross-references to figures and tables

To contribute, clone this repo and run following commands.

```
cd PaperShelf/desktop
yarn install
yarn start
```

The desktop app is developed with [Electron](https://electronjs.org/), [React](https://reactjs.org/), [FluentUI](https://fluentsite.z22.web.core.windows.net/).

## License

Licensed under the [MIT](./LICENSE.md) license.
