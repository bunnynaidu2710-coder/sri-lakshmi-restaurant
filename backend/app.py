from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path
import secrets
from functools import wraps
import json


# =====================================
# FLASK APP
# =====================================

app = Flask(
    __name__,
    static_folder=str(Path(__file__).parent.parent),
    static_url_path=""
)

CORS(app)


# =====================================
# DATABASE LOCATION
# =====================================

DATABASE = Path(__file__).parent / "restaurant.db"


# =====================================
# ADMIN LOGIN DETAILS
# =====================================

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


# Temporary login tokens
admin_tokens = set()


# =====================================
# DATABASE
# =====================================

def get_db():

    connection = sqlite3.connect(DATABASE)

    connection.row_factory = sqlite3.Row

    return connection


def create_database():

    connection = get_db()


    # =================================
    # REVIEWS TABLE
    # =================================

    connection.execute("""
        CREATE TABLE IF NOT EXISTS reviews (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            rating INTEGER NOT NULL,

            review TEXT NOT NULL,

            created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP

        )
    """)


    # =================================
    # ENQUIRIES TABLE
    # =================================

    connection.execute("""
        CREATE TABLE IF NOT EXISTS enquiries (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            phone TEXT NOT NULL,

            email TEXT,

            message TEXT NOT NULL,

            created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP

        )
    """)


    # =================================
    # ORDERS TABLE
    # =================================

    connection.execute("""
        CREATE TABLE IF NOT EXISTS orders (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            phone TEXT NOT NULL,

            address TEXT NOT NULL,

            payment_method TEXT NOT NULL,

            items TEXT NOT NULL,

            total REAL NOT NULL,

            status TEXT DEFAULT 'NEW',

            created_at TIMESTAMP
            DEFAULT CURRENT_TIMESTAMP

        )
    """)


    connection.commit()

    connection.close()


# =====================================
# IMPORTANT
# CREATE DATABASE WHEN SERVER STARTS
# =====================================

# This is outside the __main__ block.
# Therefore it also runs when Render
# starts Flask using Gunicorn.

create_database()


# =====================================
# ADMIN AUTHENTICATION
# =====================================

def admin_required(function):

    @wraps(function)
    def wrapper(*args, **kwargs):

        auth_header = request.headers.get(
            "Authorization",
            ""
        )


        if not auth_header.startswith(
            "Bearer "
        ):

            return jsonify({
                "error":
                "Admin login required."
            }), 401


        token = auth_header.replace(
            "Bearer ",
            "",
            1
        )


        if token not in admin_tokens:

            return jsonify({
                "error":
                "Invalid or expired login."
            }), 401


        return function(
            *args,
            **kwargs
        )


    return wrapper


# =====================================
# ADMIN LOGIN
# =====================================

@app.route(
    "/api/login",
    methods=["POST"]
)
def login():

    data = request.get_json()


    if not data:

        return jsonify({
            "error":
            "Invalid request."
        }), 400


    username = data.get(
        "username",
        ""
    ).strip()


    password = data.get(
        "password",
        ""
    )


    if (
        username == ADMIN_USERNAME
        and password == ADMIN_PASSWORD
    ):

        token = secrets.token_urlsafe(
            32
        )

        admin_tokens.add(token)


        return jsonify({

            "message":
            "Login successful.",

            "token":
            token

        }), 200


    return jsonify({

        "error":
        "Invalid username or password."

    }), 401


# =====================================
# ADMIN LOGOUT
# =====================================

@app.route(
    "/api/logout",
    methods=["POST"]
)
@admin_required
def logout():

    auth_header = request.headers.get(
        "Authorization",
        ""
    )


    token = auth_header.replace(
        "Bearer ",
        "",
        1
    )


    admin_tokens.discard(token)


    return jsonify({

        "message":
        "Logged out successfully."

    })


# =====================================
# GET REVIEWS
# =====================================

@app.route(
    "/api/reviews",
    methods=["GET"]
)
@admin_required
def get_reviews():

    connection = get_db()


    reviews = connection.execute("""
        SELECT
            id,
            name,
            rating,
            review,
            created_at

        FROM reviews

        ORDER BY id DESC
    """).fetchall()


    connection.close()


    return jsonify([

        dict(review)

        for review in reviews

    ])


# =====================================
# ADD REVIEW
# =====================================

@app.route(
    "/api/reviews",
    methods=["POST"]
)
def add_review():

    data = request.get_json()


    if not data:

        return jsonify({
            "error":
            "Invalid request."
        }), 400


    name = data.get(
        "name",
        ""
    ).strip()


    rating = data.get(
        "rating"
    )


    review = data.get(
        "review",
        ""
    ).strip()


    if (
        not name
        or not review
        or not rating
    ):

        return jsonify({
            "error":
            "Please fill all fields."
        }), 400


    try:

        rating = int(rating)

    except (ValueError, TypeError):

        return jsonify({
            "error":
            "Rating must be a number."
        }), 400


    if rating < 1 or rating > 5:

        return jsonify({
            "error":
            "Rating must be between 1 and 5."
        }), 400


    connection = get_db()


    connection.execute("""
        INSERT INTO reviews
        (
            name,
            rating,
            review
        )

        VALUES (?, ?, ?)

    """, (

        name,
        rating,
        review

    ))


    connection.commit()

    connection.close()


    return jsonify({

        "message":
        "Review submitted successfully!"

    }), 201


# =====================================
# ADD ENQUIRY
# =====================================

