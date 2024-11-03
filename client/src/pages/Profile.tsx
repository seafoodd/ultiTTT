import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GameHistory from "../components/GameHistory";

const fetchUserData = async (
  username: string,
  setUserData: Function,
  setError: Function,
  setLoading: Function,
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/users/username/${username}`,
    );
    if (!response.ok) {
      if (response.status === 404) {
        setError("The player doesn't exist");
      } else {
        setError("Something went wrong.");
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

const Profile = () => {
  const { username } = useParams<string>();
  const [userData, setUserData] = useState<{
    username: string;
    location: string;
    dateOfBirth: Date;
    avatarUrl: string;
    elo: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData(username!, setUserData, setError, setLoading);
  }, [username]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const dateOfBirthFormatted = new Date(
    userData!.dateOfBirth,
  ).toLocaleDateString();

  return (
    <div className="flex flex-col w-full">
      <div className="text-xl">
        <p>{userData!.username}</p>
        {userData!.location && <p>Location: {userData!.location}</p>}
        {userData!.dateOfBirth && <p>Date of birth: {dateOfBirthFormatted}</p>}
        <p>Elo: {userData!.elo}</p>
      </div>
      <div className="mt-24 w-full">
        <GameHistory username={username!} />
      </div>
    </div>
  );
};

export default Profile;
