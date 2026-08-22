// =====================================
// SRI LAKSHMI RESTAURANT
// COMPLETE SCRIPT.JS
// =====================================


// =====================================
// BACKEND CONFIGURATION
// =====================================

// GitHub Pages = Frontend
// Render = Backend

const BACKEND_URL =
    "https://sri-lakshmi-restaurant-backend.onrender.com";

const API_URL =
    BACKEND_URL + "/api";


// =====================================
// HELPER FUNCTION
// =====================================

async function getJSON(response) {

    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch (error) {
        return {
            error: text || "Invalid server response."
        };
    }
}


// =====================================
// LOAD CUSTOMER REVIEWS
// =====================================

async function loadReviews() {

    const container =
        document.getElementById(
            "reviews-container"
        );

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                API_URL + "/reviews"
            );

        const reviews =
            await getJSON(response);

        if (!response.ok) {

            throw new Error(
                reviews.error ||
                "Unable to load reviews."
            );
        }

        container.innerHTML = "";

        if (
            !Array.isArray(reviews) ||
            reviews.length === 0
        ) {

            container.innerHTML =
                "<p>No reviews yet. Be the first to review us!</p>";

            return;
        }


        reviews.forEach(
            review => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "review-card";


                const rating =
                    Number(
                        review.rating
                    ) || 0;


                const stars =
                    "★".repeat(
                        rating
                    ) +
                    "☆".repeat(
                        Math.max(
                            0,
                            5 - rating
                        )
                    );


                card.innerHTML = `

                    <div class="stars">
                        ${stars}
                    </div>

                    <p>
                        "${review.review || ""}"
                    </p>

                    <h3>
                        ${review.name || "Customer"}
                    </h3>

                    <span>
                        Customer
                    </span>

                `;


                container.appendChild(
                    card
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Review loading error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load reviews.</p>";
    }
}


// =====================================
// REVIEW FORM
// =====================================

const reviewForm =
    document.getElementById(
        "review-form"
    );


if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const nameElement =
                document.getElementById(
                    "review-name"
                );

            const ratingElement =
                document.getElementById(
                    "review-rating"
                );

            const reviewElement =
                document.getElementById(
                    "review-text"
                );

            const message =
                document.getElementById(
                    "review-message"
                );


            if (
                !nameElement ||
                !ratingElement ||
                !reviewElement
            ) {
                return;
            }


            const name =
                nameElement.value.trim();

            const rating =
                ratingElement.value;

            const review =
                reviewElement.value.trim();


            try {

                const response =
                    await fetch(
                        API_URL + "/reviews",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    rating:
                                        rating,

                                    review:
                                        review

                                })
                        }
                    );


                const result =
                    await getJSON(
                        response
                    );


                if (!response.ok) {

                    if (message) {

                        message.textContent =
                            result.error ||
                            "Could not submit review.";

                    }

                    return;
                }


                if (message) {

                    message.textContent =
                        "Review submitted successfully!";

                }


                reviewForm.reset();


                loadReviews();

            }

            catch (error) {

                console.error(
                    "Review submit error:",
                    error
                );


                if (message) {

                    message.textContent =
                        "Could not connect to the server.";

                }
            }

        }
    );
}


// =====================================
// LOAD REVIEWS WHEN PAGE OPENS
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


            const nameElement =
                document.getElementById(
                    "contact-name"
                );

            const phoneElement =
                document.getElementById(
                    "contact-phone"
                );

            const emailElement =
                document.getElementById(
                    "contact-email"
                );

            const messageElement =
                document.getElementById(
                    "contact-message"
                );

            const status =
                document.getElementById(
                    "contact-status"
                );


            if (
                !nameElement ||
                !phoneElement ||
                !emailElement ||
                !messageElement
            ) {
                return;
            }


            const name =
                nameElement.value.trim();

            const phone =
                phoneElement.value.trim();

            const email =
                emailElement.value.trim();

            const message =
                messageElement.value.trim();


            try {

                const response =
                    await fetch(
                        API_URL + "/enquiries",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    phone:
                                        phone,

                                    email:
                                        email,

                                    message:
                                        message

                                })
                        }
                    );


                const result =
                    await getJSON(
                        response
                    );


                if (!response.ok) {

                    if (status) {

                        status.textContent =
                            result.error ||
                            "Could not send enquiry.";

                    }

                    return;
                }


                if (status) {

                    status.textContent =
                        "Your enquiry has been sent successfully!";

                }


                contactForm.reset();

            }

            catch (error) {

                console.error(
                    "Enquiry error:",
                    error
                );


                if (status) {

                    status.textContent =
                        "Could not connect to the server.";

                }
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

    }

    else {

        cart.push({

            name:
                name,

            price:
                Number(price),

            image:
                image,

            quantity:
                1

        });

    }


    updateCart();

    updateCheckout();
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
                Number(item.price) *
                Number(item.quantity);


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

                <div class="cart-item-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        ₹${item.price}
                    </p>

                    <div class="quantity-controls">

                        <button
                            onclick="
                                decreaseQuantity(${index})
                            "
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="
                                increaseQuantity(${index})
                            "
                        >
                            +
                        </button>

                    </div>

                </div>

                <div class="cart-item-total">

                    <strong>
                        ₹${itemTotal}
                    </strong>

                    <button
                        class="remove-item"
                        onclick="
                            removeFromCart(${index})
                        "
                    >
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

    }

    else {

        cart.splice(
            index,
            1
        );

    }


    updateCart();

    updateCheckout();
}


