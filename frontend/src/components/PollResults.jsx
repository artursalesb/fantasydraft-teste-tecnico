export default function PollResults({ options }) {
    const totalVotes = options.reduce((sum, option) => sum + option.votes_count, 0);

    return (
        <div>
            {options.map((option) => {
                const percentage = totalVotes > 0
                    ? Math.round((option.votes_count / totalVotes) * 100)
                    : 0;

                return (
                    <div key={option.id}>
                        <div>
                            <span>{option.text}</span>
                            <span>{option.votes_count} voto(s) — {percentage}%</span>
                        </div>
                        <div style={{ background: '#333', height: '8px', width: '100%' }}>
                            <div style={{ background: '#8b5cf6', height: '8px', width: `${percentage}%` }} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}