import React from "react";

interface Option {
  name: string;
  icon: JSX.Element;
  onClick: () => void;
}

interface DropdownProps {
  trigger: JSX.Element;
  options: Option[];
  currentMenu: string;
  setCurrentMenu: React.Dispatch<string>;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, options, currentMenu, setCurrentMenu }) => {
  const handleTriggerClick = () => {
    if (currentMenu === "profile") {
      setCurrentMenu("");
      return;
    }
    setCurrentMenu("profile");
  };

  const handleOptionClick = (onClick: () => void) => {
    onClick();
    setCurrentMenu("");
  };

  return (
    <div className="inline-block text-left h-full relative">
      <div onClick={handleTriggerClick} className={`h-full px-3 transition-colors
       ${currentMenu === "profile" ? "bg-color-gray-2/100" : ""}`}>
        {trigger}
      </div>

      <div
        className={`${currentMenu === "profile" ? "scale-y-100" : "scale-y-0"} h-fit transform
        transition-transform origin-top absolute top-16 right-0 w-60 
        bg-color-gray-2/80 box-content shadow-md backdrop-blur-sm z-10`}
      >
        <div className="py-1">
          {options.map((option, index) => (
            <div
              key={index}
              className="flex items-center px-4 py-2 text-sm transition-colors
               duration-75 hover:bg-color-blue-2 font-medium cursor-pointer"
              onClick={() => handleOptionClick(option.onClick)}
            >
              {option.icon}
              <span className="ml-2">{option.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
