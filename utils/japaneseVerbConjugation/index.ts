import { decodeRubyWithFallback } from "cafe-utils/ruby";
import { JAPANESE_VERB_KATSUYOU } from "cafe-constants/index";

const category1words = ["「「書：：か」」く",
    "「「飲：：の」」む",
    "「「思：：おも」」う",
    "「「働：：はたら」」く",
    "「「聞：：き」」く",
    "「「置：：お」」く",
    "「「弾：：ひ」」く",
    "「「吐：：は」」く",
    "「「履：：は」」く",
    "「「動：：うご」」く",
    "「「歩：：ある」」く",
    "「「着：：つ」」く",
    "「「泳：：およ」」ぐ",
    "「「急：：いそ」」ぐ",
    "「「脱：：ぬ」」ぐ",
    "「「貸：：か」」す",
    "「「出：：だ」」す",
    "「「消：：け」」す",
    "「「話：：はな」」す",
    "「「押：：お」」す",
    "「「無：：な」」くす",
    "「「返：：かえ」」す",
    "「「直：：なお」」す",
    "「「回：：まわ」」す",
    "「「待：：ま」」つ",
    "「「立：：た」」つ",
    "「「勝：：か」」つ",
    "「「死：：し」」ぬ",
    "「「遊：：あそ」」ぶ",
    "「「呼：：よ」」ぶ",
    "「「休：：やす」」む",
    "「「住：：す」」む",
    "「「読：：よ」」む",
    "「「終：：お」」わる",
    "「「帰：：か」」える",
    "「「取：：と」」る",
    "「「撮：：と」」る",
    "「「切：：き」」る",
    "「「送：：おく」」る",
    "「「分：：わ」」かる",
    "「「掛：：か」」かる",
    "「「入：：はい」」る",
    "「「降：：ふ」」る",
    "「「座：：すわ」」る",
    "「「作：：つく」」る",
    "「「売：：う」」る",
    "「「知：：し」」る",
    "「「乗：：の」」る",
    "「「登：：のぼ」」る",
    "「「泊：：と」」まる",
    "「「止：：と」」まる",
    "なる",
    "「「鳴：：な」」る",
    "「「要：：い」」る",
    "「「被：：かぶ」」る",
    "「「触：：さわ」」る",
    "「「渡：：わた」」る",
    "「「頑：：がん」」「「張：：ば」」る",
    "「「吸：：す」」う",
    "「「買：：か」」う",
    "「「会：：あ」」う",
    "「「合：：あ」」う",
    "「「貰：：もら」」う",
    "「「習：：なら」」う",
    "「「手：：て」」「「伝：：つだ」」う",
    "「「使：：つか」」う",
    "「「払：：はら」」う",
    "「「洗：：あら」」う",
    "「「歌：：うた」」う",
    "「「言：：い」」う",
    "「「集：：あつ」」まる"
];
const category2words = ["「「見：：み」」る",
    "「「食：：た」」べる",
    "「「受：：う」」ける",
    "あげる",
    "「「起：：お」」きる",
    "「「寝：：ね」」る",
    "「「借：：か」」りる",
    "「「教：：おし」」える",
    "「「掛：：か」」ける",
    "いる",
    "「「迎：：むか」」える",
    "「「疲：：つか」」れる",
    "「「出：：で」」る",
    "「「付：：つ」」ける",
    "「「開：：あ」」ける",
    "「「閉：：し」」める",
    "「「止：：や」」める",
    "「「辞：：や」」める",
    "「「見：：み」」せる",
    "「「降：：お」」りる",
    "「「浴：：あ」」びる",
    "「「入：：い」」れる",
    "「「覚：：おぼ」」える",
    "「「忘：：わす」」れる",
    "できる",
    "「「集：：あつ」」める",
    "「「捨：：す」」てる",
    "「「換：：か」」える",
    "「「調：：しら」」べる",
    "「「足：：た」」りる",
    "「「負：：ま」」ける",
    "「「着：：き」」る",
    "「「生：：う」」まれる",
    "「「変：：か」」える",
    "「「考：：かんが」」える",
];
const category3words = [
    "「「勉：：べん」」「「強：：きょう」」する",
    "「「変：：へん」」「「換：：かん」」する",
    "する",
    "「「結：：けっ」」「「婚：：こん」」する",
    "「「買：：か」」い「「物：：もの」」する",
    "「「食：：しょく」」「「事：：じ」」する",
    "「「散：：さん」」「「歩：：ぽ」」する",
    "コピーする",
    "「「研：：けん」」「「究：：きゅう」」する",
    "「「心：：しん」」「「配：：ぱい」」する",
    "「「残：：ざん」」「「業：：ぎょう」」する",
    "「「出：：しゅっ」」「「張：：ちょう」」する",
    "「「運：：うん」」「「転：：てん」」する",
    "「「予：：よ」」「「約：：やく」」する",
    "「「見：：けん」」「「学：：がく」」する",
    "「「掃：：そう」」「「除：：じ」」する",
    "「「洗：：せん」」「「濯：：たく」」する",
    "「「練：：れん」」「「習：：しゅう」」する",
    "「「修：：しゅう」」「「理：：り」」する",
    "「「電：：でん」」「「話：：わ」」する",
    "「「引：：ひ」」っ「「越：：こ」」しする",
    "「「紹：：しょう」」「「介：：かい」」する",
    "「「案：：あん」」「「内：：ない」」する",
    "「「説：：せつ」」「「明：：めい」」する",
    "「「留：：りゅう」」「「学：：がく」」する",
];

