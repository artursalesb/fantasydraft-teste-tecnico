import styles from '../styles/PollOptionList.module.css';

export default function PollOptionList({ options, onVote, hasVoted, voting }) {
    return (
        <div className={styles.list}>
            {options.map((option) => (
                <button
                    key={option.id}
                    className={styles.optionButton}
                    onClick={() => onVote(option.id)}
                    disabled={hasVoted || voting}
                >
                    {option.text}
                </button>
            ))}
        </div>
    );
}