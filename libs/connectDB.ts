import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return ("Already connected to the db!")
    try {
        mongoose.connection.on('error', (error) => {
            console.log('DB Fehler nach initialer Verbindung:', error);
        });

        await mongoose.connect(process.env.MONGO_URL || "", {
            dbName: process.env.DATABASE
        });
        console.log('Connected to MongoDB!');
        isConnected = true;
    } catch (error) {
        console.error('Connection error:', error);
    }
};
