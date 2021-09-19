const toHalfWidth = (input: string) => {
    return input.replace(/[～∼~〜]/g, '~').replace(/[-―‐ー－—⁻]/g, '-');
};

export { toHalfWidth };