import React, {useState} from "react";

const images = [
  "https://www.pngall.com/wp-content/uploads/2018/04/Under-Construction-PNG-File-Download-Free.png",
  "https://www.pngkey.com/png/full/397-3975496_under-construction-png-website-under-construction-icon.png",
  "https://media.tenor.com/9n1CXysOWEAAAAAj/ethosaur-nonagon.gif",
  "https://platform.vox.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/8688491/hiE5vMs.gif?quality=90&strip=all&crop=0,0,100,100",
];

const UnderConstruction = () => {
  const [imageIndex, setImageIndex] = useState<number>(Math.floor(Math.random() * images.length))

  return (
    <button onClick={() => {setImageIndex(Math.floor(Math.random() * images.length))}} className="flex flex-col ">
      <h1 className="text-3xl font-bold">In Development</h1>
      <img
        className={`animate-bounce w-96 h-fit mx-auto mt-24`}
        src={images[imageIndex]}
        alt="under construction image"
      />
    </button>
  );
};

export default UnderConstruction;
