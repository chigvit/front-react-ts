import { useState } from 'react';
import { Link } from 'react-router-dom';

import { AuthModal } from '@/features/auth/ui/AuthModal';
import { ServiceDropdown } from '@/widgets/service-dropdown/ui/service-dropdown';

import React from 'react';

export const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAuthModalOpen(true);
  };


  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleSearch = () => {
    alert(`Пошук: ${search}`);
  };

  return (
    <header style={styles.header}>
      
      
     <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
 
      
         
      {/* Home link with icon */}
      <Link href="/" style={styles.logo}>
        <span role="img" aria-label="home">🏠</span> Home
      </Link>

      {/* Create Order with dropdown */}
      <ServiceDropdown />

      {/* Search block */}
      <div style={styles.searchBox}>
        <input
          type="text"
          placeholder="Пошук..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <button onClick={handleSearch} style={styles.searchButton}>🔍 Знайти</button>
      </div>

      {/* Auth links */}
      <div style={styles.authLinks}>
        <a href="/login" style={styles.link} onClick={handleLoginClick}>
          🔑 Увійти
        </a>
        
        <a href="/register" className={styles.link}>
          📝 Реєстрація
        </a>
        
      </div>
     
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: '#f4f4f4',
    borderBottom: '1px solid #ddd',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  logo: {
    fontSize: '1.2rem',
    textDecoration: 'none',
    color: '#000',
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    background: 'white',
    border: '1px solid #ccc',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '6px',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '110%',
    left: 0,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '6px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    zIndex: 100,
    minWidth: '160px',
  },
  dropdownItem: {
    display: 'block',
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    color: '#333',
    whiteSpace: 'nowrap',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  searchInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
  },
  searchButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  authLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  link: {
    textDecoration: 'none',
    color: '#0070f3',
    fontWeight: 500,
  },
};


{/* <div style={styles.dropdownContainer}>
<button onClick={toggleDropdown} style={styles.dropdownButton}>
  📋 Створити заявку ⌄
</button>
{showDropdown && (
  <div style={styles.dropdownMenu}>
    <Link href="/order/service" style={styles.dropdownItem}>Послуга</Link>
    <Link href="/order/request" style={styles.dropdownItem}>Запит</Link>
  </div>
)}
</div> */}