import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { countries } from "countries-list";
import LoadingCircle from "../LoadingCircle";
import Button from "../../shared/ui/Button";
import { FaEdit } from "react-icons/fa";
import Axios from "axios";
import useNotification from "../../hooks/useNotification";
import { UserData, Socials } from "@/shared/lib/client/interfaces";
import { fetchUserData } from "@/shared/lib/client/dbUtils";
import { useAuth } from "@/shared/provider/auth-provider";

const patterns = {
  youtube:
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=[\w-]+|[^#]+)?$/,
  twitch: /^(https?:\/\/)?(www\.)?twitch\.tv\/[\w_]+$/,
  reddit: /^(https?:\/\/)?(www\.)?reddit\.com\/user\/\w+$/,
  twitter: /^(https?:\/\/)?(www\.)?x\.com\/[\w_]+$/,
  discord: /^[a-zA-Z0-9_]{2,32}$/,
};

const ProfileSettings = () => {
  const [biography, setBiography] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const { currentUser, token } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useNotification();
  const [errorFields, setErrorFields] = useState<any[]>([]);

  const [socials, setSocials] = useState<Socials>({
    youtube: "",
    twitch: "",
    reddit: "",
    discord: "",
    twitter: "",
  });

  useEffect(() => {
    if (!token) return;

    fetchUserData(
      currentUser.username,
      token,
      setUserData,
      setError,
      setLoading
    ).catch((err) => {
      console.log(err);
    });
  }, []);

  useEffect(() => {
    if (!userData) return;
    setBiography(userData.profile.bio);
    setSelectedCountry(userData.profile.location);
    setSocials(userData.socials);
  }, [userData]);

  const countryOptions = Object.entries(countries).map(([code, { name }]) => ({
    code,
    name,
  }));

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrorFields: string[] = [];

    if (biography && biography.length > 120) {
      showError("The bio is too long");
      newErrorFields.push("bio");
    }

    Object.entries(socials).forEach(([platform, value]) => {
      if (value && !patterns[platform as keyof typeof patterns].test(value)) {
        showError(
          `Invalid ${platform} ${platform === "discord" ? "username" : "URL"}`
        );
        newErrorFields.push(platform);
      }
    });

    if (newErrorFields.length > 0) {
      setErrorFields(newErrorFields);
      return;
    }

    const payload = {
      bio: biography,
      country: selectedCountry,
      socials,
    };

    Axios.patch(`${import.meta.env.VITE_API_URL}/account/profile`, payload, {
      headers: {
        Authorization: token,
      },
    })
      .then(() => {
        setErrorFields([]);
        showSuccess("Updated successfully");
      })
      .catch((e) => {
        showError(e.response?.data?.error);
      });
  };

  if (loading) {
    return <LoadingCircle />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="text-start text-3xl font-medium mb-4">Edit profile</div>

      <div className="flex flex-col items-start sm:flex-row gap-2 mb-3">
        <div className="text-start w-40 font-medium">Username</div>
        <div className="flex gap-2">
          <div>{userData?.username}</div>
          <Link
            to="/settings/change-username"
            className="text-color-accent-300 hover:underline"
          >
            Change
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-start sm:flex-row gap-2 mb-3">
        <div className="text-start flex-none w-40 font-medium">Email</div>
        <div className="flex gap-2">
          <div>{userData?.email}</div>
          <Link
            to="/settings/change-email"
            className="text-color-accent-300 hover:underline"
          >
            Change
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-start sm:flex-row gap-2 mb-3">
        <div className="text-start flex-none w-40 font-medium">Biography</div>
        <textarea
          maxLength={120}
          className={`p-2 overflow-y-scroll h-32 w-full rounded-md ${
            errorFields.includes("bio") ? "border border-red-500" : ""
          }`}
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
        />
      </div>

      <div className="flex flex-col items-start sm:flex-row gap-2 mb-3">
        <div className="text-start flex-none w-40 font-medium">Country</div>
        <select
          className="p-2 py-1 w-full rounded-md"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          <option value="-">-</option>
          {countryOptions.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-start text-xl font-medium mt-8">Social Links</div>
        {["youtube", "twitch", "reddit", "discord", "twitter"].map(
          (platform) => (
            <div
              key={platform}
              className="flex flex-col items-start sm:flex-row gap-2 flex-none"
            >
              <div className="text-start w-40 flex-none capitalize">
                {platform}
              </div>
              <input
                type="text"
                name={platform}
                value={socials[platform as keyof Socials] ?? ""}
                onChange={handleSocialChange}
                placeholder={`Enter ${platform} ${
                  platform === "discord" ? "username" : "link"
                }`}
                className={`p-1 py-0.5 rounded-md w-full ${
                  errorFields.includes(platform) ? "border border-red-500" : ""
                }`}
              />
            </div>
          )
        )}
      </div>

      <Button
        type="submit"
        icon={<FaEdit size={18} />}
        className="mt-2 bg-color-neutral-800 px-6 py-2 w-32 hover:bg-color-neutral-700"
      >
        Save
      </Button>
    </form>
  );
};

export default ProfileSettings;
