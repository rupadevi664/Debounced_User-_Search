import { useState, useEffect, useRef } from 'react';
import { debounce } from './utils';
import './App.css';

// Stretch goal: Highlight matching part of name in bold
function highlightMatch(text, query) {
  if (!query || !text) return text;
  const trimmed = query.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <strong key={index}>{part}</strong>
    ) : (
      part
    )
  );
}

function App() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Stretch goal: Cache results in a Map keyed by query
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const trimmed = query.trim();

    // Requirement 4: Don't fetch when input is empty
    if (!trimmed) {
      return;
    }

    // Requirement 5: AbortController to cancel previous request
    const controller = new AbortController();

    const fetchUsers = async () => {
      const cacheKey = trimmed.toLowerCase();

      // Check cache first
      if (cacheRef.current.has(cacheKey)) {
        setUsers(cacheRef.current.get(cacheKey));
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://dummyjson.com/users/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await res.json();
        const userList = data.users || [];

        // Save to cache
        cacheRef.current.set(cacheKey, userList);
        setUsers(userList);
      } catch (err) {
        // Self-check: Aborted request does not set error
        if (err.name === 'AbortError') return;
        setError(err.message || 'Something went wrong');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    // Requirement 1 & 2: Wait 400ms after last keystroke using plain JS debounce
    const debouncedFetch = debounce(fetchUsers, 400);
    debouncedFetch();

    // Self-check: useEffect returns cleanup that clears timer and aborts request
    return () => {
      debouncedFetch.cancel();
      controller.abort();
    };
  }, [query]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (!val.trim()) {
      setUsers([]);
      setIsLoading(false);
      setError(null);
    }
  };

  return (
    <div className="search-app">
      <h1>User Search</h1>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search users..."
      />

      <div className="results-container">
        {/* Requirement 4: Show "Type to search" when input is empty */}
        {!query.trim() && <p className="status">Type to search</p>}

        {/* Requirement 3: Loading state */}
        {query.trim() && isLoading && <p className="status">Loading…</p>}

        {/* Requirement 3: Error state */}
        {query.trim() && !isLoading && error && (
          <p className="status error">{error}</p>
        )}

        {/* No results */}
        {query.trim() && !isLoading && !error && users.length === 0 && (
          <p className="status">No users found</p>
        )}

        {/* Requirement 3: Results list (full name, email, city) */}
        {query.trim() && !isLoading && !error && users.length > 0 && (
          <ul className="user-list">
            {users.map((user) => (
              <li key={user.id} className="user-item">
                <div className="user-name">
                  {highlightMatch(`${user.firstName} ${user.lastName}`, query)}
                </div>
                <div className="user-email">{user.email}</div>
                <div className="user-city">{user.address?.city}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
