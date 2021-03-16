# FAQ

- **How PaperShelf finds a paper?** Given the paper's title or PDF link, it tries to look up the paper on different databases and websites via public APIs or a web content. The results, together with the PDF's content are used to populate fields of paper details (venue, year, keywords, tags, citations, etc.). You can further save the paper to your library or add it to a collection.

- **How do I sync my Library across different PCs?** Syncing is not fully supported. The best way is to save its data to a synced folder handled by your cloud service. Change the location to this data folder in Preferences > Open Preferences and you are responsible to sync and backup this folder. There is currently no plan to develop a web server (which means no data collected!).

- **The application does not start or work correctly (e.g. after an update). What do I do?** While I try my best to ensure it operates correctly, it is probably not well tested on all platforms and migrations from an older version. Please try cleaning the content of configs.yaml (Preferences > Edit general settings) and other files in the application folder (don't forget to backup!) and restarting the app. If you find a problem, please [file an issue](https://github.com/trungd/PaperShelf/issues).

- **Is it always free?** PaperShelf relies on a number of public APIs and sources for non-commercial use. It always remains free to serve the academic community.
