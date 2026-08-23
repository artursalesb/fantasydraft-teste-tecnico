import { useState, useEffect } from 'react';
import { getPoll, vote } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import PollOptionList from './PollOptionList';
import PollResults from './PollResults';
import styles from '../styles/PollView.module.css';

function getTimeRemaining(closesAt) {
    if (!closesAt) return null;
    const diff = new Date(closesAt).getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function PollView({ pollId }) {
    const [poll, setPoll] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [voting, setVoting] = useState(false);
    const [error, setError] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);

    useEffect(() => {
        getPoll(pollId)
            .then(setPoll)
            .catch((err) => setError(err.message));
    }, [pollId]);

    useWebSocket(pollId, (updatedPoll) => {
        setPoll(updatedPoll);
    });

    useEffect(() => {
        if (!poll?.closes_at) {
            setTimeRemaining(null);
            return;
        }

        setTimeRemaining(getTimeRemaining(poll.closes_at));

        const interval = setInterval(() => {
            setTimeRemaining(getTimeRemaining(poll.closes_at));
        }, 1000);

        return () => clearInterval(interval);
    }, [poll?.closes_at]);

    async function handleVote(optionId) {
        setVoting(true);
        setError(null);
        try {
            await vote(pollId, optionId);
            setHasVoted(true);
        } catch (err) {
            setError(err.message);
            if (err.message.includes('já votou') || err.message.includes('encerrada')) {
                setHasVoted(true);
            }
        } finally {
            setVoting(false);
        }
    }

    if (!poll) {
        return <p className={styles.loading}>Carregando enquete...</p>;
    }

    const isClosed = timeRemaining === 0;

    return (
        <div className={styles.container}>
            <h1 className={styles.question}>{poll.question}</h1>

            {timeRemaining !== null && !isClosed && (
                <p className={styles.timer}>Encerra em {formatTime(timeRemaining)}</p>
            )}
            {isClosed && <p className={styles.closedBadge}>Enquete encerrada</p>}

            {error && <p className={styles.error}>{error}</p>}

            {!hasVoted && !isClosed && (
                <PollOptionList
                    options={poll.options}
                    onVote={handleVote}
                    hasVoted={hasVoted}
                    voting={voting}
                />
            )}

            {(!hasVoted && !isClosed) && <div className={styles.divider} />}

            <PollResults options={poll.options} />
        </div>
    );
}