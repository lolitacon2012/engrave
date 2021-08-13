const decodeRubyWithFallback = (word: string) => {
    let result = [];
    let remaining = word;
    const startingRegex = /(\[\[|「「|【【)/;
    const endingRegex = /(\]\]|」」|】】)/;
    const dividerRegex = /(::|：：)/;
    let rubyOnly = '';
    let mainOnly = '';
    let limiter = remaining.length;
    while (remaining) {
        limiter--;
        if (limiter < -2) {
            break;
        }
        const si = remaining.match(startingRegex)?.index ?? -1;
        const ei = remaining.match(endingRegex)?.index ?? -1;
        const di = remaining.match(dividerRegex)?.index ?? -1;

        if (si > 0) {
            const part = remaining.slice(0, si);
            result.push(<span key={`${word}-${limiter}`}>{part}</span>);
            rubyOnly += part;
            mainOnly += part;
            remaining = remaining.slice(si);
            continue;
        }

        if ((si < 0) || (ei < 0) || (di < 0) || (di <= si) || (di >= ei)) {
            result.push(<span key={`${word}-${limiter}`}>{remaining}</span>);
            rubyOnly += remaining;
            mainOnly += remaining;
            remaining = '';
            break;
        } else {
            const main = remaining.slice(si + 2, di);
            const ruby = remaining.slice(di + 2, ei);
            result.push(<span key={`${word}-${limiter}`}><ruby>{main}<rt>{ruby}</rt></ruby></span>);
            rubyOnly += ruby;
            mainOnly += main;
            remaining = remaining.slice(ei + 2);
        }
    }
    return {
        element: <span>{result}</span>,
        rubyOnlyText: rubyOnly,
        mainOnlyText: mainOnly,
    };
}

export { decodeRubyWithFallback };