import React from 'react';
import styles from './Search.module.css';

interface Character {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
}

interface SearchResultsProps {
  results: Character[];
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return <p>No results found.</p>;
  }

  return (
    <div className={styles.results_container}>
      {results.map((character, index) => (
        <div className={styles.results_container}>
          <h3>{character.name}</h3>
          <p><strong>Height:</strong> {character.height} cm</p>
          <p><strong>Mass:</strong> {character.mass} kg</p>
          <p><strong>Hair Color:</strong> {character.hair_color}</p>
          <p><strong>Skin Color:</strong> {character.skin_color}</p>
          <p><strong>Eye Color:</strong> {character.eye_color}</p>
          <p><strong>Birth Year:</strong> {character.birth_year}</p>
          <p><strong>Gender:</strong> {character.gender}</p>
        </div>
      ))}
    </div>
  );
};
