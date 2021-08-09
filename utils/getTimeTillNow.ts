export const getTimeString = (time?: number) => {
    const emptyPlaceholder = {
        'yyyy': '', 'mm': '', 'dd': ''
    };
    if (!time) {
        return {
            key: 'time_unknown', placeholder: emptyPlaceholder
        }
    }
    const now = new Date().getTime();
    if (now - time < (60 * 60 * 1000)) {
        return { key: 'time_just_now', placeholder: emptyPlaceholder }
    } else if (now - time < (24 * 60 * 60 * 1000)) {
        return { key: 'time_today', placeholder: emptyPlaceholder }
    } else if (now - time < (2 * 24 * 60 * 60 * 1000)) {
        return { key: 'time_yesterday', placeholder: emptyPlaceholder }
    } else if (now - time < (3 * 24 * 60 * 60 * 1000)) {
        return { key: 'time_2_days_ago', placeholder: emptyPlaceholder }
    } else {
        const date = new Date(time);
        return {
            key: 'time_yyyy_mm_dd', placeholder: {
                'yyyy': '' + date.getFullYear(),
                'mm': ('0' + (date.getMonth() + 1)).slice(-2),
                'dd': ('0' + (date.getDate())).slice(-2),
            }
        }
    }
}