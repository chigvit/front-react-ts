import styles from './BigActionButton.module.css';

interface BigActionButtonProps {
  iconSrc: string;
  text: string;
  onClick: () => void;
}

export const BigActionButton = ({ iconSrc, text, onClick }: BigActionButtonProps) => {
  return (
    <button className={styles.bigButton} onClick={onClick}>
      <img src={iconSrc} alt="" className={styles.icon} />
      <span className={styles.text}>{text}</span>
    </button>
  );
};

export default BigActionButton;