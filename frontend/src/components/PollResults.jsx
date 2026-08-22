import styles from '../styles/PollResults.module.css';

export default function PollResults({ options }) {
    const totalVotes = options.reduce((sum, option) => sum + option.votes_count, 0);

    return (
        <div className={styles.list}>
            {options.map((option) => {
                const percentage = totalVotes > 0
                    ? Math.round((option.votes_count / totalVotes) * 100)
                    : 0;

                return (
                    <div key={option.id}>
                        <div className={styles.row}>
                            <span className={styles.optionText}>{option.text}</span>
                            <span className={styles.voteCount}>{option.votes_count} voto(s) — {percentage}%</span>
                        </div>
                        <div className={styles.barTrack}>
                            <div className={styles.barFill} style={{ width: `${percentage}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}