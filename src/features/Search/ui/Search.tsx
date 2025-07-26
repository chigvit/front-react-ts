import React, { useState } from 'react';
import  EditInput  from '@/shared/ui/EditInput/EditInput';
import Button from '@/shared/ui/Button/Button';
import { SearchResults } from './SearchResults';



import styles from './Search.module.css';
import { FaSearch } from "react-icons/fa";

export const Search: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const baseUrl = 'https://swapi.dev/api/people/';
    const url = searchValue ? `${baseUrl}?search=${searchValue}` : baseUrl;
  
    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log(data);
      
      setResults(data.results);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResults([]);
    }
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <EditInput
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Enter search term"
        />
        <Button onClick={handleSearch}>
          <FaSearch />
        </Button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.results}>
        <SearchResults results={results} />
      </div>
    </div>
  );
};
