interface ProductCardProps {
    name: string;
    price: number;
    rating: number;
}

const ProductCard = ({
    name,
    price,
    rating,
}: ProductCardProps) => {
    return (
        <article className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            {/* Product Image */}
            <div className="flex h-56 w-full min-w-0 items-center justify-center overflow-hidden bg-gray-100">
                <span className="text-6xl">🛍️</span>
            </div>

            {/* Product Information */}
            <div className="w-full min-w-0 p-5">
                <h3 className="min-w-0 truncate text-lg font-semibold text-gray-900">
                    {name}
                </h3>

                <div className="mt-2 flex items-center gap-1 text-sm">
                    <span className="shrink-0">⭐</span>

                    <span className="font-medium text-gray-700">
                        {rating}
                    </span>
                </div>

                <p className="mt-3 text-xl font-bold text-gray-900">
                    ₹{price.toLocaleString("en-IN")}
                </p>

                <button
                    type="button"
                    className="mt-4 block w-full max-w-full rounded-lg bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
                >
                    Add to Cart
                </button>
            </div>
        </article>
    );
};

export default ProductCard;