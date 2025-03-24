import React from "react";
import Button from "./Button";
import { BiHome } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center gap-4 mt-12'>
      <div className="font-medium text-3xl">404 - Page Not Found</div>
      <Button
        text="Home"
        icon={<BiHome className='h-full' />}
        onClick={() => navigate("/")}
        className="bg-color-accent-400 px-4 py-2 mt-2"
      />
    </div>
  );
};

export default NotFound;
