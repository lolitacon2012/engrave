import { ChangableUserData } from "cafe-types/userData";

type UpdateUserInfoRequestData = Partial<ChangableUserData> & {
    setLastStudied?: boolean
};

export type { UpdateUserInfoRequestData };