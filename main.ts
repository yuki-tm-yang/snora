import "jsr:@std/dotenv/load";

const API_KEY = Deno.env.get("API_KEY");
const CHANNEL_ID = Deno.env.get("CHANNEL_ID");

if (!API_KEY) throw new Error("Missing env var: API_KEY");
if (!CHANNEL_ID) throw new Error("Missing env var: CHANNEL_ID");

const params = new URLSearchParams({
  part:        "snippet",
  channelId:   CHANNEL_ID,
  order:       "date",
  maxResults:  "10",
  type:        "video",
  key:         API_KEY,
});

const url = `https://www.googleapis.com/youtube/v3/search?${params}`;

const res = await fetch(url);
if (!res.ok) {
  console.error(`API error (${res.status}):`, await res.text());
  Deno.exit(1);
}

interface Snippet { title: string }
interface Item { snippet: Snippet; id: { videoId: string } }
interface ApiResponse { items: Item[] }

const data: ApiResponse = await res.json();

for (const { snippet: { title }, id: { videoId } } of data.items) {
  const cleanTitle = title.split("#", 1)[0].trim();
  console.log(`${cleanTitle}:\nhttps://www.youtube.com/watch?v=${videoId}\n`);
}
