const toHalfWidth = (input: string) => {
    return input.replace(/[！-～]/g,
        (_input) => {
            return (String.fromCharCode(_input.charCodeAt(0) - 0xFEE0) || '');
        }
    );
};

export { toHalfWidth };