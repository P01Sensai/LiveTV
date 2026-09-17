export interface Channel {
  id: string;
  name: string;
  country: string;
  logo: string;
  categories: string[];
}

export interface Stream {
  channel: string;
  url: string;
  status: string;
}

export interface MergedChannel extends Channel {
  streamUrl: string;
}
