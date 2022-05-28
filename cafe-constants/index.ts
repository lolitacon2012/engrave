export const DEFAULT_LOCALE = 'ZH_CN';
export const RECOMMEND_THEME_COLORS = ['#e42c64', '#5bd1d7', '#1ee3cf', '#8134af', '#dd2a7b', '#eec60a', '#2d2d2d', '#2E94B9', '#A94CAF', '#6abe83', '#593E1A', '#00a03e', '#3366CC', '#791E94', '#FF82A9', '#b38766'];
export const DEFAULT_STUDY_SET_SIZE = 24;
export const NEW_PROGRESS_TEMPLATE = {
    section_size: DEFAULT_STUDY_SET_SIZE,
    use_random_order: false,
    use_ruby_only: false,
    use_easy_mode: false,
    has_started: false,
    level_0: [],
    level_1: [],
    level_2: [],
    level_3: [],
    level_4: [],
    level_5: [],
    level_6: [],
    level_7: [],
    level_8: [],
    level_9: [],
    level_10: [],
}

// 連体　連用　て形　過去　否定　可能　意向　命令　否定命令　仮定　使役　受身
// RT   RY    TE    KK   HT    KN   IK    ML   HTML     KT   SE    UM
export enum JAPANESE_VERB_KATSUYOU {
    RT = 'RT',
    RY = 'RY',
    TE = 'TE',
    KK = 'KK',
    HT = 'HT',
    KN = 'KN',
    IK = 'IK',
    ML = 'ML',
    HTML = 'HTML',
    KT = 'KT',
    SE = 'SE',
    UM = 'UM'
}