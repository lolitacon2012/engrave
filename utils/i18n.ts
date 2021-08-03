import { Locale } from "cafe-types/i18n";
import { DEFAULT_LOCALE } from "cafe-constants/index";
import translations from "i18n/translations.json";

const supportedLocalesMap: { [key: string]: string } = { 'EN': 'EN_US', 'ZH': 'ZH_CN' };
const getTranslation = (key: string, locale?: Locale) => {
    const allTranslations = translations as {
        [key: string]: {
            [key: string]: string
        }
    };
    const keyTranslation = allTranslations[key] || {};
    return keyTranslation[locale as string] || keyTranslation[Locale.ZH_CN] || key;
}

const getLocaleFromAcceptLanguagesHeader = (header: string) => {
    //  'en-US,en;q=0.9,ja;q=0.8,zh-CN;q=0.7,zh;q=0.6,en-SG;q=0.5,zh-SG;q=0.4,ja-JP;q=0.3,zh-TW;q=0.2,ko;q=0.1'
    const localesWithQ: { locale: string, q: number }[] = header.split(',').map((l) => {
        const normalized = (l || 'en-US').toUpperCase().replace('-', '_');
        const locale = normalized.split(';')[0].split('_')[0] || 'EN';
        const q = Number.parseFloat(normalized.split(';')[0].split('_')[1] || '0.9');
        return {
            locale, q
        }
    }).sort((a, b) => a.q - b.q);
    for (let i = 0; i < localesWithQ.length; i++) {
        const cL = localesWithQ[i].locale;
        if (supportedLocalesMap[cL]) {
            return supportedLocalesMap[cL]
        }
    }
    return DEFAULT_LOCALE;
}
export { getLocaleFromAcceptLanguagesHeader };
export default getTranslation;