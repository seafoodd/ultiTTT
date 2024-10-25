const Square = ({ chooseSquare, val, isYourTurn }) => {
  return (
    <div
      className={`border-[1px] border-black flex-[33%]
     flex items-center justify-center text-[64px]
     font-semibold ${isYourTurn && 'cursor-pointer hover:bg-blue-200'}
     transition-bg ${val === "X" ? "text-blue-700" : "text-red-600"}`}
      onClick={chooseSquare}
    >
      <div>{val}</div>
    </div>
  );
};

export default Square;
