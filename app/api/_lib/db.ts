import { promises as fs } from "fs";
import path from "path";
import type { Category, Product } from "../_lib/types";


const DATA_DIR = path.join(process.cwd(), "data");


let cache: { categories: Category[]; products: Product[] } | null = null;


async function readJson<T = unknown>(file: string): Promise<T> {
    const filePath = path.join(DATA_DIR, file);
    const raw = await fs.readFile(filePath, "utf8");

    return JSON.parse(raw) as T;
}


export async function loadDB() {
    if (cache) return cache;    

    const [categories, products] = await Promise.all([
        readJson<Category[]>("categories.json"),
        readJson<Product[]>("products.json"),
    ]);
    cache = { categories, products };

    return cache;
}


export function resetDBCache() {
    cache = null;
}