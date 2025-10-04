export interface Category {
    id: number;
    name: string;
    slug: string;
}


export interface Product {
    id: string; // uuid v4
    name: string;
    brand: string | null;
    price: number | null;
    currency: string; // "ARS"
    image: string | null;
    category_id: number;
}


export interface Paginated<T> {
    total: number;
    page: number;
    pageSize: number;
    items: T[];
}