import { Link } from "react-router-dom";

interface CategoryCardProps {
    name: string;
    icon: string;
    to: string;
}

const CategoryCard = ({ name, icon, to }: CategoryCardProps) => {
    return (
        <Link to={to}>
            <div className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-20 items-center justify-center rounded-xl bg-gray-100 text-4xl transition group-hover:bg-gray-200">
                    {icon}
                </div>

                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    {name}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Explore products
                </p>
            </div>
        </Link>
    );
};

export default CategoryCard;