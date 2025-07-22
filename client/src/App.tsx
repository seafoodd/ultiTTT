import "./App.css";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Notification from "./components/notifications/Notification";
import { useState } from "react";
import Footer from "./components/layout/Footer";

const App = () => {
  const [showFooter, setShowFooter] = useState<boolean>(true);

  return (
    <>
      <Header />
      <main className="w-full h-full mt-24 flex justify-center gap-24 pb-[120px] min-h-[calc(100vh-96px)]">
        <Outlet />
        <Notification />
      </main>
      {showFooter && <Footer />}
    </>
  );
};

export default App;
