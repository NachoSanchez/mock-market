# API – Mock Mercado (Next.js 15)

Pequeña guía para los endpoints del mock. Pensado para **App Router** y lectura desde archivos JSON locales.

## Quick Start

1. Crear carpeta `data/` en la raíz del proyecto Next.
2. Copiar allí:
   - `data/categories.json` (con `{ id, name, slug }`)
   - `data/products.json` (con `{ id, name, brand, price, currency, image, category_id }`)
3. Iniciar el proyecto y probar los endpoints listados abajo.

> Los handlers cachean en memoria del proceso y envían `Cache-Control` público.

---

## Datos (formatos)

**`data/categories.json`**
```json
[
  { "id": 1, "name": "vinos tintos", "slug": "vinos-tintos" },
  { "id": 2, "name": "gaseosas", "slug": "gaseosas" }
]
```

**`data/products.json`** (o `products-with-category-id.json`)
```json
[
  {
    "id": "uuid",
    "name": "Nachos sabor a queso Doritos 200 g.",
    "brand": "Doritos",
    "price": 4499.4,
    "currency": "ARS",
    "image": "https://.../ids/538136-300-300?...",
    "category_id": 10
  }
]
```

---

## Endpoints

### Health
`GET /api/health`  
**200** → `{ "ok": true, "ts": 1699999999999 }`

---

### Categorías

#### Listado
`GET /api/categories`  
**200** → `Category[]`
```json
[
  { "id": 1, "name": "vinos tintos", "slug": "vinos-tintos" },
  { "id": 2, "name": "gaseosas", "slug": "gaseosas" }
]
```

#### Por ID
`GET /api/categories/:id`  
**200** → `Category`  
**404** → `{ "error": "Category not found" }`

#### Por slug
`GET /api/categories/slug/:slug`  
**200** → `Category`  
**404** → `{ "error": "Category not found" }`

---

### Productos (búsqueda/listado)

`GET /api/products`

**Query params**
- `query` / `q`: texto libre (busca en `name` y `brand`)
- `categoryId`: filtra por ID de categoría
- `categorySlug`: filtra por `slug` (se resuelve a `categoryId`)
- `minPrice`, `maxPrice`: rango de precio (numéricos)
- `page` (default: `1`)
- `pageSize` (default: `24`)
- `sort`: `name_asc` | `name_desc` | `price_asc` | `price_desc` (default: `name_asc`)

**200** → `Paginated<Product> & { facets }`
```json
{
  "total": 120,
  "page": 1,
  "pageSize": 24,
  "items": [
    {
      "id": "uuid",
      "name": "Vino tinto Malbec ...",
      "brand": "X",
      "price": 5999,
      "currency": "ARS",
      "image": "https://.../300-300?...",
      "category_id": 1
    }
  ],
  "facets": {
    "categories": [
      { "id": 1, "name": "vinos tintos", "slug": "vinos-tintos", "count": 48 },
      { "id": 10, "name": "snacks", "slug": "snacks", "count": 32 }
    ],
    "priceRange": { "min": 799, "max": 19999 }
  }
}
```

**Ejemplos**
- `/api/products?q=malbec&sort=price_desc`
- `/api/products?categorySlug=snacks&page=2&pageSize=12`
- `/api/products?categoryId=5&minPrice=1000&maxPrice=5000`

---

### Productos por categoría (ID)

`GET /api/categories/:id/products`

Mismos **query params** que `/api/products` (excepto `categoryId`/`categorySlug`, ya implícito).

**200** → `Paginated<Product> & { facets }`  
**400** → `{ "error": "Invalid category id" }`  
**404** → `{ "error": "Category not found" }` *(si aplica)*

**Ejemplo**
- `/api/categories/10/products?sort=price_desc&page=1&pageSize=24`

---

### Productos por categoría (slug)

`GET /api/categories/slug/:slug/products`

Mismos **query params** que `/api/products` (excepto `categoryId`/`categorySlug`, ya implícito).

**200** → `{ category, ...Paginated<Product>, facets }`  
**404** → `{ "error": "Category not found" }`

**Ejemplo**
- `/api/categories/slug/snacks/products?q=papas&minPrice=1000&maxPrice=5000`

---

### Producto por ID

`GET /api/products/:id`  
**200** → `Product & { category }`  
**404** → `{ "error": "Product not found" }`

```json
{
  "id": "uuid",
  "name": "Nachos sabor a queso Doritos 200 g.",
  "brand": "Doritos",
  "price": 4499.4,
  "currency": "ARS",
  "image": "https://.../300-300?...",
  "category_id": 10,
  "category": { "id": 10, "name": "snacks", "slug": "snacks" }
}
```

---

## Tipos (referencia rápida)

```ts
type Category = { id: number; name: string; slug: string };

type Product = {
  id: string;           // uuid v4
  name: string;
  brand: string | null;
  price: number | null;
  currency: string;     // "ARS"
  image: string | null;
  category_id: number;
};

type Paginated<T> = {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
};
```

---

## Notas

- **Ordenamiento**: cuando `price` es `null`, esos ítems quedan al final en `price_asc` y al principio en `price_desc` (se puede ajustar).
- **Búsqueda**: case-insensitive con `toLocaleLowerCase('es')` y `Intl.Collator` para orden por nombre.
- **Cache**: simple in-memory por proceso + headers `Cache-Control`.
- **Datos**: si usás `products-with-category-id.json`, podés renombrarlo a `products.json` o dejar el loader con fallback.
