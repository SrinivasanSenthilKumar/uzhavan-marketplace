# 🌾 TN Farmer Marketplace
### Connecting Farmers Directly with Buyers Across Tamil Nadu

A full-stack **MERN Stack** web application that connects **Farmers**, **Customers**, and **Bulk Buyers** through a secure online marketplace. The platform enables farmers to sell agricultural products directly without intermediaries while providing secure authentication, government ID verification, real-time communication, online payments, and multilingual support.

---

## 📖 Overview

TN Farmer Marketplace is designed to bridge the gap between farmers and consumers by providing a digital marketplace where agricultural products can be bought and sold directly. The platform supports role-based access, district-wise product discovery, real-time messaging, video calling, secure payments, and an admin verification system.

---

# ✨ Features

## 👨‍🌾 Farmer

- Register and login securely
- Upload Government ID for verification
- Add, edit, and delete products
- Upload product images
- Manage inventory and pricing
- Receive customer orders
- Accept or reject bulk buyer requests
- Chat with customers
- Video call buyers
- Track order status

---

## 🛒 Customer

- Register and login securely
- Browse products
- Filter products by district and category
- Search products
- Add products to cart
- Place orders
- Chat with farmers
- Video call farmers
- Online payment using Razorpay
- Cash on Delivery option

---

## 🏢 Bulk Buyer

- Register and login securely
- Purchase products in bulk
- Send direct sourcing requests
- Negotiate with farmers
- Chat with farmers
- Video call farmers

---

## 👨‍💼 Admin

- Review uploaded Government IDs
- Approve or reject user verification
- View verification requests
- Monitor platform activities

---

# 🚀 Key Features

- ✅ Role-based Authentication
- ✅ JWT Authentication
- ✅ Password Encryption using bcrypt
- ✅ Government ID Verification
- ✅ Product Management
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Bulk Buyer Requests
- ✅ Real-time Chat
- ✅ WebRTC Video Calling
- ✅ Razorpay Payment Gateway
- ✅ Cash on Delivery
- ✅ Responsive Design
- ✅ Tamil & English Language Support

---

# 🖼️ Screenshots

Create a folder named **screenshots** and add your application images.

| Home Page | Farmer Dashboard |
|------------|-----------------|
| ![](Uzhavan/Screenshots/home.png) | ![](Uzhavan/Screenshots/dashboard.png) |

| Product Page | Admin Dashboard |
|---------------|----------------|
| ![](Uzhavan/Screenshots/product.png) | ![](Uzhavan/Screenshots/admin.png) |

---

# 🛠️ Tech Stack

## Frontend

- React.js
- React Router
- React Bootstrap
- Bootstrap 5
- Axios
- React Toastify
- React i18next
- Socket.io Client
- Simple Peer (WebRTC)

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Socket.io
- Razorpay

---

## Database

- MongoDB

---

## Authentication

- JWT Authentication
- bcrypt Password Hashing
- Role-Based Authorization

---

# 📂 Project Structure

```
TN-Farmer-Marketplace
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── scripts
│   ├── socket
│   ├── uploads
│   ├── utils
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── .env.example
│   └── .gitignore
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   ├── locales
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   └── .gitignore
│
├── screenshots
├── README.md
└── LICENSE
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/tn-farmer-marketplace.git
```

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on

```
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Frontend runs on

```
http://localhost:3000
```

---

# 🔑 Environment Variables

Create a `.env` file inside the **backend** folder.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:3000

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

---

# 🧪 Test Flow

1. Register as Farmer, Customer, or Bulk Buyer.
2. Login using your mobile number and password.
3. Farmers upload Government ID.
4. Admin verifies the Government ID.
5. Farmers publish products.
6. Customers browse products.
7. Add products to cart.
8. Place orders.
9. Chat with farmers.
10. Start a video call.
11. Complete payment using Razorpay or Cash on Delivery.

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Authorization
- Secure File Upload using Multer
- Input Validation

---

# 📡 APIs & Libraries

- Razorpay Payment Gateway
- Socket.io
- WebRTC (simple-peer)
- MongoDB Atlas (Optional)

---

# 🌍 Supported Districts

Supports all **38 districts of Tamil Nadu** for product discovery and filtering.

---

# 🚀 Future Enhancements

- AI-based Crop Price Prediction
- Weather Forecast Integration
- Delivery Tracking
- Product Reviews & Ratings
- Wishlist
- Push Notifications
- Email Notifications
- Mobile Application
- Analytics Dashboard

---

# 📊 Project Highlights

- Direct Farmer-to-Customer Marketplace
- Eliminates Middlemen
- Real-time Communication
- Secure Authentication
- Government ID Verification
- Digital Payments
- Multi-role Access Control
- Responsive User Interface

---

# 🌐 Demo Video


---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.

2. Create a new branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Added new feature"
```

4. Push to GitHub.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Srinivasan S**

Computer Science Engineering Student

GitHub:
https://github.com/SrinivasanSenthilKumar

LinkedIn:
https://www.linkedin.com/in/srinivasan-s1303/

---

## ⭐ Show Your Support

If you found this project useful, please consider giving it a **⭐ Star** on GitHub.

It helps others discover the project and motivates future improvements.
