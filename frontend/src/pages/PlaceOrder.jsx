import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const PlaceOrder = () => {
  const [method, setMethod] = useState("stripe");
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      return;
    }

    try {
      const orderItems = cartItems.map((item) => {
        const product = products.find((p) => p._id === item.itemId);
        return {
          productId: item.itemId,
          size: item.size,
          quantity: item.quantity,
          price: product.price,
        };
      });

      const addressData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
      };

      const totalAmount = getCartAmount() + delivery_fee;

      const orderData = {
        items: orderItems,
        amount: totalAmount,
        address: addressData,
        paymentMethod: method.toUpperCase(),
        payment: method !== "cod",
        date: new Date(),
      };

      let endpoint = `${backendUrl}/api/order/place`;
      if (method === "stripe") {
        endpoint = `${backendUrl}/api/order/create-stripe-session`;
      }

      const response = await axios.post(endpoint, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        if (method === "stripe") {
          window.location.href = `https://checkout.stripe.com/pay/${response.data.sessionId}`;
        } else {
          setCartItems([]);
          navigate("/orders");
          toast.success("Order placed successfully!");
        }
      }
    } catch (error) {
      navigate("/orders");
      toast.error("Failed to place the order!");
    }
  };

  const handleStripeClick = () => {
    toast.info("Stripe payment is currently unavailable. Please select Cash on Delivery.");
    setMethod("cod");
  };

  return (
    <>
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col sm:flex-row mx-10 justify-between gap-4 pt-5 sm:pt-14 min-h-[80v] border-t"
      >
        <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
          <div className="text-xl sm:text-2xl my-3">
            <Title text1="DELIVERY " text2="INFORMATION" />
          </div>
          <div className="flex gap-3">
            <input
              onChange={onChangeHandler}
              name="firstName"
              value={formData.firstName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="First name"
              required
            />
            <input
              onChange={onChangeHandler}
              name="lastName"
              value={formData.lastName}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="Last name"
              required
            />
          </div>
          <input
            onChange={onChangeHandler}
            name="email"
            value={formData.email}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="email"
            placeholder="Email address"
            required
          />
          <input
            onChange={onChangeHandler}
            name="street"
            value={formData.street}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Street"
            required
          />
          <div className="flex gap-3">
            <input
              onChange={onChangeHandler}
              name="city"
              value={formData.city}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="City"
              required
            />
            <input
              onChange={onChangeHandler}
              name="state"
              value={formData.state}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="State"
              required
            />
          </div>
          <div className="flex gap-3">
            <input
              onChange={onChangeHandler}
              name="zipCode"
              value={formData.zipCode}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="Zip Code"
              required
            />
            <input
              onChange={onChangeHandler}
              name="country"
              value={formData.country}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="Country"
              required
            />
          </div>
          <input
            onChange={onChangeHandler}
            name="phone"
            value={formData.phone}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="tel"
            placeholder="Phone"
            required
          />
        </div>

        <div className="mt-8">
          <div className="mt-8 min-w-80">
            <CartTotal />
          </div>

          <div className="mt-12">
            <Title text1="PAYMENT" text2="METHOD" />
            <div className="flex gap-3 flex-col lg:flex-row">
              <div
                onClick={handleStripeClick}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === "stripe" ? "bg-green-400" : ""
                  }`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4">STRIPE</p>
              </div>
              <div
                onClick={() => setMethod("cod")}
                className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
              >
                <p
                  className={`min-w-3.5 h-3.5 border rounded-full ${
                    method === "cod" ? "bg-green-400" : ""
                  }`}
                ></p>
                <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
              </div>
            </div>
            <div className="w-full text-end mt-8">
              <button
                type="submit"
                className="bg-black text-white px-16 py-3 text-sm hover:bg-gray-800 transition-colors"
              >
                PLACE ORDER
              </button>
            </div>
          </div>
        </div>
      </form>

      <ToastContainer />
    </>
  );
};

export default PlaceOrder;