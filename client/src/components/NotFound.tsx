import React from "react";
import Button from "./Button";
import { BiHome } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center'>
      <div className="font-semibold text-xl">404 - Page Not Found</div>
      <Button
        text="Home"
        icon={<BiHome />}
        onClick={() => navigate("/home")}
        className="bg-color-blue-2 px-2 py-2 mt-2"
      />
    </div>
  );
};

export default NotFound;
