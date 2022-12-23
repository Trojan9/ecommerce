import React, { useRef } from 'react';
import Link from 'next/link';
import { AiOutlineMinus, AiOutlinePlus, AiOutlineLeft, AiOutlineShopping } from 'react-icons/ai';
import { TiDeleteOutline } from 'react-icons/ti';
import toast from 'react-hot-toast';
const https = require('https');
import { useStateContext } from '../context/StateContext';
import { urlFor } from '../lib/client';
import getStripe from '../lib/getStripe';
let paystack_Secret_Key="sk_test_1c028968511e1c079bc1bf53bcac62b44761e9a4";
const Cart = () => {
  const cartRef = useRef();
  const { totalPrice, totalQuantities, cartItems, setShowCart, toggleCartItemQuanitity, onRemove } = useStateContext();

  const handleCheckout = async () => {
    const stripe = await getStripe();

    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartItems),
    });

    if(response.statusCode === 500) return;
    
    const data = await response.json();

    toast.loading('Redirecting...');
    toast.dismiss()

    stripe.redirectToCheckout({ sessionId: data.id });
  }

  return (
    <div className="cart-wrapper" ref={cartRef}>
      <div className="cart-container">
        <button
        type="button"
        className="cart-heading"
        onClick={() => setShowCart(false)}>
          <AiOutlineLeft />
          <span className="heading">Your Cart</span>
          <span className="cart-num-items">({totalQuantities} items)</span>
        </button>

        {cartItems.length < 1 && (
          <div className="empty-cart">
            <AiOutlineShopping size={150} />
            <h3>Your shopping bag is empty</h3>
            <Link href="/">
              <button
                type="button"
                onClick={() => setShowCart(false)}
                className="btn"
              >
                Continue Shopping
              </button>
            </Link>
          </div>
        )}

        <div className="product-container">
          {cartItems.length >= 1 && cartItems.map((item) => (
            <div className="product" key={item._id}>
              <img src={urlFor(item?.image[0])} className="cart-product-image" />
              <div className="item-desc">
                <div className="flex top">
                  <h5>{item.name}</h5>
                  <h4>${item.price}</h4>
                </div>
                <div className="flex bottom">
                  <div>
                  <p className="quantity-desc">
                    <span className="minus" onClick={() => toggleCartItemQuanitity(item._id, 'dec') }>
                    <AiOutlineMinus />
                    </span>
                    <span className="num" onClick="">{item.quantity}</span>
                    <span className="plus" onClick={() => toggleCartItemQuanitity(item._id, 'inc') }><AiOutlinePlus /></span>
                  </p>
                  </div>
                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => onRemove(item)}
                  >
                    <TiDeleteOutline />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cartItems.length >= 1 && (
          <div className="cart-bottom">
            <div className="total">
              <h3>Subtotal:</h3>
              <h3>${totalPrice}</h3>
            </div>
            <div className="btn-container">
              <button type="button" className="btn" onClick={async ()=>{
                toast.loading('Redirecting...');
                
                  const params = JSON.stringify({
                    "email": "timmybanjo@gmail.com",
                    "amount": `${totalPrice*100}`,
                    
                  })
                  console.log(process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY)
                  const options = {
                    hostname: 'api.paystack.co',
                    port: 443,
                    path: '/transaction/initialize',
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${paystack_Secret_Key}`,
                      'Content-Type': 'application/json'
                    }
                  }
                  const req = await https.request(options, (res) => {
                    let data = ''
                    res.on('data', (chunk) => {
                      data += chunk
                    });
                    res.on('end',async () => {
                      const decode=await JSON.parse(data);
                      
                      console.log(decode);
                        if(decode["status"]){
                          console.log()
                          toast.success("Redirected")
                          toast.dismiss();
                          window.open(`${decode["data"]["authorization_url"]}`)
                        
                        }
                    })
                  }).on('error', (error) => {
                    toast.error(error.toString())
                    
                    return null;
                  })
                  req.write(params)
                  req.end()
              }}>
                Pay with PayStack
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart