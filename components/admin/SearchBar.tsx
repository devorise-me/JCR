import React, { useState } from 'react';
import UserDetails from './ShowUserDetails';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; username: string; email: string; role: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleCloseUserDetails = () => {
    setSelectedUserId(null);
  };

  const handleSearch = async () => {
    setError(null);
    const lowerCaseQuery = query.toLowerCase();

    if (lowerCaseQuery.length > 0) {
      const res = await fetch(`/api/search?query=${lowerCaseQuery}`);
      const data = await res.json();

      if (data && data.length > 0) {
        setResults(data);
        setSelectedUserId(data[0].id); // Set the selected user ID
      } else {
        setResults([]);
        setError('المستخدم غير موجود');
      }
    } else {
      setResults([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className='w-full'>
      <div className="flex w-full items-center ">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder=" ... ابحث عن المستخدمين أو المسؤولين"
          className="border p-2 w-full rounded flex-grow"
        />
        <button
          onClick={handleSearch}
          className="ml-2 p-2 bg-gray-500 hover:bg-[#0F172A] text-white rounded"
        >
          بحث
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {selectedUserId && (
        <UserDetails userId={selectedUserId} onClose={handleCloseUserDetails} />
      )}
    </div>
  );
};

export default SearchBar;
