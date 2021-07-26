import { Locale } from "cafe-types/i18n";
import translations from "i18n/translations.json";

const getTranslation = (key: string, locale?: Locale) => {
    const allTranslations = translations as {[key: string]: {
        [key: string]: string
    }};
    const keyTranslation = allTranslations[key] || {};
    return keyTranslation[locale as string] || keyTranslation[Locale.ZH_CN] || key;
}

export default getTranslation;