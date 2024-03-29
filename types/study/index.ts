import { Word } from "cafe-types/deck";

type StudyProgress = {
    has_started: boolean;
    deck_id: string;
    started_at: number;
    updated_at: number;
    section_size: number;
    use_random_order: boolean;
    use_ruby_only: boolean;
    use_easy_mode: boolean;
    level_0: string[]; // new words
    level_1: string[]; // watch done
    level_2: string[]; // repeat done
    level_3: string[]; // second repeat done
    level_4: string[]; // first review done
    level_5: string[]; // second review done
    level_6: string[]; // third review done
    level_7: string[]; // first random review done
    level_8: string[]; // second random review done
    level_9: string[]; // third random review done
    level_10: string[]; // final review done, wont ask again
}

type StudySet = {
    questions: Question[];
    temp_id: string,
}

type Question = {
    word?: Word, // could be undefined
    rank_delta: number, // 0 = no change, 1 -1 etc.
    question_type: string,
    word_id: string
}

export type { StudyProgress, StudySet, Question };

// a new word: watch once, repeat once, 