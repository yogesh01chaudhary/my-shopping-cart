const BigPromise = require("../middleware/bigPromise");
const ProductDB = require("../models/product");
const CustomError = require("../utils/CustomError");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");

exports.testProduct = async (req, res) => {
  try {
    {
      console.log(req.query);
      res.status(200).send({
        success: true,
        message: "Hello Radhey Welcome to Product Controller",
      });
    }
  } catch (e) {
    console.log({ error: e.name });
  }
};

//user controllers
exports.addProduct = BigPromise(async (req, res, next) => {
  let imageArray = [];
  if (!req.files) {
    return next(new CustomError("images are required", 401));
  }
  if (req.files) {
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        { folder: "products" }
      );
      imageArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }
  req.body.photos = imageArray;
  req.body.user = req.user.id;

  const product = await ProductDB.create(req.body);

  res.status(200).json({ success: true, product });
});

exports.getAllProduct = BigPromise(async (req, res, next) => {
  const resultPerPage = 6;
  const totalCountProduct = await ProductDB.countDocuments();
  //   const products = ProductDB.find({});
  const productsObj = new WhereClause(ProductDB.find(), req.query)
    .search()
    .filter();
  let products = await productsObj.base;
  const filteredProductNumber = products.length;
  productsObj.pager(resultPerPage);
  products = await productsObj.base.clone();

  res.status(200).json({
    success: true,
    products,
    filteredProductNumber,
    totalCountProduct,
  });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
  const product = await ProductDB.findById(req.params.id);
  if (!product) {
    return next(new CustomError("No product found", 400));
  }
  res.status(200).json({ success: true, product });
});

exports.addReview = BigPromise(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await ProductDB.findById(productId);

  const AlreadyReview = product.reviews.find((rev) => {
    rev.user.toString() === req.user._id.toString();
  });

  if (AlreadyReview) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => {
      item.rating + acc, 0;
    }) / product.reviews.length;

  await product.save({ validateBeforeSave: false });
  res.status(200).json({ success: true });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
  const { productId } = req.query;

  const product = await ProductDB.findById(productId);

  const reviews = product.reviews.filter((rev) => {
    rev.user.toString() === req.user._d.toString();
  });

  const numberOfReviews = reviews.length;

  product.ratings =
    product.reviews.reduce((acc, item) => {
      item.rating + acc, 0;
    }) / product.reviews.length;

  await ProductDB.findByIdAndUpdate(
    productId,
    {
      reviews,
      ratings,
      numberOfReviews,
    },
    { new: true, runValidators: true, userFindAndModify: false }
  );
  res.status(200).json({ success: true });
});

exports.getOnlyReviewsForOneProduct = BigPromise(async (req, res, next) => {
  const product = await ProductDB.findById(req.query.id);

  res.status(200).json({ success: true, reviews: product.reviews });
});

//admin controllers
exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
  let product = await ProductDB.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No Product find with this id", 404));
  }

  let imagesArray = [];

  if (req.files) {
    //destroy the saved image
    for (let index = 0; index < product.photos.length; index++) {
      const res = await cloudinary.v2.uploader.destroy(
        product.photos[index].id
      );
    }
    //upload the new images
    for (let index = 0; index < req.files.photos.length; index++) {
      let result = await cloudinary.v2.uploader.upload(
        req.files.photos[index].tempFilePath,
        { folder: "products" }
      );
      imagesArray.push({
        id: result.public_id,
        secure_url: result.secure_url,
      });
    }
  }

  req.body.photos = imagesArray;

  product = await ProductDB.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    sucess: true,
    product,
  });
});

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
  const product = await ProductDB.findById(req.params.id);

  if (!product) {
    return next(new CustomError("No Product find with this id", 404));
  }

  for (let index = 0; index < product.photos.length; index++) {
    const res = await cloudinary.v2.uploader.destroy(product.photos[index].id);
  }

  await product.remove();
  res.status(200).json({ success: true, message: "product was deleted" });
});

exports.getAdminAllProducts = BigPromise(async (req, res, next) => {
  const products = await ProductDB.find();

  res.status(200).json({ success: true, products });
});
