export default function PollOptionList({ options, onVote, hasVoted, voting }) {
    return (
        <div>
            {options.map((option) => (
                <button
                    key={option.id}
                    onClick={() => onVote(option.id)}
                    disabled={hasVoted || voting}
                >
                    {option.text}
                </button>
            ))}
        </div>
    );
}