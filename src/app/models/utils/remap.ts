// Converts object to tuples of [prop name,prop type]
// So { a: 'Hello', b: 'World', c: '!!!' }
// will be  [a, 'Hello'] | [b, 'World'] | [c, '!!!']
type TuplesFromObject<T> = {
    [P in keyof T]: [P, T[P]]
}[keyof T];
// Gets all property  keys of a specified value type
// So GetKeyByValue<{ a: 'Hello', b: 'World', c: '!!!' }, 'Hello'> = 'a'
type GetKeyByValue<T, V> = TuplesFromObject<T> extends infer TT ?
    TT extends [infer P, V] ? P : never : never;


export const remap = <
    T extends { [key: string]: any },
    V extends string, // needed to force string literal types for mapping values
    U extends { [P in keyof T]: V }
>(original: T, mapping: U) => {
    const remapped: any = {};

    Object.keys(original).forEach(k => {
        remapped[mapping[k]] = original[k];
    });
    return remapped as {
        // Take all the values in the map,
        // so given { a: 'Hello', b: 'World', c: '!!!' }  U[keyof U] will produce 'Hello' | 'World' | '!!!'
        [P in U[keyof U]]: T[GetKeyByValue<U, P>] // Get the original type of the key in T by using GetKeyByValue to get to the original key
    };
};
