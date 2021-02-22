[![Test](https://github.com/trungd/PaperShelf/actions/workflows/test.yml/badge.svg)](https://github.com/trungd/PaperShelf/actions/workflows/test.yml)
[![Publish](https://github.com/trungd/PaperShelf/actions/workflows/publish.yml/badge.svg)](https://github.com/trungd/PaperShelf/actions/workflows/publish.yml)

## Why PaperShelf?

As someone who does research, I usually get lost in a bunch of browser tabs or have to manually rename and organize PDF files in my Downloads folder. My bookmarks get messy over time, and sometimes I couldn't recall a paper that I came across.

The goal of this project is to develop a simple yet elegant tool to search, browse, and organize papers, so that you don't keep a long list of tabs and bookmarks in your browser. PaperShelf gathers data from different publicly available sources (e.g. arxiv) so you always get the official, complete, and up-to-date version and information across different sites.

Some highlight features:

- Search for papers on arxiv (more sources coming).
- Download papers and index with metadata and auto-generated tags.
- Add papers to your library and organize with _Tags_ and _Collections_. Auto-generated tags may look like `year:2015`, `venue:icml`, `computer-vision`, etc. Collections work in the same way as organizing papers into folders.
- Render PDF files with readability.

## Usage

The latest version for different platforms is available on the [Releases](https://github.com/trungd/PaperShelf/releases) page.

## Contributing

Ideas and contributions are welcome. Please add an issue with `feature-request` tag or contact me directly. Future features may include:

- [ ] Auto crop margin for larger text size
- [ ] Sync with cloud services
- [ ] Extract paper's outline & citations from pdf content (could take time, but cool!)
- [ ] Feed for newly published and hot papers.

To contribute, clone this repo and run following commands.

```
cd PaperShelf/desktop
yarn install
yarn start
```

The desktop app is developed with [Electron](https://electronjs.org/), [React](https://reactjs.org/), [FluentUI](https://fluentsite.z22.web.core.windows.net/).

## License

Licensed under the [MIT](./LICENSE.md) license.
