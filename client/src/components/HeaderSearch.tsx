import React, { useState, useCallback, useRef } from "react";
import { BiSearch } from "react-icons/bi";

interface HeaderSearchProps {
  className?: string;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({ className }) => {
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const searchCache = useRef<{ [key: string]: any[] }>({}).current;

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
        `${import.meta.env.VITE_API_URL}/search/users?query=${query}`,
      );
      if (!response.ok) {
        console.error("Network response was not ok");
        return
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
    if (searchCache[query]) {
      setSearchResults(searchCache[query]);
      return;
    }
    debouncedHandleSearch(query);
  };

  return (
    <div
      className={`${className ? className : ""} flex items-center justify-center`}
    >
      <button
        className={`transition-transform z-50 pr-1 ${searchOpen ? "" : "translate-x-48"}`}
        onClick={() => setSearchOpen(!searchOpen)}
      >
        <BiSearch className="mt-1" size={22} />
      </button>
      <div className={`transition-transform relative`}>
        <input
          className={`bg-transparent w-48 h-7 px-2 py-3 rounded-md outline-none transition-transform ${searchOpen ? "" : "translate-x-52"} origin-right`}
          placeholder="Search"
          onChange={handleInputChange}
        />
        <div className="mt-1 absolute flex-col w-full rounded-md overflow-hidden">
          {searchResults !== null && searchResults.length > 0 ? (
            searchResults.map((result) => (
              <div
                key={result.username}
                className="flex w-full duration-75 transition-colors bg-color-gray-2 font-medium hover:bg-color-gray-3"
              >
                <a
                  className="w-full h-full py-1 flex items-center justify-start px-2"
                  href={`/@/${result.username}`}
                >
                  <div className="max-w-32 truncate">{result.username}</div>
                </a>
              </div>
            ))
          ) : (
            <div
              className={`${searchResults === null ? "hidden" : "flex"} bg-color-gray-3/40 w-full items-center justify-center text-color-gray-3`}
            >
              No results
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderSearch;
