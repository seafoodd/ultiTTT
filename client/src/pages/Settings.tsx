import { useClientSeo } from "@/shared/hooks/use-client-seo";
import { NavLink, Outlet, useLocation } from "react-router-dom";

const settings = [
  { to: "profile", name: "Profile" },
  { to: "appearance", name: "Appearance" },
  {},
  { to: "change-password", name: "Change password" },
  { to: "change-username", name: "Change username" },
  { to: "change-email", name: "Change email" },
  {},
  { to: "subscription", name: "Manage subscription" },
];

const Settings = () => {
  const location = useLocation();

  useClientSeo({
    title: "Settings"
  })

  return (
    <div className="w-full">
      <div className="flex w-full justify-center">
        <div className="flex flex-col w-32 sm:w-48 md:mr-16 sm:gap-1.5 text-start">
          {settings.map((setting, key) =>
            setting.to ? (
              <NavLink
                key={setting.to}
                to={setting.to}
                className={({ isActive }) =>
                  `p-2 sm:py-1 ${isActive || (location.pathname === "/settings" && setting.to === "profile") ? "border-r-2 border-color-accent-400" : ""}`
                }
              >
                {setting.name}
              </NavLink>
            ) : (
              <br key={key} className='my-1' />
            ),
          )}
        </div>
        <div className="w-full max-w-[560px] mx-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;
