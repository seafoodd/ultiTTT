import { Oval } from "react-loader-spinner";
import React from 'react';

interface LoadingCircleProps {
  size?: number;
}

const LoadingCircle:React.FC<LoadingCircleProps> = ({size=30}) => {
  return (
    <div className="flex justify-center items-center">
      <Oval
        height={`${size}`}
        width={`${size}`}
        strokeWidth={6}
        color="#845EF6"
        secondaryColor="#371893"
        ariaLabel="oval-loading"
      />
    </div>
  );
};

export default LoadingCircle;