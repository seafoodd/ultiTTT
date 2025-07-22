import { Link } from "react-router-dom";

const footerNavigation = [
  {
    to: "https://status.ultittt.org",
    children: "Status",
  },
  {
    to: "https://github.com/seafoodd/ultiTTT",
    children: "Github",
  },
  {
    to: "https://discord.gg/cuzT5mfxzn",
    children: "Discord",
  },
  {
    to: "mailto:contact@ultittt.org",
    children: "Contact",
  },
  {
    to: "/privacy-policy",
    children: "Privacy Policy",
  },
  {
    to: "/terms-of-service",
    children: "Terms of Service",
  },
] as const;

const Footer = () => {
  return (
    <footer className="flex w-full h-12 justify-center items-center gap-x-6 gap-y-1 text-color-neutral-300 flex-wrap px-12">
      {footerNavigation.map((item, index) => {
        const isExternal = item.to.startsWith("http") || item.to.startsWith("mailto:");

        return isExternal ? (
          <a key={index} href={item.to} target="_blank" rel="noopener noreferrer">
            {item.children}
          </a>
        ) : (
          <Link key={index} to={item.to}>
            {item.children}
          </Link>
        );
      })}

    </footer>
  );
};

export default Footer;
