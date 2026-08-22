import { useState } from 'react';
import { createPoll } from '../services/api';

export default function CreatePoll({ onPollCreated }) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    function updateOption(index, value) {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    }

    function addOption() {
        setOptions([...options, '']);
    }

    function removeOption(index) {
        setOptions(options.filter((_, i) => i !== index));
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);

        const validOptions = options.map(o => o.trim()).filter(o => o.length > 0);

        if (question.trim().length === 0) {
            setError('A pergunta é obrigatória.');
            return;
        }

        if (validOptions.length < 2) {
            setError('Adicione pelo menos 2 opções.');
            return;
        }

        setLoading(true);
        try {
            const poll = await createPoll(question.trim(), validOptions);
            onPollCreated(poll.id);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Criar enquete</h1>

            {error && <p role="alert">{error}</p>}

            <label htmlFor="question">Pergunta</label>
            <input
                id="question"
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Qual sua pergunta?"
            />

            <div>
                <label>Opções</label>
                {options.map((option, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            placeholder={`Opção ${index + 1}`}
                        />
                        {options.length > 2 && (
                            <button type="button" onClick={() => removeOption(index)}>
                                Remover
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addOption}>
                    + Adicionar opção
                </button>
            </div>

            <button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar enquete'}
            </button>
        </form>
    );
}