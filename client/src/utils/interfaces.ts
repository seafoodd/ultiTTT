export interface Perf {
  elo: number;
  wins: number;
  winsR: number;
  losses: number;
  lossesR: number;
  draws: number;
  drawsR: number;
  playtime: number;
  all: number;
  allR: number;
}

export interface UserData {
  username: string;
  email?: string;
  displayName: string;
  createdAt: Date;
  lastOnline: Date;
  supporter: boolean;
  profile: {
    bio: string;
    location: string;
  };
  socials: Socials;
  perfs: {
    bullet: Perf;
    blitz: Perf;
    rapid: Perf;
    standard: Perf;
  };
}

export interface Notification {
  id: number;
  from?: string;
  gameId?: string;
  message: string;
  type: "error" | "info" | "success" | "challenge";
}

export interface Socials {
  youtube: string | null;
  twitch: string | null;
  reddit: string | null;
  discord: string | null;
  twitter: string | null;
}