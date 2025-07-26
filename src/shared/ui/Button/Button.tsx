import React from "react";
import styles from './Button.module.css';
//import { FaSearch } from "react-icons/fa";

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode; // Add children prop
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button className={styles.button} onClick={onClick}>
      {children} {/* Render children */}
    </button>
  );
};

export default Button;
