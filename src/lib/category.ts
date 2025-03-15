import { readJson } from "./json-utils.ts";

export interface Category {
    id: number;
    name: string;
}


export const getCategories = (): Category[] => {
    return readJson('../categories.json');
}