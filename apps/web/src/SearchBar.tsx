import { useState } from "react";

export interface SearchBarProps {
  onSearch: (query: string) => void;
  mode: "photos" | "videos";
  onModeChange: (mode: "photos" | "videos") => void;
}

export function SearchBar({ onSearch, mode, onModeChange }: SearchBarProps) {
  const [value, setValue] = useState("");

  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value.trim());
      }}
    >
      <input
        className="search-input"
        type="text"
        placeholder={`Search ${mode}... (e.g. "mountains", "ocean")`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="search-submit" type="submit">
        Search
      </button>
      <div className="mode-toggle">
        <button
          type="button"
          className={mode === "photos" ? "mode-btn active" : "mode-btn"}
          onClick={() => onModeChange("photos")}
        >
          Photos
        </button>
        <button
          type="button"
          className={mode === "videos" ? "mode-btn active" : "mode-btn"}
          onClick={() => onModeChange("videos")}
        >
          Reels
        </button>
      </div>
    </form>
  );
}
