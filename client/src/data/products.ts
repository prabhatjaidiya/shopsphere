export type ProductId = string | number;

export interface Product {
  id: ProductId;
  name: string;
  category: string;
  price: number;
  rating: number;
  description?: string;
  stock?: number;
  image?: string;
  images?: string[];
}

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  stock: number;
  images: string[];
  rating: number;
}

export interface ProductsApiResponse {
  success: boolean;
  data: ApiProduct[];
  pagination: {
    page: number;
    limit: number;
    totalProducts: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function mapApiProduct(product: ApiProduct): Product {
  return {
    id: product._id,
    name: product.name,
    category: product.category.name,
    price: product.price,
    rating: product.rating,
    description: product.description,
    stock: product.stock,
    images: product.images,
    image: product.images[0],
  };
}

export const products: Product[] = [
  // Electronics
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 2999,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Electronics",
    price: 5999,
    rating: 4.7,
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    category: "Electronics",
    price: 3499,
    rating: 4.6,
  },
  {
    id: 4,
    name: "Wireless Mouse",
    category: "Electronics",
    price: 1499,
    rating: 4.4,
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: 2499,
    rating: 4.5,
  },
  {
    id: 6,
    name: "USB-C Hub",
    category: "Electronics",
    price: 1799,
    rating: 4.3,
  },

  // Shoes
  {
    id: 7,
    name: "Running Shoes",
    category: "Shoes",
    price: 3999,
    rating: 4.8,
  },
  {
    id: 8,
    name: "Casual Sneakers",
    category: "Shoes",
    price: 2999,
    rating: 4.5,
  },
  {
    id: 9,
    name: "Sports Shoes",
    category: "Shoes",
    price: 4499,
    rating: 4.6,
  },
  {
    id: 10,
    name: "Walking Shoes",
    category: "Shoes",
    price: 2499,
    rating: 4.3,
  },
  {
    id: 11,
    name: "Classic Sneakers",
    category: "Shoes",
    price: 3299,
    rating: 4.4,
  },

  // Fashion
  {
    id: 12,
    name: "T-Shirt",
    category: "Fashion",
    price: 999,
    rating: 4.2,
  },
  {
    id: 13,
    name: "Denim Jacket",
    category: "Fashion",
    price: 2499,
    rating: 4.6,
  },
  {
    id: 14,
    name: "Cotton Shirt",
    category: "Fashion",
    price: 1599,
    rating: 4.4,
  },
  {
    id: 15,
    name: "Hoodie",
    category: "Fashion",
    price: 1999,
    rating: 4.5,
  },
  {
    id: 16,
    name: "Cargo Pants",
    category: "Fashion",
    price: 2299,
    rating: 4.3,
  },

  // Accessories
  {
    id: 17,
    name: "Leather Wallet",
    category: "Accessories",
    price: 899,
    rating: 4.4,
  },
  {
    id: 18,
    name: "Sunglasses",
    category: "Accessories",
    price: 1299,
    rating: 4.2,
  },
  {
    id: 19,
    name: "Leather Belt",
    category: "Accessories",
    price: 999,
    rating: 4.3,
  },
  {
    id: 20,
    name: "Backpack",
    category: "Accessories",
    price: 1999,
    rating: 4.6,
  },
  {
    id: 21,
    name: "Baseball Cap",
    category: "Accessories",
    price: 699,
    rating: 4.1,
  },
  {
    id: 22,
    name: "Travel Bag",
    category: "Accessories",
    price: 2799,
    rating: 4.5,
  },
];