import {
  AcceptIcon,
  AddIcon,
  ArchiveIcon,
  BookmarkIcon,
  ChatIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  GlassesIcon,
  HandIcon,
  HighlightIcon,
  LightningIcon,
  LikeIcon,
  PresenceAvailableIcon,
  PresenceStrokeIcon,
  StarIcon,
  TagIcon,
  TrashCanIcon,
} from "@fluentui/react-northstar";
import { pick } from "lodash";
import React from "react";
import { removeCollection, saveCollection } from "./sync";
import { appData, dataStore, saveAppData } from "./store";

export const icons = {
  none: <></>,
  star: <StarIcon />,
  check: <AcceptIcon />,
  read: <PresenceAvailableIcon />,
  unread: <PresenceStrokeIcon />,
  bookmark: <BookmarkIcon />,
  chat: <ChatIcon />,
  exclamation: <ExclamationTriangleIcon />,
  flag: <FlagIcon />,
  glasses: <GlassesIcon />,
  hand: <HandIcon />,
  highlight: <HighlightIcon />,
  lightning: <LightningIcon />,
  like: <LikeIcon />,
  tag: <TagIcon />,
  trash: <TrashCanIcon />,
  archive: <ArchiveIcon />,
} as Record<string, JSX.Element>;

export type CollectionProps = {
  key: string;
  name: string;
  papers: string[];
  show: boolean;
  icon: string;
};

class Collection {
  key = "new-id";

  name = "";

  papers: string[] = [];

  show = true;

  icon: string = "none";

  constructor(c: Record<string, unknown>) {
    Object.assign(this, c);
  }

  has(id: string) {
    return this.papers.includes(id);
  }

  toggle(id: string) {
    if (this.has(id)) this.papers = this.papers.filter((s) => s !== id);
    else this.papers = [...this.papers, id];
    this.serialize();
  }

  addPaper(id: string) {
    this.papers = [...new Set([...this.papers, id])];
    this.serialize();
  }

  getIcon() {
    return icons[this.icon];
  }

  serialize() {
    appData.collections[this.key] = this.json();
    saveAppData();
    saveCollection(this);
    return this;
  }

  remove() {
    delete appData.collections[this.key];
    saveAppData();
    removeCollection(this);
  }

  json() {
    return pick(this, ["key", "name", "papers", "show", "icon"]);
  }
}

export function getCollections() {
  const collections: Record<string, any> = appData.collections || {};
  if (!collections) return [];
  return getCollectionsFromObject(collections);
}

export function getCollectionsFromObject(collections: Record<string, any>) {
  return Object.entries(collections).map(
    ([key, collection]) =>
      new Collection({
        ...collection,
        key,
      })
  );
}

export function getCollection(key: string) {
  const obj = appData.collections[key];
  return obj ? new Collection(obj) : null;
}

export default Collection;
