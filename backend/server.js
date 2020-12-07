import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan'
import db from './config/db.js'
import colors from 'colors';
import mongoose from 'mongoose';
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';


const app = express();

app.use(express.json())
dotenv.config()



if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}



var gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: 'proshop' });






app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes)
app.use("/api/upload", uploadRoutes)


app.get("/api/image/:filename", function (req, res, next) {

    gfs.find({ filename: req.params.filename }).toArray((err, file) => {

        // if the filename exist in database
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'no files exist'
            });
        }

        // creating stream to read the image which is stored in chunks 
        const readStream = gfs.openDownloadStreamByName(file[0].filename);
        // this is will display the image directly
        readStream.pipe(res);
    })

})

app.get('/api/config/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID)
})





const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/build')))
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html')))
}




app.use(notFound)
app.use(errorHandler)


const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} on port ${PORT}`))

