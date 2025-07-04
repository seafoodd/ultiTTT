import { AiFillYoutube, AiOutlineTwitch } from "react-icons/ai";
import { FaDiscord } from "react-icons/fa";
import { RiRedditFill } from "react-icons/ri";
import { BsTwitterX } from "react-icons/bs";
import React from "react";
import useNotification from "../shared/hooks/use-notification";

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
  const { showSuccess } = useNotification();

  const socialLinks = [
    {
      key: "twitch",
      url: socials.twitch,
      Icon: AiOutlineTwitch,
      colorClass: "text-color-socials-twitch",
    },
    {
      key: "youtube",
      url: socials.youtube,
      Icon: AiFillYoutube,
      colorClass: "text-color-socials-youtube",
      needsBackground: true,
    },
    {
      key: "discord",
      url: socials.discord,
      Icon: FaDiscord,
      colorClass: "text-color-socials-discord",
      notLink: true,
    },
    {
      key: "reddit",
      url: socials.reddit,
      Icon: RiRedditFill,
      colorClass: "text-color-socials-reddit",
      needsBackground: true,
    },
    {
      key: "twitter",
      url: socials.twitter,
      Icon: BsTwitterX,
      colorClass: "text-color-socials-twitter",
    },
  ];

  const hasSocials = socialLinks.some((social) => social.url);

  return (
    hasSocials && (
      <div className="bg-color-neutral-850 py-2 lg:border-t-0 lg:border-color-accent-300 lg:rounded-md flex lg:flex-col p-1 lg:p-3 min-w-40 lg:mb-6 flex-wrap justify-center lg:justify-start gap-x-8 gap-y-1 px-8">
        <div className="hidden lg:flex justify-start font-medium text-[20px] mb-2">
          Links
        </div>
        {socialLinks.map(
          ({ key, url, Icon, colorClass, needsBackground, notLink }) =>
            url ? (
              <a
                key={key}
                href={notLink ? undefined : url}
                onClick={
                  notLink
                    ? () => {
                        navigator.clipboard.writeText(url);
                        showSuccess("Username copied to clipboard");
                      }
                    : undefined
                }
                title={notLink ? "Copy to clipboard" : "Go to website"}
                target="_blank"
                className="flex gap-0.5 justify-start items-center text-[14px] font-normal cursor-pointer"
              >
                {needsBackground ? (
                  <div className="relative w-[20px] h-[20px] justify-center flex items-center">
                    <div
                      className={`absolute bg-white rounded-full w-[15px] h-[10.5px]`}
                    ></div>
                    <Icon size={20} className={`relative ${colorClass}`} />
                  </div>
                ) : (
                  <Icon
                    size={20}
                    className={` ${colorClass} ${
                      key === "twitter" ? "w-[18px] h-[20px] ml-[1px]" : ""
                    }`}
                  />
                )}
                {notLink ? (
                  <span className="max-w-32 truncate ml-[1px]">{url}</span>
                ) : (
                  key.charAt(0).toUpperCase() + key.slice(1)
                )}
              </a>
            ) : null
        )}
      </div>
    )
  );
};

export default Socials;
