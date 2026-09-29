import { Link } from "react-router-dom";

const PromoBanner = () => {
    return (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="overflow-hidden rounded-3xl bg-black px-6 py-12 text-center text-white sm:px-12 sm:py-16">
                <p className="text-sm font-semibold uppercase tracking-widest text-gray-300">
                    Limited Time Offer
                </p>

                <h2 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">
                    Big Sale — Up to 40% Off
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-gray-300">
                    Don't miss out on amazing deals across selected products.
                </p>

                <div className="mt-8">
                    <Link
                        to="/products"
                        className="inline-flex rounded-lg bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
                    >
                        Shop Now
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PromoBanner;