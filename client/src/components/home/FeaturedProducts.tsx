import ProductCard from "./ProductCard";

const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 2499,
        rating: 4.4,
    },
    {
        id: 2,
        name: "Mechanical Keyboard",
        price: 3499,
        rating: 4.7,
    },
    {
        id: 3,
        name: "Running Shoes",
        price: 2999,
        rating: 4.5,
    },
    {
        id: 4,
        name: "Smart Watch",
        price: 4999,
        rating: 4.6,
    },
];

const FeaturedProducts = () => {
    return (
        <section className="bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Featured Products
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Discover some of our most popular products.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            id={product.id}
                            key={product.id}
                            name={product.name}
                            price={product.price}
                            rating={product.rating}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;