import { products } from "../data/products";

const electronicsProducts = products.filter(
    (product) => product.category === "Electronics"
);

console.log(electronicsProducts);

const priceFilteredProducts = products.filter(
    (product) => product.price >= 1000 && product.price <= 5000
)

console.log(priceFilteredProducts);

const search = "shoe";

const searchProducts = products.filter(
    (product) => product.name.toLowerCase().includes(search.toLowerCase())
);

console.log(searchProducts);

const sortedProducts = [...products].sort(
    (a, b) => a.price - b.price
);

console.log(sortedProducts)