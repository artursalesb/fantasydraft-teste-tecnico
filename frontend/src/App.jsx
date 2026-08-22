import { useState, useEffect } from 'react';
import CreatePoll from './components/CreatePoll';
import PollView from './components/PollView';

function getPollIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const pollId = params.get('poll');
    return pollId ? Number(pollId) : null;
}

function App() {
    const [currentPollId, setCurrentPollId] = useState(getPollIdFromUrl());

    function handlePollCreated(pollId) {
        setCurrentPollId(pollId);
        const url = new URL(window.location);
        url.searchParams.set('poll', pollId);
        window.history.pushState({}, '', url);
    }

    useEffect(() => {
        function handlePopState() {
            setCurrentPollId(getPollIdFromUrl());
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    if (!currentPollId) {
        return <CreatePoll onPollCreated={handlePollCreated} />;
    }

    return <PollView pollId={currentPollId} />;
}

export default App;