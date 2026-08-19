// =====================================
// API
// =====================================

const API_URL = "https://sri-lakshmi-restaurant-backend.onrender.com/api/reviews";


// =====================================
// LOAD REVIEWS
// =====================================

async function loadReviews() {

    const container =
        document.getElementById("reviews-container");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(API_URL);

        const reviews =
            await response.json();

        container.innerHTML = "";

        if (reviews.length === 0) {

            container.innerHTML =
                "<p>No reviews yet. Be the first to review us!</p>";

            return;
        }

        reviews.forEach(review => {

            const card =
                document.createElement("div");

            card.className =
                "review-card";

            const stars =
                "★".repeat(review.rating) +
                "☆".repeat(5 - review.rating);

            card.innerHTML = `

                <div class="stars">
                    ${stars}
                </div>

                <p>
                    "${review.review}"
                </p>

                <h3>
                    ${review.name}
                </h3>

                <span>
                    Customer
                </span>

            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load reviews.</p>";

    }

}


// =====================================
// REVIEW FORM
// =====================================

const reviewForm =
    document.getElementById("review-form");


if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document
                .getElementById("review-name")
                .value
                .trim();

            const rating =
                document
                .getElementById("review-rating")
                .value;

            const review =
                document
                .getElementById("review-text")
                .value
                .trim();

            const message =
                document.getElementById(
                    "review-message"
                );


            try {

                const response =
                    await fetch(
                        API_URL,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name: name,

                                    rating: rating,

                                    review: review

                                })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        result.error;

                    return;
                }


                message.textContent =
                    "Review submitted successfully!";


                document
                    .getElementById(
                        "review-form"
                    )
                    .reset();


                loadReviews();


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Could not connect to the server.";

            }

        }
    );

}


// =====================================
// LOAD REVIEWS
// =====================================

loadReviews();


// =====================================
// CONTACT / ENQUIRY FORM
// =====================================

const contactForm =
    document.getElementById(
        "contact-form"
    );


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document
                .getElementById(
                    "contact-name"
                )
                .value
                .trim();


            const phone =
                document
                .getElementById(
                    "contact-phone"
                )
                .value
                .trim();


            const email =
                document
                .getElementById(
                    "contact-email"
                )
                .value
                .trim();


            const message =
                document
                .getElementById(
                    "contact-message"
                )
                .value
                .trim();


            const status =
                document.getElementById(
                    "contact-status"
                );


            try {

                const response =
                    await fetch(
                        "/api/enquiries",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    name: name,

                                    phone: phone,

                                    email: email,

                                    message: message

                                })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    status.textContent =
                        result.error;

                    return;
                }


                status.textContent =
                    "Your enquiry has been sent successfully!";


                contactForm.reset();


            } catch (error) {

                console.error(error);

                status.textContent =
                    "Could not connect to the server.";

            }

        }
    );

}


// =====================================
// SHOPPING CART
// =====================================

let cart = [];


// =====================================
// ADD TO CART
// =====================================

function addToCart(
    name,
    price,
    image
) {

    const existingItem =
        cart.find(
            item =>
                item.name === name
        );


    if (existingItem) {

        existingItem.quantity++;

    } else {

        cart.push({

            name: name,

            price: price,

            image: image,

            quantity: 1

        });

    }


    updateCart();

}


// =====================================
// UPDATE CART
// =====================================

function updateCart() {

    const cartItems =
        document.getElementById(
            "cart-items"
        );

    const cartCount =
        document.getElementById(
            "cart-count"
        );

    const cartTotal =
        document.getElementById(
            "cart-total"
        );


    if (
        !cartItems ||
        !cartCount ||
        !cartTotal
    ) {

        return;

    }


    // Empty cart

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Your cart is empty.</p>";

        cartCount.textContent =
            "0";

        cartTotal.textContent =
            "₹0";

        return;

    }


    let totalItems = 0;

    let totalPrice = 0;


    cartItems.innerHTML = "";


    cart.forEach(
        (item, index) => {

            totalItems +=
                item.quantity;


            const itemTotal =
                item.price *
                item.quantity;


            totalPrice +=
                itemTotal;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <img
                    src="${item.image}"
                    alt="${item.name}"
                >


                <div
                    class="cart-item-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        ₹${item.price}
                    </p>


                    <div
                        class="quantity-controls">

                        <button
                            onclick="
                            decreaseQuantity(
                                ${index}
                            )">

                            −

                        </button>


                        <span>
                            ${item.quantity}
                        </span>


                        <button
                            onclick="
                            increaseQuantity(
                                ${index}
                            )">

                            +

                        </button>

                    </div>

                </div>


                <div
                    class="cart-item-total">

                    <strong>
                        ₹${itemTotal}
                    </strong>


                    <button
                        class="remove-item"
                        onclick="
                        removeFromCart(
                            ${index}
                        )">

                        Remove

                    </button>

                </div>

            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    cartCount.textContent =
        totalItems;


    cartTotal.textContent =
        "₹" + totalPrice;

}


// =====================================
// INCREASE QUANTITY
// =====================================

function increaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    cart[index].quantity++;


    updateCart();

    updateCheckout();

}


// =====================================
// DECREASE QUANTITY
// =====================================

function decreaseQuantity(index) {

    if (!cart[index]) {
        return;
    }


    if (
        cart[index].quantity > 1
    ) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);

    }


    updateCart();

    updateCheckout();

}


// =====================================
// REMOVE FROM CART
// =====================================

function removeFromCart(index) {

    cart.splice(index, 1);


    updateCart();

    updateCheckout();

}


// =====================================
// CHECKOUT
// =====================================

function checkout() {

    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    updateCheckout();


    const checkoutSection =
        document.getElementById(
            "checkout"
        );


    if (checkoutSection) {

        checkoutSection.scrollIntoView({

            behavior: "smooth"

        });

    }

}


// =====================================
// UPDATE CHECKOUT
// =====================================

function updateCheckout() {

    const checkoutItems =
        document.getElementById(
            "checkout-items"
        );

    const subtotalElement =
        document.getElementById(
            "checkout-subtotal"
        );

    const totalElement =
        document.getElementById(
            "checkout-total"
        );


    if (
        !checkoutItems ||
        !subtotalElement ||
        !totalElement
    ) {

        return;

    }


    if (cart.length === 0) {

        checkoutItems.innerHTML =
            "<p>Your cart is empty.</p>";

        subtotalElement.textContent =
            "₹0";

        totalElement.textContent =
            "₹0";

        return;

    }


    let subtotal = 0;


    checkoutItems.innerHTML = "";


    cart.forEach(item => {

        const itemTotal =
            item.price *
            item.quantity;


        subtotal +=
            itemTotal;


        const itemElement =
            document.createElement(
                "div"
            );


        itemElement.className =
            "checkout-item";


        itemElement.innerHTML = `

            <div>

                <div
                    class="checkout-item-name">

                    ${item.name}

                </div>


                <div
                    class="checkout-item-quantity">

                    ₹${item.price} ×
                    ${item.quantity}

                </div>

            </div>


            <strong>

                ₹${itemTotal}

            </strong>

        `;


        checkoutItems.appendChild(
            itemElement
        );

    });


    const deliveryFee = 40;


    const total =
        subtotal + deliveryFee;


    subtotalElement.textContent =
        "₹" + subtotal;


    totalElement.textContent =
        "₹" + total;

}


// =====================================
// PLACE ORDER
// =====================================

const checkoutForm =
    document.getElementById(
        "checkout-form"
    );


if (checkoutForm) {

    checkoutForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            const name =
                document
                .getElementById(
                    "customer-name"
                )
                .value
                .trim();


            const phone =
                document
                .getElementById(
                    "customer-phone"
                )
                .value
                .trim();


            const address =
                document
                .getElementById(
                    "customer-address"
                )
                .value
                .trim();


            const payment =
                document
                .getElementById(
                    "payment-method"
                )
                .value;


            if (
                !name ||
                !phone ||
                !address ||
                !payment
            ) {

                alert(
                    "Please fill all details."
                );

                return;

            }


            let subtotal = 0;


            cart.forEach(item => {

                subtotal +=
                    item.price *
                    item.quantity;

            });


            const deliveryFee = 40;


            const total =
                subtotal +
                deliveryFee;


            const orderData = {

                name: name,

                phone: phone,

                address: address,

                payment_method:
                    payment,

                items: cart,

                total: total

            };


            try {

                const response =
                    await fetch(
                        "/api/orders",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    orderData
                                )

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    alert(
                        result.error ||
                        "Could not place order."
                    );

                    return;

                }


                alert(
                    "Order placed successfully! " +
                    "Order ID: #" +
                    result.order_id
                );


                // Save order ID
                // for tracking

                localStorage.setItem(
                    "last_order_id",
                    result.order_id
                );


                // Empty cart

                cart = [];


                updateCart();

                updateCheckout();


                checkoutForm.reset();


                // Scroll to tracking

                const trackingSection =
                    document.getElementById(
                        "order-tracking"
                    );


                if (trackingSection) {

                    trackingSection.scrollIntoView({

                        behavior: "smooth"

                    });

                }


            } catch (error) {

                console.error(error);


                alert(
                    "Could not connect to server."
                );

            }

        }
    );

}


// =====================================
// CUSTOMER ORDER TRACKING
// =====================================

async function trackOrder() {

    const orderInput =
        document.getElementById(
            "tracking-order-id"
        );


    const result =
        document.getElementById(
            "tracking-result"
        );


    if (
        !orderInput ||
        !result
    ) {

        return;

    }


    const orderId =
        orderInput.value.trim();


    if (!orderId) {

        result.innerHTML =
            "<p>Please enter an Order ID.</p>";

        return;

    }


    result.innerHTML =
        "<p>Loading order...</p>";


    try {

        const response =
            await fetch(
                "/api/orders/" +
                orderId
            );


        const order =
            await response.json();


        if (!response.ok) {

            result.innerHTML = `

                <div
                    class="tracking-error">

                    ❌ ${order.error}

                </div>

            `;

            return;

        }


        const statuses = [

            "NEW",

            "ACCEPTED",

            "PREPARING",

            "READY",

            "DELIVERED"

        ];


        const currentIndex =
            statuses.indexOf(
                order.status
            );


        let statusHTML = "";


        statuses.forEach(
            (status, index) => {

                let className = "";


                if (
                    index <
                    currentIndex
                ) {

                    className =
                        "completed";

                }

                else if (
                    index ===
                    currentIndex
                ) {

                    className =
                        "current";

                }


                const checkMark =
                    (
                        index <=
                        currentIndex
                    )
                    ? "✓"
                    : "";


                statusHTML += `

                    <div
                        class="
                        tracking-step
                        ${className}">

                        <div
                            class="
                            tracking-circle">

                            ${checkMark}

                        </div>


                        <span>

                            ${status}

                        </span>

                    </div>

                `;

            }
        );


        result.innerHTML = `

            <div
                class="tracking-card">

                <h3>

                    Order #${order.id}

                </h3>


                <p>

                    Customer:

                    <strong>

                        ${order.name}

                    </strong>

                </p>


                <p>

                    Total:

                    <strong>

                        ₹${order.total}

                    </strong>

                </p>


                <p>

                    Current Status:

                    <strong>

                        ${order.status}

                    </strong>

                </p>


                <div
                    class="tracking-progress">

                    ${statusHTML}

                </div>

            </div>

        `;


    } catch (error) {

        console.error(error);


        result.innerHTML = `

            <div
                class="tracking-error">

                ❌ Unable to connect
                to the server.

            </div>

        `;

    }

}


// =====================================
// AUTO LOAD LAST ORDER
// =====================================

window.addEventListener(
    "DOMContentLoaded",
    function() {

        const lastOrderId =
            localStorage.getItem(
                "last_order_id"
            );


        const trackingInput =
            document.getElementById(
                "tracking-order-id"
            );


        if (
            lastOrderId &&
            trackingInput
        ) {

            trackingInput.value =
                lastOrderId;

        }

    }
);
