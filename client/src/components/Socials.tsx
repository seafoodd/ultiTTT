import { AiFillYoutube, AiOutlineTwitch } from "react-icons/ai";
import { FaDiscord } from "react-icons/fa";
import { RiRedditFill } from "react-icons/ri";
import { BsTwitterX } from "react-icons/bs";
import React from "react";

interface SocialsProps {
  socials: {
    twitch: string | null;
    youtube: string | null;
    reddit: string | null;
    discord: string | null;
    twitter: string | null;
  };
}

const Socials: React.FC<SocialsProps> = ({ socials }) => {
  const socialLinks = [
    { key: "twitch", url: socials.twitch, Icon: AiOutlineTwitch },
    {
      key: "youtube",
      url: socials.youtube,
      Icon: AiFillYoutube,
      needsBackground: true,
      inset: 6,
    },
    { key: "discord", url: socials.discord, Icon: FaDiscord },
    {
      key: "reddit",
      url: socials.reddit,
      Icon: RiRedditFill,
      needsBackground: true,
      inset: 4,
    },
    { key: "twitter", url: socials.twitter, Icon: BsTwitterX },
  ];

  const hasSocials = socialLinks.some((social) => social.url);

  return (
    hasSocials && (
      <div className="bg-color-neutral-850 py-2 lg:border-t-0 lg:border-color-accent-300 lg:rounded-md flex lg:flex-col p-1 lg:p-3 min-w-40 lg:mb-6 flex-wrap justify-center lg:justify-start gap-x-8 gap-y-1 px-8">
        <div className="hidden lg:flex justify-start font-medium text-[20px] mb-2">
          Links
        </div>
        {socialLinks.map(({ key, url, Icon, needsBackground, inset }) =>
          url ? (
            <a
              key={key}
              href={url}
              target="_blank"
              className="flex gap-0.5 justify-start items-center text-[14px] text-color-neutral-200 font-normal"
            >
              {needsBackground ? (
                <div className="relative w-[20px] h-[20px]">
                  <div
                    className={`absolute inset-[${inset}px] bg-white rounded-full`}
                  ></div>
                  <Icon
                    size={20}
                    className={`relative text-color-socials-${key}`}
                  />
                </div>
              ) : (
                <Icon size={20} className={`text-color-socials-${key}`} />
              )}
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </a>
          ) : null,
        )}
      </div>
    )
  );
};

export default Socials;
