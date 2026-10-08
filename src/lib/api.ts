import { Channel, MergedChannel, Stream } from "./types";

const CHANNELS_URL = "https://iptv-org.github.io/api/channels.json";
const STREAMS_URL = "https://iptv-org.github.io/api/streams.json";
const LOGOS_URL = "https://iptv-org.github.io/api/logos.json";

export async function fetchIndianChannels(): Promise<MergedChannel[]> {
  try {
    const [channelsRes, streamsRes, logosRes] = await Promise.all([
      fetch(CHANNELS_URL, { next: { revalidate: 3600 } }),
      fetch(STREAMS_URL, { next: { revalidate: 3600 } }),
      fetch(LOGOS_URL, { next: { revalidate: 3600 } })
    ]);

    if (!channelsRes.ok || !streamsRes.ok || !logosRes.ok) {
      throw new Error("Failed to fetch data from iptv-org api");
    }

    const channelsData: Channel[] = await channelsRes.json();
    const streamsData: Stream[] = await streamsRes.json();
    const logosData: { channel: string, url: string }[] = await logosRes.json();

    const streamsByChannel: Record<string, Stream[]> = {};
    streamsData.forEach((stream) => {
      if (stream.channel) {
        if (!streamsByChannel[stream.channel]) {
          streamsByChannel[stream.channel] = [];
        }
        streamsByChannel[stream.channel].push(stream);
      }
    });

    const logosByChannel: Record<string, string> = {};
    logosData.forEach(logo => {
      if (logo.channel && logo.url) {
        logosByChannel[logo.channel] = logo.url;
      }
    });

    const targetChannels = channelsData.filter(
      (c) => {
        const hasStreams = streamsByChannel[c.id] && streamsByChannel[c.id].length > 0;
        const isIN = c.country === "IN";
        const isAnime = c.name.toLowerCase().includes('anime') || (c.categories && c.categories.includes('animation'));
        return hasStreams && (isIN || isAnime);
      }
    );

    return targetChannels.map((c) => ({
      ...c,
      logo: logosByChannel[c.id] || "",
      streamUrl: streamsByChannel[c.id][0].url
    }));
  } catch (error) {
    console.error("Error fetching channels:", error);
    return [];
  }
}
