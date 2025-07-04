import "jsr:@std/dotenv/load";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { Hono } from "https://deno.land/x/hono@v3.1.4/mod.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Welcome to Snora's Server", 200, {
    "content-type": "text/plain; charset=utf-8",
  });
});

app.get("/yt-playlist", async (c) => {
  const API_KEY = Deno.env.get("API_KEY");
  const CHANNEL_ID = Deno.env.get("CHANNEL_ID");
  if (!API_KEY) throw new Error("Missing env var: API_KEY");
  if (!CHANNEL_ID) throw new Error("Missing env var: CHANNEL_ID");

  const params = new URLSearchParams({
    part: "snippet",
    channelId: CHANNEL_ID,
    order: "date",
    maxResults: "10",
    type: "video",
    key: API_KEY,
  });
  const url = `https://www.googleapis.com/youtube/v3/search?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`API error (${res.status}):`, await res.text());
    return c.text("API error", 500);
  }
  const { items } = await res.json();
  const lines = items.map(({ snippet: { title }, id: { videoId } }) => {
    const cleanTitle = title.split("#", 1)[0].trim();
    return `${cleanTitle}:\nhttps://www.youtube.com/watch?v=${videoId}`;
  });
  const body = lines.join("\n\n");
  return c.text(body, 200, { "content-type": "text/plain; charset=utf-8" });
});

serve(app.fetch);
