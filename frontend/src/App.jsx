import { useState } from 'react';
import CreatePoll from './components/CreatePoll';
import PollView from './components/PollView';

function App() {
    const [currentPollId, setCurrentPollId] = useState(null);

    function handlePollCreated(pollId) {
        setCurrentPollId(pollId);
    }

    if (!currentPollId) {
        return <CreatePoll onPollCreated={handlePollCreated} />;
    }

    return <PollView pollId={currentPollId} />;
}

export default App;