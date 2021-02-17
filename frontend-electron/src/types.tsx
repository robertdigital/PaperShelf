export type Paper = {
  id: string;
  title: string;
  url: string;
  authors: string[];
  year: number;
  downloaded: boolean;
  venue?: string;
  keywords: string[];
  tags: string[];
}
