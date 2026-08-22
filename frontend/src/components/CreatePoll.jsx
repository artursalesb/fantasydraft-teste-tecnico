import { useState } from 'react';
import { createPoll } from '../services/api';
import styles from '../styles/CreatePoll.module.css';

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
        <form onSubmit={handleSubmit} className={styles.container}>
            <h1 className={styles.title}>Criar enquete</h1>

            {error && <p className={styles.error}>{error}</p>}

            <label htmlFor="question" className={styles.label}>Pergunta</label>
            <input
                id="question"
                type="text"
                className={styles.input}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Qual sua pergunta?"
            />

            <label className={styles.label}>Opções</label>
            {options.map((option, index) => (
                <div key={index} className={styles.optionRow}>
                    <input
                        type="text"
                        className={styles.input}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                    />
                    {options.length > 2 && (
                        <button type="button" className={styles.removeButton} onClick={() => removeOption(index)}>
                            Remover
                        </button>
                    )}
                </div>
            ))}
            <button type="button" className={styles.addButton} onClick={addOption}>
                + Adicionar opção
            </button>

            <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Criando...' : 'Criar enquete'}
            </button>
        </form>
    );
}