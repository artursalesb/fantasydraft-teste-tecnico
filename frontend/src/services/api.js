const API_URL = 'http://backend.test/api';

function getToken() {
    return localStorage.getItem('token');
}

async function ensureSession() {
    let token = getToken();

    if (!token) {
        const response = await fetch(`${API_URL}/session`, { method: 'POST' });
        const data = await response.json();
        token = data.token;
        localStorage.setItem('token', token);
    }

    return token;
}

async function apiRequest(path, options = {}) {
    const token = await ensureSession();

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro na requisição');
    }

    return response.json();
}

export function createPoll(question, options, durationMinutes) {
    return apiRequest('/polls', {
        method: 'POST',
        body: JSON.stringify({
            question,
            options,
            duration_minutes: durationMinutes,
        }),
    });
}
export function getPoll(pollId) {
    return apiRequest(`/polls/${pollId}`);
}

export function vote(pollId, pollOptionId) {
    return apiRequest(`/polls/${pollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ poll_option_id: pollOptionId }),
    });
}