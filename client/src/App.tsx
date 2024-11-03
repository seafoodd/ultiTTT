import "./App.css";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
const App: React.FC = () => {
  return (
    <>
      <Header />
      <div className="w-full h-full mt-12 flex justify-center items-center gap-24">
        <Outlet />
      </div>
      {/*<div className='h-[3000px] w-full bg-color-1/5'></div>*/}
    </>
  );
};

export default App;
