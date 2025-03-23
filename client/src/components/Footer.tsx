import React from 'react';
import {Link} from "react-router-dom";

const Footer = () => {
  return (
    <div className='flex w-full h-12 justify-center items-center gap-x-6 gap-y-1 text-color-neutral-300 flex-wrap px-12'>
      <Link to="https://status.ultittt.org">Status</Link>
      <Link to="https://github.com/seafoodd/ultiTTT">GitHub</Link>
      <Link to="https://discord.gg/cuzT5mfxzn">Discord</Link>
      <Link to="mailto:contact@ultittt.org">Contact</Link>
      <Link to="/privacy-policy">Privacy Policy</Link>
      <Link to="/terms-of-service">Terms of Service</Link>
    </div>
  );
};

export default Footer;