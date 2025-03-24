import React from "react";
import { UserData } from "./interfaces";

export const fetchUserData = async (
  username: string,
  token: string,
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/${username}`,
      {
        headers: {
          Authorization: token,
        },
      },
    );
    if (!response.ok) {
      if (response.status === 404) {
        setError("The player doesn't exist");
      }
    } else {
      const data = await response.json();
      setUserData(data);
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    setError("Something went wrong");
  } finally {
    setLoading(false);
  }
};
