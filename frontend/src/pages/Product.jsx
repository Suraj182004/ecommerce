import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import Reviews from '../components/Reviews';
import { Heart, Search, Truck, RefreshCw, Shield, Share2, ShoppingCart, CreditCard, Star, Award, Play, Pause } from 'react-feather';
import { FaLeaf } from "react-icons/fa";

const Product = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, currency, addToCart, addToWishList, wishListItems } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setImgSize] = useState([0, 0]);
  const magnifierRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const ZOOM_LEVEL = 2.5;
  const MAGNIFIER_SIZE = 150;

  const fetchProductData = () => {
    const product = products.find(item => item._id === productId);
    if (product) {
      setProductData(product);
      setImage(product.image[0]);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const handleMouseMove = (e) => {
    const elem = magnifierRef.current;
    const { top, left } = elem.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setXY([x, y]);
  };

  const handleMouseEnter = () => {
    const elem = magnifierRef.current;
    const { width, height } = elem.getBoundingClientRect();
    setImgSize([width, height]);
    setShowMagnifier(true);
  };

  const handleBuyNow = () => {
    if (size) {
      addToCart(productData._id, size);
      navigate('/cart');
    } else {
      alert('Please select a size before proceeding');
    }
  };

  const handleShare = () => {
    const productUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ 
        title: productData.name, 
        text: 'Check out this product!', 
        url: productUrl 
      });
    } else {
      navigator.clipboard.writeText(productUrl);
      alert('Product link copied to clipboard!');
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({productData.totalReviews || 0})
        </span>
      </div>
    );
  };

  if (!productData) {
    return <div>Loading...</div>;
  }

  const isInWishlist = wishListItems.some(item => item.id === productData._id);

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 ${productData?.ecoFriendly ? 'eco-friendly' : ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Product Image Column */}
        <div className="flex flex-col">
          {/* Main Product Image/Video Container */}
          <div className="relative flex flex-col sm:flex-row gap-6">
            {/* Thumbnails - Desktop sidebar */}
            <div className="hidden sm:flex flex-col gap-3 w-24 flex-shrink-0">
              {productData.image.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setImage(item)}
                  className={`cursor-pointer rounded-lg overflow-hidden transition-all w-24 h-24 flex-shrink-0 ${
                    image === item 
                      ? 'ring-2 ring-black' 
                      : 'ring-1 ring-gray-200 hover:ring-gray-400'
                  }`}
                >
                  <img
                    src={item}
                    alt={`${productData.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              ))}
              {productData.video && (
                <div
                  className={`cursor-pointer rounded-lg overflow-hidden transition-all relative group w-24 h-24 flex-shrink-0 ${
                    image === 'video' 
                      ? 'ring-2 ring-black' 
                      : 'ring-1 ring-gray-200 hover:ring-gray-400'
                  }`}
                  onClick={() => setImage('video')}
                >
                  <div className="w-full h-full bg-gray-100">
                    {/* Video thumbnail preview */}
                    <video
                      src={productData.video}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Image/Video Display */}
            <div className="flex-grow relative min-h-[300px] sm:min-h-[400px] bg-gray-50 rounded-lg">
              {image === 'video' && productData.video ? (
                <div className="relative rounded-lg overflow-hidden bg-gray-100 h-full flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={productData.video}
                    className="w-full h-auto max-h-[500px] object-contain"
                    controls
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedData={() => setIsVideoLoaded(true)}
                    onError={() => setIsVideoLoaded(false)}
                    preload="metadata"
                    poster={productData.image[0]} // Use first image as poster
                  />
                  {!isPlaying && (
                    <button
                      onClick={toggleVideo}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-4 text-white hover:bg-opacity-70 transition-opacity"
                    >
                      <Play className="w-6 h-6" />
                    </button>
                  )}
                  {!isVideoLoaded && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  ref={magnifierRef}
                  className="relative overflow-hidden rounded-lg bg-gray-50 h-full flex items-center justify-center"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={() => setShowMagnifier(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={image}
                    alt={productData.name}
                    className="w-full h-auto max-h-[500px] object-contain rounded-lg"
                    loading="eager"
                  />
                  {showMagnifier && (
                    <div
                      style={{
                        position: "absolute",
                        left: `${x - MAGNIFIER_SIZE / 2}px`,
                        top: `${y - MAGNIFIER_SIZE / 2}px`,
                        width: `${MAGNIFIER_SIZE}px`,
                        height: `${MAGNIFIER_SIZE}px`,
                        opacity: "1",
                        backgroundColor: "white",
                        borderRadius: "4px",
                        pointerEvents: "none",
                        zIndex: 2,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        background: `url(${image})`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: `${-x * ZOOM_LEVEL + MAGNIFIER_SIZE / 2}px ${
                          -y * ZOOM_LEVEL + MAGNIFIER_SIZE / 2
                        }px`,
                        backgroundSize: `${imgWidth * ZOOM_LEVEL}px ${imgHeight * ZOOM_LEVEL}px`
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Thumbnails - Below main image */}
          <div className="sm:hidden w-full mb-8 mt-4">
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
              {productData.image.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setImage(item)}
                  className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all w-20 h-20 ${
                    image === item 
                      ? 'ring-2 ring-black' 
                      : 'ring-1 ring-gray-200 hover:ring-gray-400'
                  }`}
                >
                  <img
                    src={item}
                    alt={`${productData.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              ))}
              {productData.video && (
                <div
                  className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all relative w-20 h-20 ${
                    image === 'video' 
                      ? 'ring-2 ring-black' 
                      : 'ring-1 ring-gray-200 hover:ring-gray-400'
                  }`}
                  onClick={() => setImage('video')}
                >
                  <div className="w-full h-full bg-gray-100">
                    <video
                      src={productData.video}
                      className="w-full h-full object-cover"
                      preload="metadata"
                      muted
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Column */}
        <div className="space-y-5 pt-1 sm:pt-0 lg:mt-0">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {productData.name}
            </h1>
            <div className="flex flex-col gap-2">
              {productData.ecoFriendly && (
                <div className="relative group">
                  <div className="flex items-center gap-2 text-green-600 cursor-help">
                    <FaLeaf size={16} />
                    <span className="text-sm font-medium">Eco-Friendly Product</span>
                  </div>
                  <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm text-gray-600 max-w-md leading-relaxed z-10">
                    Crafted from eco-friendly organic cotton, this product offers a sustainable, soft, and breathable feel. 
                    Ethically made, it ensures comfort while reducing environmental impact—perfect for conscious consumers seeking quality and sustainability.
                  </div>
                </div>
              )}
              {productData.bestseller && (
                <div className="relative group">
                  <div className="flex items-center gap-2 text-yellow-600 cursor-help">
                    <Star size={16} />
                    <span className="text-sm font-medium">Bestseller Product</span>
                  </div>
                  <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white/90 backdrop-blur-sm rounded-lg p-3 text-sm text-gray-600 max-w-md leading-relaxed z-10">
                    One of our most popular items! This product consistently ranks among our top sellers, loved by customers for its quality and style.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-gray-900">
              {currency}{Math.round(productData.discountPercentage ? 
                productData.price - (productData.price * productData.discountPercentage / 100) : 
                productData.price
              )}
            </div>
            {productData.discountPercentage > 0 && (
              <>
                <div className="text-lg text-gray-500 line-through">
                  {currency}{productData.price}
                </div>
                <div className="text-lg font-medium text-green-600">
                  {productData.discountPercentage}% off
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-green-600">Inclusive of all taxes</p>
          <p className="text-gray-600 leading-relaxed">{productData.description}</p>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Select Size</h3>
            <div className="flex flex-wrap gap-3">
              {productData.sizes.map((item) => (
                <button
                  key={item}
                  onClick={() => setSize(item)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${item === size 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => addToCart(productData._id, size)}
              className="flex-1 min-w-[200px] bg-black text-white px-8 py-3 rounded-md font-medium
                hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 min-w-[200px] bg-orange-500 text-white px-8 py-3 rounded-md font-medium
                hover:bg-orange-600 transition-colors inline-flex items-center justify-center gap-2"
            >
              <CreditCard className="w-5 h-5" />
              Buy Now
            </button>
            <button
              onClick={() => addToWishList(productData._id, size)}
              className="p-3 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Heart 
                fill={isInWishlist ? 'red' : 'none'}
                stroke={isInWishlist ? 'red' : 'currentColor'}
                className="w-6 h-6"
              />
            </button>
            <button 
              onClick={handleShare} 
              className="p-3 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Share product"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium">Free Delivery</p>
                  <p className="text-sm text-gray-500">On orders above {currency}499</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-sm text-gray-500">7 days return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium">Secure Payments</p>
                  <p className="text-sm text-gray-500">100% secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
        <Reviews 
          productId={productId}
          key={productId}
        />
      </div>

      {/* Related Products */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <RelatedProducts 
          category={productData.category} 
          subCategory={productData.subcategory}
          currentProductId={productId} 
        />
      </div>
    </div>
  );
};

<style jsx>{`
  .eco-friendly {
    background: linear-gradient(to bottom, rgba(144, 238, 144, 0.1), transparent);
    border-radius: 8px;
  }

  .eco-badge {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    padding: 8px 16px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .eco-badge span {
    color: #4CAF50;
    font-weight: 500;
  }

  .eco-icon {
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    vertical-align: middle;
  }

  /* Video Control Improvements */
  video {
    max-height: 500px;
    width: 100%;
    object-fit: contain;
  }

  video::-webkit-media-controls-timeline {
    margin-inline: 10px;
  }

  video::-webkit-media-controls-panel {
    background: rgba(0, 0, 0, 0.6);
  }

  video::-webkit-media-controls-play-button {
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
  }

  /* Hide the scrollbar but allow scrolling */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
  
  /* Smooth transitions for thumbnails */
  .flex-shrink-0 {
    transition: all 0.2s ease-in-out;
  }
  
  .flex-shrink-0:hover {
    transform: translateY(-2px);
  }
`}</style>

export default Product;