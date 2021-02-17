import { shell } from 'electron';
import { store } from './store'
import { Paper } from '../types'
import request from 'request';
import fs from 'fs';
import yaml from 'js-yaml';

export function getAuthorShort(authorList: string[]) {
  if (authorList.length > 2) {
    return authorList[0].split(' ').slice(-1).pop() + ' et al.'
  } else {
    return authorList.join(', ')
  }
}

export function downloadPaper({ id, url, title }: Paper) {
  const location = store.get('location') + `/${id}.pdf`

  // TODO: Download paper
  const noti = new Notification(`Downloaded ${title}`, {
    body: `File saved to ${location}`
  })
  noti.onclick = () => {
    shell.showItemInFolder(location)
  }
}

export function getPaperLocation({ id }: Paper) {
  const location = store.get('location') + `/${id}.pdf`;
  if (fs.existsSync(location)) {
    return location;
  } else {
    return null;
  }
}

export function getLocalPapers() {
  try {
    let fileContents = fs.readFileSync(store.get('dataLocation') + '/papers.yml', 'utf8');
    let data = yaml.load(fileContents);
    return Object.entries(data.papers).map(
      ([key, paper], i) => ({
        ...paper,
        id: key
      })
    )
  } catch (e) {
    console.log(e);
    return []
  }
}

export function searchArxiv(searchQuery: string) {
  return fetch(`http://export.arxiv.org/api/query?search_query=${encodeURIComponent(searchQuery)}`)
    .then(response => response.text())
    .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
    .then(data => {
      const entries = data.querySelectorAll("entry")
      return Array.from(entries).map(e => ({
        arxiv: e.querySelector('id')?.textContent,
        updated: e.querySelector('updated')?.textContent,
        published: e.querySelector('published')?.textContent,
        title: e.querySelector('title')?.textContent,
        abstract: e.querySelector('summary')?.textContent,
        authors: Array.from(e.querySelectorAll('author')).map(author => author.querySelector('name')?.textContent)
      }))
    })
}
