import mongoose from 'mongoose';
import colors from 'colors';
import dotenv from 'dotenv';
dotenv.config()

const connectDB = async () => {
    try {
        var conn = await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true
        })

        console.log(`MongoDB Connected:${conn.connection.host}`.cyan.underline)
    }
    catch (error) {
        console.log(`Error : ${error.message}`.red.underline.bold)
        process.exit(1)
    }
    return conn.connection.db


}

const db = await connectDB()

export default db;