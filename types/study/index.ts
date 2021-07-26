type StudyProgress = {
    id: string;
    deck_id: string;
    started_at: number;
    creator_id: string;
    single_section_size: number;
    progress: {
        word_id: string;
        rate: number;
        finished_at: number;
    }[];
    question_from_field_name: string;
    answer_to_field_name: string;
}

export type { StudyProgress };