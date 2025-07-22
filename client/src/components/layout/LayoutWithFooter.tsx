import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { Outlet } from "react-router-dom";
import Notification from "@/components/notifications/Notification";

export const LayoutWithFooter = () => {
  return (
    <>
      <Header />
      <main className="w-full h-full mt-24 flex justify-center gap-24 pb-[120px] min-h-[calc(100vh-96px)]">
        <Outlet />
        <Notification />
      </main>
      <Footer />
    </>
  );
};
