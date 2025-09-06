import mongoose , {ConnectOptions , Connection} from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string

if(!MONGODB_URI){
    throw new Error("Mongodb Uri is missing");
}

type MongooseCache = {
    conn : Connection | null;
    promise : Promise<Connection> | null;
}

declare global {
    var mongoose : MongooseCache | undefined;
}

const cached = global.mongoose ?? (global.mongoose = {conn : null , promise : null});

export async function connectDB() : Promise<Connection>{
    if(cached.conn){
        console.log("reusing the existing database connection");
        return cached.conn;
    }

    if(!cached.promise){
        const opts : ConnectOptions = {
            bufferCommands : false,
            maxPoolSize : 10,
        }

        console.log("Initiating new database connection");
        cached.promise = mongoose.connect(MONGODB_URI , opts)
        .then((mongooseInstance)=>{
            console.log("New connection established :" , mongooseInstance.connection.host);
            return mongooseInstance.connection;
        })
        .catch((err)=>{
            cached.promise = null;
            console.error(" Initial connection failed:", err.message);
            throw err;
        })
    } else {
        console.log(" Awaiting existing connection promise...");
    }

    try {
        cached.conn = await cached.promise;
        global.mongoose = cached;
        return cached.conn;
    } catch (error) {
        cached.promise = null; 
        console.error("[Mongoose] Database connection error:", error);
        throw error;
    }
}