// =====================================
// REMOVE FROM CART
// =====================================

function removeFromCart(index) {

    if (!cart[index]) {
        return;
    }


    cart.splice(
        index,
        1
    );


    updateCart();

    updateCheckout();
}


// =====================================
// CHECKOUT
// =====================================

function checkout() {

    if (
        cart.length === 0
    ) {

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

            behavior:
                "smooth"

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


    if (
        cart.length === 0
    ) {

        checkoutItems.innerHTML =
            "<p>Your cart is empty.</p>";

        subtotalElement.textContent =
            "₹0";

        totalElement.textContent =
            "₹0";

        return;
    }


    let subtotal = 0;


    checkoutItems.innerHTML =
        "";


    cart.forEach(
        item => {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


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

                    <div class="checkout-item-name">
                        ${item.name}
                    </div>

                    <div class="checkout-item-quantity">
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

        }
    );


    // Delivery charge
    const deliveryFee = 40;


    const total =
        subtotal +
        deliveryFee;


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


            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;
            }


            const nameElement =
                document.getElementById(
                    "customer-name"
                );

            const phoneElement =
                document.getElementById(
                    "customer-phone"
                );

            const addressElement =
                document.getElementById(
                    "customer-address"
                );

            const paymentElement =
                document.getElementById(
                    "payment-method"
                );


            if (
                !nameElement ||
                !phoneElement ||
                !addressElement ||
                !paymentElement
            ) {
                return;
            }


            const name =
                nameElement.value.trim();

            const phone =
                phoneElement.value.trim();

            const address =
                addressElement.value.trim();

            const payment =
                paymentElement.value;


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


            cart.forEach(
                item => {

                    subtotal +=
                        Number(item.price) *
                        Number(item.quantity);

                }
            );


            const deliveryFee =
                40;


            const total =
                subtotal +
                deliveryFee;


            const orderData = {

                name:
                    name,

                phone:
                    phone,

                address:
                    address,

                payment_method:
                    payment,

                items:
                    cart,

                total:
                    total

            };


            try {

                const response =
                    await fetch(
                        API_URL + "/orders",
                        {

                            method:
                                "POST",

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
                    await getJSON(
                        response
                    );


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

                        behavior:
                            "smooth"

                    });

                }

            }

            catch (error) {

                console.error(
                    "Order error:",
                    error
                );


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
                API_URL +
                "/orders/" +
                encodeURIComponent(
                    orderId
                )
            );


        const order =
            await getJSON(
                response
            );


        if (!response.ok) {

            result.innerHTML = `

                <div class="tracking-error">

                    ❌
                    ${order.error ||
                    "Order not found."}

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


        let statusHTML =
            "";


        statuses.forEach(
            (status, index) => {

                let className =
                    "";


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
                    index <=
                    currentIndex
                        ? "✓"
                        : "";


                statusHTML += `

                    <div
                        class="
                            tracking-step
                            ${className}
                        "
                    >

                        <div
                            class="
                                tracking-circle
                            "
                        >
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

            <div class="tracking-card">

                <h3>
                    Order #${order.id}
                </h3>


                <p>

                    Customer:

                    <strong>
                        ${order.name || ""}
                    </strong>

                </p>


                <p>

                    Total:

                    <strong>
                        ₹${order.total || 0}
                    </strong>

                </p>


                <p>

                    Current Status:

                    <strong>
                        ${order.status || "NEW"}
                    </strong>

                </p>


                <div class="tracking-progress">

                    ${statusHTML}

                </div>

            </div>

        `;

    }

    catch (error) {

        console.error(
            "Tracking error:",
            error
        );


        result.innerHTML = `

            <div class="tracking-error">

                ❌ Unable to connect
                to the server.

            </div>

        `;

    }
}


// =====================================
// AUTO LOAD LAST ORDER ID
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


        // Initialize cart
        updateCart();

        updateCheckout();

    }
);