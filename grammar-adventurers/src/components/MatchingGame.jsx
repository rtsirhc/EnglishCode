import { useState } from 'react';

function makeCards(pairs) {
    const cards = pairs.flatMap(pair => [
        { id: pair.id + '-left', text: pair.left, side: 'left', verb: pair.right },
        { id: pair.id + '-right', text: pair.right, side: 'right', verb: pair.right }
    ]);
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
}

export default function MatchingGame({ pairs }) {
    const [cards] = useState(() => makeCards(pairs));
    const [selected, setSelected] = useState(null);
    const [matched, setMatched] = useState([]);
    const [feedback, setFeedback] = useState('');

    function choose(card) {
        if (card.id === selected?.id) {
            setSelected(null);
            setFeedback('');
        } else if (!selected || card.side === selected.side) {
            setSelected(card);
            setFeedback('Choose a ' + (card.side === 'right' ? 'subject.' : 'verb.'));
        } else {
            if (card.verb === selected.verb) {
                setMatched([...matched, selected.id, card.id]);
                setFeedback(matched.length + 2 === cards.length ? 'All pairs matched!' : 'Correct pair!');
            } else setFeedback('Try another pair.');
            setSelected(null);
        }
    }

    return <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {cards.map(card => (
                <button key={card.id} onClick={() => choose(card)} disabled={matched.includes(card.id)}
                    aria-pressed={selected?.id === card.id}
                    className={`min-h-14 rounded-xl text-xl font-bold shadow-sm
                        ${matched.includes(card.id) ? 'invisible' : ''}
                        ${selected?.id === card.id ? 'bg-yellow-200 text-slate-900 ring-2 ring-yellow-400' : 'bg-white text-slate-800'}`}>
                    {card.text}
                </button>
            ))}
        </div>
        <p role="status" className="mt-3 min-h-6 text-sm font-bold text-slate-700">{feedback}</p>
    </>;
}
