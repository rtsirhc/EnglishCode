import { useEffect } from 'react';
import { bindGameControls } from '../../gallery/shared/runtime.js';

export function useControls(next, options = 0) {
    useEffect(() => {
        const actions = {};
        if (next) actions.next = () => document.querySelector('[data-adventure-next]')?.click();
        for (let i = 1; i <= options; i++) {
            actions['answer' + i] = () => document.querySelector('[data-adventure-answer="' + i + '"]')?.click();
        }
        return bindGameControls('grammar-adventurers', actions);
    }, [next, options]);
}
