const decodeRubyWithFallback = (word: string) => {
    const wordWithNormalizedRubyConstant = word.replace('：：', '::');
    const main = (wordWithNormalizedRubyConstant || '').split('::')[0] || '';
    const ruby = (wordWithNormalizedRubyConstant || '').split('::')[1] || '';
    return <span>{ruby ? <ruby>{main}<rt>{ruby}</rt></ruby> : main}</span>
}

const getRubyMain = (word: string) => {
    const wordWithNormalizedRubyConstant = word.replace('：：', '::');
    const main = (wordWithNormalizedRubyConstant || '').split('::')[0] || '';
    return main;
}

const getRuby = (word: string) => {
    const wordWithNormalizedRubyConstant = word.replace('：：', '::');
    const ruby = (wordWithNormalizedRubyConstant || '').split('::')[1] || '';
    return ruby;
}

export { decodeRubyWithFallback, getRubyMain, getRuby };