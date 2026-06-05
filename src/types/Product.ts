export type Category = 'Électronique' | 'Vêtements' | 'Alimentation' | 'Autre';

export interface Product {
    id: number,
    name: string,
    price: number,
    stock: number,
    category: Category
}

