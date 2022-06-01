import { StudyProgress } from "cafe-types/study";
import { ChangableUserData } from "cafe-types/userData";

type UpdateUserInfoRequestData = Partial<ChangableUserData> & {
    setLastStudied?: boolean
};

type UpdateProgressData = {
    progress: StudyProgress,
    setLastStudied?: boolean
};

export type { UpdateUserInfoRequestData, UpdateProgressData };