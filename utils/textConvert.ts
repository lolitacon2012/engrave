const toHalfWidth = (input: string) => {
    if (input === '～' || input === '∼' || input === '~' || input === '〜') {
        return '~';
    } else if (input === '-' || input === '―' || input === '‐' || input === "ー" || input === "－" || input === "—" || input === "⁻") {
        return '-';
    } else {
        return input;
    }
};

export { toHalfWidth };