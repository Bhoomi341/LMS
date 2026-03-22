/**
 * Extract YouTube video id from common URL shapes or raw id.
 */
export function parseYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "www.youtube.com") {
      if (u.pathname === "/watch") {
        const v = u.searchParams.get("v");
        return v && /^[\w-]{11}$/.test(v) ? v : null;
      }
      const embed = u.pathname.match(/^\/embed\/([\w-]{11})/);
      if (embed) return embed[1];
      const short = u.pathname.match(/^\/shorts\/([\w-]{11})/);
      if (short) return short[1];
    }
  } catch {
    return null;
  }

  return null;
}
