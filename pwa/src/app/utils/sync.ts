import firebase from "firebase";
import { merge } from "lodash";
import Collection from "./collection";
import Paper from "./paper";
import { appData, settings } from "./store";

export function db() {
  return firebase.database();
}

export function uid() {
  return firebase.auth().currentUser?.uid;
}

export function refreshLastUpdated() {
  const date = Date.now();
  db().ref(`users/${uid()}/lastUpdated`).set(date);
  localStorage.setItem("lastUpdated", date.toString());
}

export function savePaper(paper: Paper) {
  if (!uid()) return;
  console.log("syncing " + paper.id);
  db()
    .ref(`users/${uid()}/papers/${paper.id}`)
    .set(
      JSON.parse(
        JSON.stringify({
          ...paper.json(),
          dateSynced: Date.now(),
        })
      )
    )
    .then(() => refreshLastUpdated());
}

export function saveCollection(collection: Collection) {
  if (!uid()) return;
  console.log("syncing " + collection.key);
  db()
    .ref(`users/${uid()}/collections/${collection.key}`)
    .set(
      JSON.parse(
        JSON.stringify({
          ...collection.json(),
          dateSynced: Date.now(),
        })
      )
    )
    .then(() => refreshLastUpdated());
}

export function removePaper(paper: Paper) {
  if (!uid()) return;
  db()
    .ref(`users/${uid()}/papers/${paper.id}`)
    .remove()
    .then(() => refreshLastUpdated());
}

export function removeCollection(collection: Collection) {
  if (!uid()) return;
  db()
    .ref(`users/${uid()}/collections/${collection.key}`)
    .remove()
    .then(() => refreshLastUpdated());
}

export async function syncAll() {
  if (!uid()) return;
  const lastUpdated: number =
    (await db().ref(`users/${uid()}/lastUpdated`).get()).val() || 0;
  const localLastUpdated = parseInt(localStorage.getItem("lastUpdated") || "0");

  if (lastUpdated > localLastUpdated) {
    return db()
      .ref(`users/${uid()}`)
      .get()
      .then((snapshot) => {
        const data = snapshot.val();
        merge(appData, {
          papers: data.papers,
          collections: data.collections,
        });
        merge(settings, data.settings);
        localStorage.setItem("lastUpdated", data.lastUpdated);
      })
      .then(() => console.log("Local data updated"));
  } else {
    const lastUpdated = Date.now();
    return db()
      .ref(`users/${uid()}`)
      .set({
        settings: JSON.parse(JSON.stringify(settings)),
        ...JSON.parse(JSON.stringify(appData)),
        lastUpdated,
      })
      .then(() => {
        localStorage.setItem("lastUpdated", lastUpdated.toString());
      })
      .then(() => console.log("Cloud data updated"));
  }
}
