import { useState, useEffect } from 'react';
import { getPoll, vote } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import PollOptionList from './PollOptionList';
import PollResults from './PollResults';
import styles from '../styles/PollView.module.css';

export default function PollView({ pollId }) {
    const [poll, setPoll] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        getPoll(pollId)
            .then(setPoll)
            .catch((err) => setError(err.message));
    }, [pollId]);

    useWebSocket(pollId, (updatedPoll) => {
        setPoll(updatedPoll);
    });

    async function handleVote(optionId) {
        setVoting(true);
        setError(null);
        try {
            await vote(pollId, optionId);
            setHasVoted(true);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('já votou')) {
                setHasVoted(true);
            }
        } finally {
            setVoting(false);
        }
    }

    if (!poll) {
        return <p className={styles.loading}>Carregando enquete...</p>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.question}>{poll.question}</h1>

            {error && <p className={styles.error}>{error}</p>}

            {!hasVoted && (
                <PollOptionList
                    options={poll.options}
                    onVote={handleVote}
                    hasVoted={hasVoted}
                    voting={voting}
                />
            )}

            {!hasVoted && <div className={styles.divider} />}

            <PollResults options={poll.options} />
        </div>
    );
}