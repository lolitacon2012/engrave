type MorphologyRule = {
    id: string,
    name: string,
    rows: { id: string, name: string }[],
    columns: { id: string, name: string }[],
}

export type {
    MorphologyRule
}
