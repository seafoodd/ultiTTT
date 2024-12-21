import React from "react";
import PingDisplay from "./PingDisplay";
import { useSocket } from "../context/SocketContext";

interface Option {
  name: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

interface DropdownProps {
  trigger: React.ReactNode;
  options: Option[];
  currentMenu: string;
  setCurrentMenu: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  options,
  currentMenu,
  setCurrentMenu,
  className,
}) => {
  const env = import.meta.env.VITE_ENV || "production";
  const { socket } = useSocket();

  const handleTriggerClick = () => {
    setCurrentMenu(currentMenu === "profile" ? "" : "profile");
  };

  const handleOptionClick = (onClick?: () => void) => {
    if (onClick) onClick();
    setCurrentMenu("");
  };

  return (
    <div
      className={`${className ? className : ""} inline-block text-left h-full relative`}
    >
      <div
        onClick={handleTriggerClick}
        className={`h-full px-3 transition-colors ${currentMenu === "profile" ? "bg-color-gray-2" : "bg-color-gray-1"}`}
      >
        {trigger}
      </div>

      <div
        className={`${currentMenu === "profile" ? "scale-y-100" : "scale-y-0"} h-fit transform transition-transform origin-top absolute top-16 right-0 w-60 bg-color-gray-2/80 box-content shadow-md backdrop-blur-sm z-10`}
      >
        <div className="py-1">
          {options.map((option, index) => (
            <React.Fragment key={index}>
              {option.onClick ? (
                <div
                  className="flex items-center px-4 py-2 text-sm transition-colors duration-75 hover:bg-color-blue-2 font-medium cursor-pointer"
                  onClick={() => handleOptionClick(option.onClick)}
                >
                  {option.icon}
                  <span className="ml-2">{option.name}</span>
                </div>
              ) : (
                <a
                  className="flex items-center px-4 py-2 text-sm transition-colors duration-75 hover:bg-color-blue-2 font-medium cursor-pointer"
                  href={option.href}
                >
                  {option.icon}
                  <span className="ml-2">{option.name}</span>
                </a>
              )}
            </React.Fragment>
          ))}
        </div>
        <PingDisplay className="pl-3 py-2 border-t border-white/50" />
        {env == "development" && (
          <div>{socket?.id ? socket?.id : "No connection"}</div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