@app.route(
    "/api/enquiries",
    methods=["POST"]
)
def add_enquiry():

    data = request.get_json()


    if not data:

        return jsonify({
            "error":
            "Invalid request."
        }), 400


    name = data.get(
        "name",
        ""
    ).strip()


    phone = data.get(
        "phone",
        ""
    ).strip()


    email = data.get(
        "email",
        ""
    ).strip()


    message = data.get(
        "message",
        ""
    ).strip()


    if (
        not name
        or not phone
        or not message
    ):

        return jsonify({

            "error":
            "Please fill in name, phone and message."

        }), 400


    connection = get_db()


    connection.execute("""
        INSERT INTO enquiries
        (
            name,
            phone,
            email,
            message
        )

        VALUES (?, ?, ?, ?)

    """, (

        name,
        phone,
        email,
        message

    ))


    connection.commit()

    connection.close()


    return jsonify({

        "message":
        "Your enquiry has been sent successfully!"

    }), 201


# =====================================
# GET ENQUIRIES
# =====================================

@app.route(
    "/api/enquiries",
    methods=["GET"]
)
@admin_required
def get_enquiries():

    connection = get_db()


    enquiries = connection.execute("""
        SELECT
            id,
            name,
            phone,
            email,
            message,
            created_at

        FROM enquiries

        ORDER BY id DESC

    """).fetchall()


    connection.close()


    return jsonify([

        dict(enquiry)

        for enquiry in enquiries

    ])


# =====================================
# ADD ORDER
# =====================================

@app.route(
    "/api/orders",
    methods=["POST"]
)
def add_order():

    data = request.get_json()


    if not data:

        return jsonify({
            "error":
            "Invalid request."
        }), 400


    name = data.get(
        "name",
        ""
    ).strip()


    phone = data.get(
        "phone",
        ""
    ).strip()


    address = data.get(
        "address",
        ""
    ).strip()


    payment_method = data.get(
        "payment_method",
        ""
    ).strip()


    items = data.get(
        "items",
        []
    )


    total = data.get(
        "total",
        0
    )


    if (
        not name
        or not phone
        or not address
        or not payment_method
        or not items
    ):

        return jsonify({

            "error":
            "Please fill all order details."

        }), 400


    try:

        total = float(total)

    except (
        ValueError,
        TypeError
    ):

        return jsonify({

            "error":
            "Invalid order total."

        }), 400


    items_json = json.dumps(
        items
    )


    connection = get_db()


    cursor = connection.execute("""

        INSERT INTO orders
        (
            name,
            phone,
            address,
            payment_method,
            items,
            total,
            status
        )

        VALUES (?, ?, ?, ?, ?, ?, ?)

    """, (

        name,
        phone,
        address,
        payment_method,
        items_json,
        total,
        "NEW"

    ))


    order_id = cursor.lastrowid


    connection.commit()

    connection.close()


    return jsonify({

        "message":
        "Order placed successfully!",

        "order_id":
        order_id

    }), 201


# =====================================
# GET ORDERS
# =====================================

@app.route(
    "/api/orders",
    methods=["GET"]
)
@admin_required
def get_orders():

    connection = get_db()


    orders = connection.execute("""

        SELECT
            id,
            name,
            phone,
            address,
            payment_method,
            items,
            total,
            status,
            created_at

        FROM orders

        ORDER BY id DESC

    """).fetchall()


    connection.close()


    result = []


    for order in orders:

        order_data = dict(order)


        try:

            order_data["items"] = json.loads(
                order_data["items"]
            )

        except (
            json.JSONDecodeError,
            TypeError
        ):

            order_data["items"] = []


        result.append(
            order_data
        )


    return jsonify(result)


# =====================================
# CUSTOMER ORDER TRACKING
# =====================================

@app.route(
    "/api/orders/<int:order_id>",
    methods=["GET"]
)
def track_order(order_id):

    connection = get_db()


    order = connection.execute("""

        SELECT
            id,
            name,
            items,
            total,
            status,
            created_at

        FROM orders

        WHERE id = ?

    """, (
        order_id,
    )).fetchone()


    connection.close()


    if order is None:

        return jsonify({

            "error":
            "Order not found."

        }), 404


    order_data = dict(order)


    try:

        order_data["items"] = json.loads(
            order_data["items"]
        )

    except (
        json.JSONDecodeError,
        TypeError
    ):

        order_data["items"] = []


    # Don't expose customer's
    # phone/address publicly.

    return jsonify(
        order_data
    )


# =====================================
# UPDATE ORDER STATUS
# =====================================

@app.route(
    "/api/orders/<int:order_id>",
    methods=["PUT"]
)
@admin_required
def update_order_status(order_id):

    data = request.get_json()


    if not data:

        return jsonify({
            "error":
            "Invalid request."
        }), 400


    status = data.get(
        "status",
        ""
    ).strip().upper()


    allowed_statuses = [

        "NEW",

        "ACCEPTED",

        "PREPARING",

        "READY",

        "DELIVERED",

        "CANCELLED"

    ]


    if status not in allowed_statuses:

        return jsonify({

            "error":
            "Invalid order status."

        }), 400


    connection = get_db()


    cursor = connection.execute("""

        UPDATE orders

        SET status = ?

        WHERE id = ?

    """, (

        status,
        order_id

    ))


    connection.commit()

    connection.close()


    if cursor.rowcount == 0:

        return jsonify({

            "error":
            "Order not found."

        }), 404


    return jsonify({

        "message":
        "Order status updated successfully."

    })


# =====================================
# WEBSITE HOME
# =====================================

@app.route("/")
def home():

    return app.send_static_file(
        "index.html"
    )


# =====================================
# ADMIN DASHBOARD
# =====================================

@app.route("/admin.html")
def admin_page():

    return app.send_static_file(
        "admin.html"
    )


# =====================================
# ADMIN LOGIN PAGE
# =====================================

@app.route("/admin-login.html")
def admin_login_page():

    return app.send_static_file(
        "admin-login.html"
    )


# =====================================
# START SERVER
# =====================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )