import { useEffect, useRef, useState } from "react";
import { S } from "../styles.js";
import { searchCoins } from "../lib/api.js";

export default function SearchBar({ onSelect, placeholder = "Coin suchen (z. B. Bitcoin, XRP, Solana)…" }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await searchCoins(query);
      setResults(data.slice(0, 10));
      setOpen(true);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div style={S.searchRow} ref={boxRef}>
      <input
        style={S.searchInput}
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      {open && results.length > 0 && (
        <div style={S.searchResults}>
          {results.map((c) => (
            <div
              key={c.id}
              style={{ ...S.searchResultRow, cursor: "pointer" }}
              onClick={() => {
                setOpen(false);
                setQuery("");
                onSelect(c.id, c);
              }}
            >
              {c.thumb && <img src={c.thumb} alt="" style={{ width: 20, height: 20, borderRadius: "50%" }} />}
              <span style={{ fontWeight: 700 }}>{c.name}</span>
              <span style={{ color: "#7a8fa8", fontSize: 12, textTransform: "uppercase" }}>{c.symbol}</span>
              {c.market_cap_rank && <span style={{ marginLeft: "auto", color: "#5a6a7a", fontSize: 12 }}>Rang #{c.market_cap_rank}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
