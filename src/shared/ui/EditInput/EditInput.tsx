import React, { useState } from "react";
import styles from "./EditInput.module.css";

interface EditInputProps {
  value?: string;
  onChange: (newValue: string) => void;
}

export const EditInput: React.FC<EditInputProps> = ({ value = "", onChange }) => {
  return (
    <input
      type="text"
      className={styles.input}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter text..."
    />
  );
};

export default EditInput;