// category0
const strangeWords = ["「「行：：い」」く", "「「来：：く」」る", "くれる", "「「問：：と」」う"];


type WordRT = {
    word: string;
    category: number;
}
const words: WordRT[] = [...strangeWords.map(w => ({ word: w, category: 0 })), ...category1words.map(w => ({ word: w, category: 1 })), ...category2words.map(w => ({ word: w, category: 2 })), ...category3words.map(w => ({ word: w, category: 3 }))]

const getAllConjugationOfCategory3Word = (word: WordRT) => {
    const withOnlyRoot = word.word.slice(0, word.word.length - 2);
    return {
        [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'しない',
        [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'するな',
        [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'しよう',
        [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'した',
        [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'できる',
        [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'すれば',
        [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'しろ',
        [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'する',
        [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'し',
        [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'させる',
        [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'して',
        [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'される',
    }
}

const getAllConjugationOfCategor1Word = (word: WordRT) => {

    const withOnlyRoot = word.word.slice(0, word.word.length - 1);
    const conjugatedPart = word.word.slice(-1);
    switch (conjugatedPart) {
        case 'う': return {
            [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'わない',
            [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'うな',
            [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'おう',
            [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'った',
            [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'える',
            [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'えば',
            [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'え',
            [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'う',
            [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'い',
            [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'わせる',
            [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'って',
            [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'われる',
        }
        case 'く': return {
            [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'かない',
            [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'くな',
            [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'こう',
            [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'いた',
            [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'ける',
            [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'けば',
            [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'け',
            [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'く',
            [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'き',
            [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'かせる',
            [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'いて',
            [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'かれる',
        }
        case 'ぐ': return {
            [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'がない',
            [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'ぐな',
            [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'ごう',
            [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'いだ',
            [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'げる',
            [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'げば',
            [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'げ',
            [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'ぐ',
            [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'ぎ',
            [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'がせる',
            [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'いで',
            [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'がれる',
        }
        case 'す': return {
            [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'さない',
            [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'すな',
            [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'そう',
            [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'した',
            [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'せる',
            [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'せば',
            [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'せ',
            [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'す',
            [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'し',
            [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'させる',
            [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'して',
            [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'される',
        }
        case 'つ': return {
            [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'たない',
            [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'つな',
            [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'とう',
            [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'った',
            [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'てる',
            [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'てば',
            [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'て',
            [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'つ',
            [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'ち',
            [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'たせる',
            [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'って',
            [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'たれる',
        }
        case 'ぬ': return {
            [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'なない',
            [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'ぬな',
            [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'のう',
            [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'んだ',
            [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'ねる',
            [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'ねば',
            [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'ね',
            [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'ぬ',
            [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'に',
            [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'なせる',
            [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'んで',
            [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'なれる',
        }
        case 'ぶ': return {
            [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'ばない',
            [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'ぶな',
            [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'ぼう',
            [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'んだ',
            [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'べる',
            [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'べば',
            [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'べ',
            [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'ぶ',
            [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'び',
            [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'ばせる',
            [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'んで',
            [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'ばれる',
        }
        case 'む': return {
            [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'まない',
            [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'むな',
            [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'もう',
            [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'んだ',
            [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'める',
            [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'めば',
            [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'め',
            [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'む',
            [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'み',
            [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'ませる',
            [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'んで',
            [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'まれる',
        }
        case 'る': return {
            [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'らない',
            [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'るな',
            [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'ろう',
            [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'った',
            [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'れる',
            [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'れば',
            [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'れ',
            [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'る',
            [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + 'り',
            [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'らせる',
            [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'って',
            [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'られる',
        }
    }

}

const getAllConjugationOfCategor2Word = (word: WordRT) => {
    const withOnlyRoot = word.word.slice(0, word.word.length - 1);
    return {
        [JAPANESE_VERB_KATSUYOU.HT]: withOnlyRoot + 'ない',
        [JAPANESE_VERB_KATSUYOU.HTML]: withOnlyRoot + 'るな',
        [JAPANESE_VERB_KATSUYOU.IK]: withOnlyRoot + 'よう',
        [JAPANESE_VERB_KATSUYOU.KK]: withOnlyRoot + 'た',
        [JAPANESE_VERB_KATSUYOU.KN]: withOnlyRoot + 'られる',
        [JAPANESE_VERB_KATSUYOU.KT]: withOnlyRoot + 'れば',
        [JAPANESE_VERB_KATSUYOU.ML]: withOnlyRoot + 'ろ',
        [JAPANESE_VERB_KATSUYOU.RT]: withOnlyRoot + 'る',
        [JAPANESE_VERB_KATSUYOU.RY]: withOnlyRoot + '',
        [JAPANESE_VERB_KATSUYOU.SE]: withOnlyRoot + 'させる',
        [JAPANESE_VERB_KATSUYOU.TE]: withOnlyRoot + 'て',
        [JAPANESE_VERB_KATSUYOU.UM]: withOnlyRoot + 'られる',
    }
}


const getAllConjugationOfStrangeWord = (word: WordRT) => {
    const ruby = decodeRubyWithFallback(word.word);
    const main = ruby.mainOnlyText;

    switch (main) {
        case '行く': return {
            ...getAllConjugationOfCategor1Word(word),
            [JAPANESE_VERB_KATSUYOU.KK]: '「「行：：い」」った',
            [JAPANESE_VERB_KATSUYOU.TE]: '「「行：：い」」って',
        }
        case '問う': return {
            ...getAllConjugationOfCategor1Word(word),
            [JAPANESE_VERB_KATSUYOU.KK]: '「「問：：と」」うた',
            [JAPANESE_VERB_KATSUYOU.TE]: '「「問：：と」」うて',
        }
        case 'くれる': return {
            ...getAllConjugationOfCategor2Word(word),
            [JAPANESE_VERB_KATSUYOU.ML]: 'くれ',
        }
        case '来る': return {
            [JAPANESE_VERB_KATSUYOU.HT]: '「「来：：こ」」ない',
            [JAPANESE_VERB_KATSUYOU.HTML]: '「「来：：く」」るな',
            [JAPANESE_VERB_KATSUYOU.IK]: '「「来：：き」」よう',
            [JAPANESE_VERB_KATSUYOU.KK]: '「「来：：き」」た',
            [JAPANESE_VERB_KATSUYOU.KN]: '「「来：：こ」」（ら）れる',
            [JAPANESE_VERB_KATSUYOU.KT]: '「「来：：く」」れば',
            [JAPANESE_VERB_KATSUYOU.ML]: '「「来：：こ」」い',
            [JAPANESE_VERB_KATSUYOU.RT]: '「「来：：く」」る',
            [JAPANESE_VERB_KATSUYOU.RY]: '「「来：：き」」',
            [JAPANESE_VERB_KATSUYOU.SE]: '「「来：：こ」」させる',
            [JAPANESE_VERB_KATSUYOU.TE]: '「「来：：き」」て',
            [JAPANESE_VERB_KATSUYOU.UM]: '「「来：：こ」」られる',
        }
    }
}

export const getAllConjugationOfAWord = (word: WordRT) => {
    switch (word.category) {
        case 0: return { ...getAllConjugationOfStrangeWord(word), category: 0, originalWord: word.word }
        case 1: return { ...getAllConjugationOfCategor1Word(word), category: 1, originalWord: word.word }
        case 2: return { ...getAllConjugationOfCategor2Word(word), category: 2, originalWord: word.word }
        case 3: return { ...getAllConjugationOfCategory3Word(word), category: 3, originalWord: word.word }
    }
}
export default function getConjugationSet() {
    return words.map(w => getAllConjugationOfAWord(w));
}