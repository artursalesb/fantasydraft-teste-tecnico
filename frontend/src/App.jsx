import { useState } from 'react';
import CreatePoll from './components/CreatePoll';

function App() {
    const [currentPollId, setCurrentPollId] = useState(null);

    function handlePollCreated(pollId) {
        setCurrentPollId(pollId);
    }

    if (!currentPollId) {
        return <CreatePoll onPollCreated={handlePollCreated} />;
    }

    return (
        <div>
            <p>Enquete criada! ID: {currentPollId}</p>
            <button onClick={() => setCurrentPollId(null)}>Criar outra</button>
        </div>
    );
}

export default App;