import prisma from "../../prisma/prismaClient.js";
import { getCountryData } from "countries-list";

const validateURL = (url, platform) => {
  const patterns = {
    youtube:
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=[\w-]+|[^#]+)?$/,
    twitch: /^(https?:\/\/)?(www\.)?twitch\.tv\/[\w_]+$/,
    reddit: /^(https?:\/\/)?(www\.)?reddit\.com\/user\/\w+$/,
    twitter: /^(https?:\/\/)?(www\.)?x\.com\/[\w_]+$/,
    discord: /^[a-zA-Z0-9_]{2,32}$/,
  };

  if (url === null) return true;

  return patterns[platform]?.test(url);
};

export const updateProfile = async (req, res) => {
  if (!req.user) return;
  if (req.user.role === "guest") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const socials = req.body.socials || {};
  const country = req.body.country;

  for (const [platform, url] of Object.entries(socials)) {
    if (url && !validateURL(url, platform)) {
      return res.status(400).json({
        error: `Invalid ${platform} ${platform === "discord" ? "username" : "URL"}`,
      });
    }
  }

  if (req.body.bio && req.body.bio.length > 120) {
    return res.status(400).json({ error: "The bio is too long" });
  }

  if (country && country !== "-" && !getCountryData(country).name) {
    return res.status(400).json({ error: "Provided country doesn't exist" });
  }

  try {
    await prisma.user.update({
      where: { username: req.user.identifier },
      data: {
        profile: {
          update: {
            bio: req.body.bio,
            location: country === "-" ? null : country,
          },
        },
        socials: {
          update: {
            youtube: socials.youtube,
            twitch: socials.twitch,
            reddit: socials.reddit,
            twitter: socials.twitter,
            discord: socials.discord,
          },
        },
      },
    });

    return res.status(200).json({ message: "Profile updated successfully." });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
};
