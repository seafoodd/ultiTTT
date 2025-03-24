import "./App.css";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Notification from "./components/Notification";
import React, { useEffect, useState } from "react";
import Footer from "./components/Footer";

const App = () => {
  const location = useLocation();
  const [showFooter, setShowFooter] = useState<boolean>(true);

  useEffect(() => {
    const path = location.pathname;
    let title = "ultiTTT"; // Default title
    setShowFooter(true);

    switch (path) {
      case "/":
        title = "Home - ultiTTT";
        break;
      case "/about":
        title = "About - ultiTTT";
        break;
      case "/blog":
        title = "Blog - ultiTTT";
        break;
      case "/learn":
        title = "Learn - ultiTTT";
        break;
      case "/donate":
        title = "Donate - ultiTTT";
        break;
      case "/friends":
        title = "Friends - ultiTTT";
        break;
      case "/login":
        title = "Log In - ultiTTT";
        break;
      case "/signup":
        title = "Sign Up - ultiTTT";
        break;
      case "/confirmation":
        title = "Confirmation - ultiTTT";
        break;
      case "/privacy-policy":
        title = "Privacy Policy - ultiTTT";
        break;
      case "/terms-of-service":
        title = "Terms of Service - ultiTTT";
        break;
      default:
        if (path.startsWith("/@/")) {
          const username = path.split("/@/")[1];
          title = `${username}'s profile - ultiTTT`;
        } else if (path.startsWith("/settings")) {
          title = "Settings - ultiTTT";
        } else if (path.startsWith("/")) {
          title = "Game - ultiTTT";
          setShowFooter(false);
        }
        break;
    }

    document.title = title;
  }, [location]);

  return (
    <>
      <Header />
      <div className="w-full h-full mt-24 flex justify-center gap-24 pb-[120px] min-h-[calc(100vh-96px)]">
        <Outlet />
        <Notification />
      </div>
      {showFooter && <Footer />}
      {/*<div className='h-[3000px] w-full bg-color-1/5'></div>*/}
    </>
  );
};

export default App;
