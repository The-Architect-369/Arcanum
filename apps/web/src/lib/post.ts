export type ArcanumPostV1 = {
  v: 1;
  author: {
    acc: string;        // ACC / SBT / DID
    handle?: string;
    peerId?: string;    // Helia/libp2p PeerId of publisher
  };
  room: {
    id: string;         // Matrix roomId (preferred) or alias used to announce
    channel?: string;   // optional display slug/alias
  };
  createdAt: string;
  body: string;         // plain/markdown
  media?: Array<{ cid: string; name?: string; mime?: string; size?: number }>;
  refs?: { replyToCid?: string; threadRootCid?: string };
  meta?: Record<string, unknown>;
};
