import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js'
import db from '../config/db.js';
import mongoose from 'mongoose';
import path from 'path'
import multer from 'multer';
import GridFsStorage from 'multer-gridfs-storage';
import crypto from 'crypto'
import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js'

const router = express.Router()
var gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: 'proshop' });


var storage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            // crypto creates 16 random numbers 
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                // the random numbers are converted to string and stored with the image original file extension like jpg,png..etc
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    // filename consists of new filename
                    filename: filename,
                    bucketName: 'proshop'
                };
                resolve(fileInfo);
            });
        });
    }
});
// using multer for handling multipart/form-data
var upload = multer({ storage });

router.route('/')
    .get(asyncHandler(async (req, res) => {
        const pageSize = 5
        const page = Number(req.query.pageNumber) || 1
        const keyword = req.query.keyword ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i'
            }
        } : {}
        const count = await Product.countDocuments({ ...keyword })
        const products = await Product.find({ ...keyword }).limit(pageSize).skip(pageSize * (page - 1))


        res.json({ products, page, pages: Math.ceil(count / pageSize) })
    }))
    .post(protect, admin, upload.single("productImage"), asyncHandler(async (req, res) => {

        const { name,
            price,
            description,
            brand,
            category,
            countInStock,
            rating
        } = req.body
        const product = new Product({
            name: name,
            price: Number(price),
            user: req.user._id,
            image: req.file.filename,
            brand: brand,
            category: category,
            countInStock: Number(countInStock),
            numReviews: 0,
            description: description,
            rating: Number(rating)
        })

        const createProduct = await product.save()
        res.status(201).json(createProduct)
    }))

router.get('/top', asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ rating: -1 }).limit(3)

    res.json(products)

}))


router.route('/:id')
    .get(asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id)

        if (product) {
            res.json(product)
        }
        else {
            res.status(404).json({ message: 'Product not found' })

        }
    }))
    .delete(protect, admin, asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id)

        if (product) {
            gfs.find({ filename: product.image }).toArray((err, image) => {
                if (!image || image.length === 0) {
                    return res.status(404).json({
                        // send response as no files exist
                        err: 'no files exist'
                    });
                }
                else {
                    // if found imagefile if first delete them
                    // so that we can update with other

                    const id = new mongoose.Types.ObjectId(image[0]._id)
                    gfs.delete(id, (err, complete) => {
                        if (err) {
                            return next(err);

                        }


                    })
                }
            })
            await product.remove()
            res.json({ message: 'Product removed' })
        }
        else {
            res.status(404).json({ message: 'Product not found' })

        }
    }))
    .put(protect, admin, upload.single("productImage"), asyncHandler(async (req, res) => {
        const { name,
            price,
            description,
            image,
            brand,
            category,
            countInStock
        } = req.body

        const product = await Product.findById(req.params.id)
        if (product) {

            gfs.find({ filename: product.image }).toArray((err, image) => {
                if (!image || image.length === 0) {
                    return res.status(404).json({
                        // send response as no files exist
                        err: 'no files exist'
                    });
                }

                else {
                    // if found imagefile if first delete them
                    // so that we can update with other

                    const id = new mongoose.Types.ObjectId(image[0]._id)
                    gfs.delete(id, (err, complete) => {
                        if (err) {
                            return next(err);

                        }


                    })
                }
            })

            product.name = name
            product.price = price
            product.description = description
            product.image = req.file.filename
            product.brand = brand
            product.category = category
            product.countInStock = countInStock

            const updatedProduct = await product.save()
            res.status(201).json(updatedProduct)

        } else {
            res.status(404)
            throw new Error('Product not found');
        }



    }))


router.route('/:id/reviews')
    .post(protect, asyncHandler(async (req, res) => {
        const { name,
            rating,
            comment
        } = req.body

        const product = await Product.findById(req.params.id)
        if (product) {
            const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString())

            if (alreadyReviewed) {
                res.status(400)
                throw new Error('Proudct already reviewed')
            }
            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id
            }
            product.reviews.push(review)
            product.numReviews = product.reviews.length
            product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

            await product.save()

            res.status(201).json({ message: 'Review added' })

        } else {
            res.status(404)
            throw new Error('Product not found');
        }



    }))
    .delete(protect, asyncHandler(async (req, res) => {
        const product = await Product.findById(req.params.id)
        if (product) {
            const afterDeleting = product.reviews.filter(review => review.user.toString() !== req.user._id.toString())
            product.reviews = afterDeleting

            product.numReviews = product.reviews.length
            if (product.numReviews == 0) {
                product.rating = 0;
            }
            else {

                product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
            }



            await product.save()

            res.status(201).json({ message: 'Review deleted' })

        }
        else {
            res.status(404)
            throw new Error('Product not found');
        }


    }))




export default router