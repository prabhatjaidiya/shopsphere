import { Link } from "react-router-dom";

const HeroSection = () => {
    return (
        <section className="bg-gray-100">
            <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 lg:px-8 lg:py-24">
                {/* Content */}
                <div>
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-600">
                        Welcome to ShopSphere
                    </p>

                    <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
                        Shop the latest products
                    </h1>

                    <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
                        Discover quality products, great deals, and everything you need in
                        one place.
                    </p>

                    <div className="mt-8">
                        <Link
                            to="/products"
                            className="inline-flex rounded-lg bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800"
                        >
                            Shop Now
                        </Link>
                    </div>
                </div>

                {/* Visual */}
                <div className="relative min-h-72 overflow-hidden rounded-2xl bg-gray-200 sm:min-h-96">
                    <img
                        src="https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1200&q=85"
                        alt="Modern shopping collection with products"
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="eager"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-xl font-semibold">ShopSphere</p>
                        <p className="mt-1 text-sm text-white/90">
                            Everything you need, in one place.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;