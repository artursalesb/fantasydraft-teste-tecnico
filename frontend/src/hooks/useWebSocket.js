import { useEffect, useRef } from 'react';

export function useWebSocket(pollId, onMessage) {
    const wsRef = useRef(null);

    useEffect(() => {
        if (!pollId) return;

        const ws = new WebSocket(`ws://localhost:3001?pollId=${pollId}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        ws.onerror = (err) => {
            console.error('Erro no WebSocket:', err);
        };

        return () => {
            ws.close();
        };
    }, [pollId]);
}