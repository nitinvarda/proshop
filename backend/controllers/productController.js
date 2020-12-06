import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';










// @desc Fetch Single product
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (product) {
        res.json(product)
    }
    else {
        res.status(404).json({ message: 'Product not found' })

    }
})






// @desc Create new reivew
// @route POST /api/products/:id/reviews
// @access Private


const createProductReview = asyncHandler(async (req, res) => {
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



})


// @desc Get top rated products
// @route GET /api/products/top
// @access Public


const getTopProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ rating: -1 }).limit(3)

    res.json(products)

})

export { getProducts, getProductById, deleteProduct, createProduct, updateProduct, createProductReview, getTopProducts }