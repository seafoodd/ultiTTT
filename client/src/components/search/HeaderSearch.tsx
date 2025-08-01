import React, { useState, useCallback, useRef } from "react";
import { BiSearch } from "react-icons/bi";
import { Env } from "@/shared/constants/env";

interface HeaderSearchProps {
  className?: string;
  currentMenu: string;
  setCurrentMenu: React.Dispatch<React.SetStateAction<string>>;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({
  className,
  currentMenu,
  setCurrentMenu,
}) => {
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [query, setQuery] = useState<string>("");
  const searchCache = useRef<{ [key: string]: any[] }>({}).current;
  const inputRef = useRef<HTMLInputElement>(null);

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults(null);
      return;
    }

    try {
      const response = await fetch(
        `${Env.VITE_API_URL}/search/users?query=${query}`,
      );
      if (!response.ok) {
        console.error("Network response was not ok");
        return;
      }
      const data = await response.json();
      searchCache[query] = data;
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const debouncedHandleSearch = useCallback(debounce(handleSearch, 200), []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setQuery(query);

    if (searchCache[query]) {
      setSearchResults(searchCache[query]);
      return;
    }
    debouncedHandleSearch(query);
  };

  const toggleSearch = () => {
    if (currentMenu === "search") {
      setCurrentMenu("");
      return;
    }

    setCurrentMenu("search");
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    setQuery("");
    setSearchResults(null);
  };

  return (
    <div
      className={`${className ? className : ""} w-6 items-center justify-center select-none`}
    >
      <button
        className={`transition-transform z-50 pr-1 ${currentMenu === "search" ? "-translate-x-16 sm:-translate-x-24" : "translate-x-14"}`}
        onClick={toggleSearch}
      >
        <BiSearch className="-mb-0.5" size={24} />
      </button>
      <div
        className={`transition-transform relative ${currentMenu === "search" ? "-translate-x-16 sm:-translate-x-24" : "translate-x-16 text-transparent"}`}
      >
        <input
          ref={inputRef}
          className={`bg-transparent w-32 h-7 px-2 py-3 rounded-md outline-none origin-right ${currentMenu !== "search" ? "placeholder-transparent cursor-default" : ""}`}
          placeholder="Search"
          value={query}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        {currentMenu === "search" && (
          <div className="mt-1 absolute flex-col w-full z-50 rounded-md overflow-hidden">
            {searchResults !== null && searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div
                  key={result.username}
                  className="flex w-full duration-75 transition-colors bg-color-neutral-1000 font-medium hover:bg-color-neutral-700"
                >
                  <a
                    className="w-full h-full py-1 flex items-center justify-start px-2"
                    href={`/@/${result.username}`}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="max-w-32 truncate">{result.username}</div>
                  </a>
                </div>
              ))
            ) : (
              <div
                className={`${searchResults === null ? "hidden" : "flex"} bg-color-neutral-1000 w-full items-center justify-center`}
              >
                No results
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderSearch;
