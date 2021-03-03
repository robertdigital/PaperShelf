## Preferences

Preferences for the app can be modified by editing `config.yaml`. This file can be quickly accessed by choosing PaperShlef > Preferences > General (Mac OS) or Files > Preferences > General (other platforms). Available fields are listed below.

- `paperLocation`: Local path to save downloaded papers
- `autoDownload` (not supported): Automatically download paper when added to Library
- `paperList`:
  - `headerFormat`: Text to show for the header in the paper list. Default: `{title}`
  - `contentFormat`: Text to show for the content in the paper list. Default: `{authorShort} ({venueAndYear})`
  - `expandedHeaderFormat`: Text to show for the header in the paper list when expanded. Default: `{title} ({authorShort}, {venueAndYear)`
  - `expandedContentFormat`: Text to show for the content in the paper list when expanded. Default: `{abstract}`
- `paperSources`: Api key and access info for services.
- `searchPaperSources`: Sources used to search for papers. Currently supported: `arXiv`, `Google Scholar`
- `fetchPaperSources`: Sources used to fetch paper info. Currently supported: `arXiv`, `Semantic Scholar`
- `searchFields`: Fields to look at when searching papers in Library
- `defaultTags`: Tags included in suggestions
- `pdfViewerToolbar`: List of items in the Toolbar in the PDF viewer. Supported items: `divider`, `zoomIn`, `zoomOut`, `open`
- `defaultSortBy`: Paper attribute to sort by in the list.
