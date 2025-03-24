import React, { useState } from "react";
import {FiClipboard} from "react-icons/fi";
import {ImCheckmark} from "react-icons/im";

interface CopyFieldProps {
  text: string;
}

const CopyField: React.FC<CopyFieldProps> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="flex items-center">
      <input type="text" value={text} readOnly className="flex-1 px-1 h-10 border border-gray-600 rounded-l-md text-md font-medium outline-none" />
      <button onClick={handleCopy} className="px-2 h-10 cursor-pointer bg-color-accent-400 hover:bg-color-neutral-500 transition-colors rounded-r-md">
        {copied ? <ImCheckmark className="p-0.5" size={24}/> : <FiClipboard size={24}/>}
      </button>
    </div>
  );
};

export default CopyField;
