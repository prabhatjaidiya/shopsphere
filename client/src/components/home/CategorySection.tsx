import CategoryCard from "./CategoryCard";

const categories = [
    {
        id: 1,
        name: "Electronics",
        icon: "🎧",
    },
    {
        id: 2,
        name: "Fashion",
        icon: "👕",
    },
    {
        id: 3,
        name: "Shoes",
        icon: "👟",
    },
    {
        id: 4,
        name: "Accessories",
        icon: "👜",
    },
];

const CategorySection = () => {
    return (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                    Shop by Category
                </h2>

                <p className="mt-2 text-gray-600">
                    Explore our popular product categories.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        name={category.name}
                        icon={category.icon}
                    />
                ))}
            </div>
        </section>
    );
};

export default CategorySection;