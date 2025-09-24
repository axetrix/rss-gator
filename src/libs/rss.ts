import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser();

interface RSSFeed {
  rss: {
    channel?: {
      title: string;
      link: string;
      description: string;
      item?: RSSItem[];
    };
  };
}

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

interface Feed {
  title: string;
  link: string;
  description: string;
  items: FeedItem[];
}

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

export async function fetchFeed(feedURL: string): Promise<Feed> {
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "RSS Gator",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const rssObj = parser.parse(xml) as RSSFeed;

  if (!rssObj.rss || !rssObj.rss.channel) {
    throw new Error("Invalid RSS feed, no channel found");
  }

  const channel = rssObj.rss.channel;

  const { title = "", link = "", description = "", item = [] } = channel;

  const result: Feed = {
    title,
    link,
    description,
    items: [],
  };

  if (Array.isArray(item) && item.length > 0) {
    result.items = item
      .filter(i => i.title && i.link && i.description && i.pubDate)
      .map(i => ({
        title: i.title,
        link: i.link,
        description: i.description,
        pubDate: new Date(i.pubDate).toISOString(),
      }));
  }

  return result;
}
