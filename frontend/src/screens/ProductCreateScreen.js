import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { listProductDetails, createProduct } from '../actions/productActions';
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants';


const ProductCreateScreen = ({ match, history }) => {
    const productId = match.params.id

    const [name, setName] = useState('')
    const [price, setPrice] = useState(0)
    const [image, setImage] = useState('')
    const [brand, setBrand] = useState('')
    const [category, setCategory] = useState('')
    const [countInStock, setCountInStock] = useState(0)
    const [description, setDescription] = useState('')
    const [uploading, setUploading] = useState(false)


    const dispatch = useDispatch();


    const productDetails = useSelector(state => state.productDetails)
    const { loading, error, product } = productDetails


    const productUpdate = useSelector(state => state.productUpdate)
    const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate




    useEffect(() => {
        // if (successUpdate) {
        //     dispatch({ type: PRODUCT_UPDATE_RESET })
        //     history.push('/admin/productlist')
        // }
        // else {
        //     // if there is an existing user already,
        //     //  we check if the user._id is equal to requested id,
        //     //  if not then we go and fetch that user else we show that details
        //     if (!product.name || product._id !== productId) {
        //         dispatch(listProductDetails(productId))

        //     }
        //     else {
        //         setName(product.name)
        //         setPrice(product.price)
        //         setDescription(product.description)
        //         setCategory(product.category)
        //         setBrand(product.brand)
        //         setImage(product.image)
        //         setCountInStock(product.countInstock)

        //     }
        // }


    }, [history, product, productId, dispatch, successUpdate])

    const submitHandler = (e) => {
        e.preventDefault();
        console.log(name,
            price,
            image,
            brand,
            description,
            countInStock,
            category)
        dispatch(createProduct({
            name,
            price,
            image,
            brand,
            description,
            countInStock,
            category
        }))


    }
    const uploadFileHandler = async (e) => {
        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('image', file)
        setUploading(true)
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }

            const { data } = await axios.post('/api/upload', formData, config)
            console.log(data)
            setImage(data)
            setUploading(false)
        }
        catch (err) {
            console.log(err)
            setUploading(false)

        }

    }
    return (
        <>
            <Link to='/admin/productlist' className='btn btn-light my-3'>
                Go Back
            </Link>
            <FormContainer>
                <h1>Add Product</h1>
                {loadingUpdate && <Loader />}
                {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
                {loading ? <Loader /> : error ? <Message variant='danger'>{error}</Message> :
                    (
                        <Form onSubmit={submitHandler}>
                            <Form.Group controlId='name'>
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" placeholder='Enter name' value={name} onChange={(e) => setName(e.target.value)} ></Form.Control>


                            </Form.Group>
                            <Form.Group controlId='price'>
                                <Form.Label>Price </Form.Label>
                                <Form.Control type="number" placeholder='Enter Price' value={price} onChange={(e) => setPrice(e.target.value)} ></Form.Control>


                            </Form.Group>
                            <Form.Group controlId='image'>
                                <Form.Label>Image</Form.Label>

                                <Form.File id='image-file' label='Choose File' onChange={(e) => setImage(e.target.files[0])} >

                                </Form.File>
                                {uploading && <Loader />}
                            </Form.Group>

                            <Form.Group controlId='brand'>
                                <Form.Label>Brand</Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='Enter Brand'
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)} >

                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId='countInStock'>
                                <Form.Label>Count In Stock </Form.Label>
                                <Form.Control type="number" placeholder='Count In Stock' value={countInStock} onChange={(e) => setCountInStock(e.target.value)} ></Form.Control>


                            </Form.Group>
                            <Form.Group controlId='category'>
                                <Form.Label>Category</Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='Enter Category'
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)} >

                                </Form.Control>
                            </Form.Group>
                            <Form.Group controlId='description'>
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='Enter Description'
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)} >

                                </Form.Control>
                            </Form.Group>

                            <Button type="submit" variant='primary'>
                                Add
                            </Button>
                        </Form>

                    )}


            </FormContainer>
        </>
    );
}

export default ProductCreateScreen;
