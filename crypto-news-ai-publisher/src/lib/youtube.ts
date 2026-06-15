import { YoutubeTranscript } from "youtube-transcript";
import Parser from "rss-parser";

export interface VideoMetadata {
  videoId: string;
  url: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
}

export function extractVideoId(input: string): string | null {
  const trimmed = input.trim();

  // Already a bare video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1) || null;
    }
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname === "/watch") return url.searchParams.get("v");
      if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] ?? null;
      if (url.pathname.startsWith("/live/")) return url.pathname.split("/")[2] ?? null;
      if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Fetches the full transcript of a YouTube video as a single text blob.
 * Tries German first, then falls back to the default/auto-generated track.
 */
export async function fetchTranscript(videoId: string): Promise<string> {
  let segments;
  try {
    segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: "de" });
  } catch {
    segments = await YoutubeTranscript.fetchTranscript(videoId);
  }

  return segments.map((s) => s.text.trim()).join(" ");
}

/**
 * Fetches basic video metadata via the public oEmbed endpoint - no API key
 * required. For richer metadata (publish date, description), set
 * YOUTUBE_API_KEY and the YouTube Data API will be used instead.
 */
export async function fetchVideoMetadata(videoId: string): Promise<VideoMetadata> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  if (process.env.YOUTUBE_API_KEY) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        const snippet = data.items?.[0]?.snippet;
        if (snippet) {
          return {
            videoId,
            url,
            title: snippet.title,
            channel: snippet.channelTitle,
            thumbnailUrl:
              snippet.thumbnails?.maxres?.url ?? snippet.thumbnails?.high?.url ?? "",
          };
        }
      }
    } catch (err) {
      console.error("YouTube Data API error, falling back to oEmbed", err);
    }
  }

  const oembedRes = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  );
  if (!oembedRes.ok) {
    throw new Error("Video-Metadaten konnten nicht abgerufen werden.");
  }
  const data = await oembedRes.json();
  return {
    videoId,
    url,
    title: data.title,
    channel: data.author_name,
    thumbnailUrl: data.thumbnail_url ?? "",
  };
}

/**
 * Resolves a YouTube channel ID ("UC...") from a handle (e.g. "@xrpdeutschland")
 * or a channel/handle URL. Uses the YouTube Data API if YOUTUBE_API_KEY is
 * set, otherwise falls back to scraping the public channel page - no API key
 * required, but less reliable.
 */
export async function resolveChannelId(handleOrUrl: string): Promise<string | null> {
  let handle = handleOrUrl.trim();
  try {
    if (handle.startsWith("http")) {
      const url = new URL(handle);
      handle = url.pathname.split("/").filter(Boolean).pop() ?? handle;
    }
  } catch {
    // not a URL, treat as a plain handle
  }
  handle = handle.replace(/^@/, "");
  if (!handle) return null;

  if (process.env.YOUTUBE_API_KEY) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@${handle}&key=${process.env.YOUTUBE_API_KEY}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const data = await res.json();
        const id = data.items?.[0]?.id;
        if (id) return id as string;
      }
    } catch (err) {
      console.error("YouTube Data API Channel-Lookup fehlgeschlagen:", err);
    }
  }

  try {
    const res = await fetch(`https://www.youtube.com/@${handle}`);
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/"channelId":"(UC[0-9A-Za-z_-]{22})"/);
      if (match) return match[1];
    }
  } catch (err) {
    console.error("Channel-Seite konnte nicht geladen werden:", err);
  }

  return null;
}

export interface ChannelVideo {
  videoId: string;
  title: string;
  url: string;
  publishedAt: string | null;
}

/**
 * Fetches the most recent uploads of a channel via its public RSS feed - no
 * API key required.
 */
export async function fetchLatestChannelVideos(
  channelId: string,
  limit = 5
): Promise<ChannelVideo[]> {
  const parser = new Parser();
  const feed = await parser.parseURL(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  );

  return (feed.items ?? [])
    .map((item) => ({
      videoId: extractVideoId(item.link ?? "") ?? "",
      title: item.title ?? "",
      url: item.link ?? "",
      publishedAt: item.pubDate ?? null,
    }))
    .filter((video) => video.videoId)
    .slice(0, limit);
}
