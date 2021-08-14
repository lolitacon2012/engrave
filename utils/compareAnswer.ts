import { toHalfWidth } from "./textConvert";

export default function isConsideredAsCorrect(input?: string, answer?: string) {
    const convertedInput = toHalfWidth(input || '').trim();
    const convertedAns = toHalfWidth(answer || '').trim();
    return convertedInput === convertedAns;
}