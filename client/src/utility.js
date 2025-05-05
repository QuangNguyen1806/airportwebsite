const createQuery = (raw) => {
    let query = "";

    if (raw.append) {
        for (const key of Object.keys(raw.append)) {
            if (!raw.append[key]) continue;
            query += `${key}=${raw.append[key]}&`;
        }
    }

    if (raw.either) {
        for (const choice of raw.either) {
            for (const key of Object.keys(choice)) {
                if (!choice[key]) continue;
                query += `${key}=${choice[key]}&`;
                break;
            }
        }
    }

    query = query ? query.substring(0, query.length - 1) : query;

    return query;
};

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
};

export { createQuery, getCookie };
