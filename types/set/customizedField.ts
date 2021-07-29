enum CustomizedFieldType {
    TEXT = "TEXT",
    NUMBER = "NUMBER",
    DROPDOWN_SINGLE = "DROPDOWN_SINGLE",
    DROPDOWN_MULTIPLE = "DROPDOWN_MULTIPLE",
}
type CustomizedField = {
    id: string;
    name: string;
    type: CustomizedFieldType;
    creator_id: string;
    creator_name: string;
    creator_avatar?: string;
    customized_field_options?: string[];
}

export type { CustomizedField, CustomizedFieldType };