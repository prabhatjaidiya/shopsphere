import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const port = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`ShopSphere API running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();