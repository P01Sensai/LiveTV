import { Channel, MergedChannel, Stream } from "./types";

const CHANNELS_URL = "https://iptv-org.github.io/api/channels.json";
const STREAMS_URL = "https://iptv-org.github.io/api/streams.json";

export async function fetchIndianChannels(): Promise<MergedChannel[]> {
  try {
    const [channelsRes, streamsRes] = await Promise.all([
      fetch(CHANNELS_URL, { next: { revalidate: 3600 } }),
      fetch(STREAMS_URL, { next: { revalidate: 3600 } })
    ]);

    if (!channelsRes.ok || !streamsRes.ok) {
      throw new Error("Failed to fetch data from iptv-org api");
    }

    const channelsData: Channel[] = await channelsRes.json();
    const streamsData: Stream[] = await streamsRes.json();

    const streamsByChannel: Record<string, Stream[]> = {};
    streamsData.forEach((stream) => {
      if (stream.channel) {
        if (!streamsByChannel[stream.channel]) {
          streamsByChannel[stream.channel] = [];
        }
        streamsByChannel[stream.channel].push(stream);
      }
    });

    const indianChannels = channelsData.filter(
      (c) => c.country === "IN" && streamsByChannel[c.id] && streamsByChannel[c.id].length > 0
    );

    return indianChannels.map((c) => ({
      ...c,
      streamUrl: streamsByChannel[c.id][0].url
    }));
  } catch (error) {
    console.error("Error fetching channels:", error);
    return [];
  }
}
