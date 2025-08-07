export const APP_ROUTES = {
  // ==============HOME==============
  Home: "/",

  // ==============GAME==============
  Game: (id: string) => `/${id}`,

  // ==============INFO==============
  About: "/about",
  Learn: "/learn",
  Donate: "/donate",
  Confirmation: "/confirmation",

  // ==============AUTH==============
  Login: "/login",
  Signup: "/signup",

  // ==============USERS==============
  UserProfile: (username: string) => `/@/${username}`,
  Friends: "/friends",

   // ==============SETTINGS==============
  Settings: "/settings",
  ProfileSettings: "/settings/profile",
  AppearanceSettings: "/settings/appearance",
  ChangePasswordSettings: "/settings/change-password",
  ChangeUsernameSettings: "/settings/change-username",
  ChangeEmailSettings: "/settings/change-email",
}
