export function toArray<T>(emptyValue: T, data: any): T[] {
    if (!data) {
        return [];
    }
    return data.docs.map(d => {
        return {
            ...emptyValue, ...d.data(), ...{Id: d.id},
        };
    });
}

export function toObject<T>(emptyValue: T, d: any): T {
    if (!d) {
        return null;
    }
    return {
        ...emptyValue, ...d.data(), ...{Id: d.id}
    };
}
