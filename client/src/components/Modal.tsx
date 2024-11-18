import React from "react";
import { CgClose } from "react-icons/cg";

interface ModalProps {
  children: any;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<ModalProps> = ({ children, isOpen, setIsOpen }) => {
  const handleOverlayClick = () => {
    setIsOpen(false);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      {isOpen ? (
        <div
          className="fixed z-50 flex items-center justify-center top-0 left-0 h-full w-full bg-color-black-3/30"
          onClick={handleOverlayClick}
        >
          <div
            className="flex relative w-[400px] h-[400px] bg-color-black-2 rounded-md"
            onClick={handleModalClick}
          >
            <CgClose
              size={24}
              className="absolute top-1.5 right-1.5 cursor-pointer"
              onClick={() => setIsOpen(false)}
            />
            <div className="m-4 flex justify-center w-full">
              {children}
            </div>
          </div>
        </div>
      ) : ""}
    </>
  );
};

export default Modal;