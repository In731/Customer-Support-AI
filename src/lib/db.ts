import { connect } from "mongoose";

const mongo_Url = process.env.MONGODB_URL;

if (!mongo_Url) {
    console.error("Critical: MONGODB_URL environment variable is not defined");
}

let cache = global.mongoose;

if (!cache) {
    cache = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    if (cache.conn) {
        return cache.conn;
    }

    if (!mongo_Url) {
        throw new Error("MONGODB_URL is not defined in environment variables.");
    }

    if (!cache.promise) {
        cache.promise = connect(mongo_Url, { family: 4 }).then((c) => c.connection);
    }

    try {
        cache.conn = await cache.promise;
    } catch (error) {
        // Reset cached promise on failure so subsequent requests can retry cleanly
        cache.promise = null;
        console.error("MongoDB connection failed:", error);
        throw error;
    }

    return cache.conn;
};

export default connectDb;