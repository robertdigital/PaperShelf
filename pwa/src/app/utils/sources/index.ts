import { Arxiv } from "./arxiv";
import { SemanticScholar } from "./semanticScholar";

export * from "./semanticScholar";
export * from "./arxiv";

export const Sources = {
  arXiv: Arxiv,
  "Semantic Scholar": SemanticScholar,
};
