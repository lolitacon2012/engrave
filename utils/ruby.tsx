const decodeRubyWithFallback = (word: string) => {
    const wordWithNormalizedRubyConstant = word.replace('：：', '::');
    const main = (wordWithNormalizedRubyConstant || '').split('::')[0] || '';
    const ruby = (wordWithNormalizedRubyConstant || '').split('::')[1] || '';
    return <span>{ruby ? <ruby>{main}<rt>{ruby}</rt></ruby> : main}</span>
}

export { decodeRubyWithFallback };