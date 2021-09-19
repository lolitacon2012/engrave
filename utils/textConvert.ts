const toHalfWidth = (input: string) => {
    if (input === '～' || input === '∼' || input === '~') {
        return '~';
    } else if(input === '―' || input === '‐') {
        return '-';
    } else {
        return input;
    }
};

export { toHalfWidth };