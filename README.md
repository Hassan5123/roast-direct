# RoastDirect

You can view and interact with the project at:
https://roast-direct-production-2a5f.up.railway.app


## 🚀 Overview

RoastDirect is a full-stack e-commerce platform designed to bring transparency and quality to online coffee shopping. Unlike typical online coffee shops that provide minimal information, RoastDirect offers comprehensive details about each coffee product, including roast dates, farm information, processing methods, and detailed tasting notes.

This project represents a modern approach to specialty coffee e-commerce, with an emphasis on user experience, transparency, and connecting consumers directly with quality coffee products.

## ✨ Features

- **User Authentication** - Secure login/signup system with JWT authentication
- **Product Browsing** - Detailed product listings with comprehensive coffee information
- **Shopping Cart** - Responsive and persistent cart management system
- **Order Cancellation** - Ability to cancel orders that are still processing
- **User Profiles** - Personal information management and order history


## 🛠️ Technology Stack

### Frontend
- **Next.js** - React framework for server-side rendering and static site generation
- **TypeScript** - For type safety and improved developer experience
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Context API** - For state management (cart, authentication)

### Backend
- **Python Flask** - Lightweight and flexible backend framework
- **MongoDB** - NoSQL database for flexible data storage
- **JWT Authentication** - Secure user authentication and authorization
- **RESTful API** - For client-server communication

### DevOps
- **Git/GitHub** - Version control and collaboration
- **Environment Configuration** - Separate development and production environments

## 🏗️ Architecture

RoastDirect follows a client-server architecture with clear separation of concerns:

### Client (Next.js)
- **Pages** - Route-based components for each view
- **Components** - Reusable UI elements
- **Utils** - Helper functions and context providers
- **Public** - Static assets like images

### Server (Flask)
- **Routes** - API endpoints definition
- **Controllers** - Business logic implementation
- **Models** - Data models and database interactions
- **Middleware** - Request processing and authentication

## 📋 Key Features in Detail

### Freshness Guarantee
All coffees displayed on RoastDirect are guaranteed to be within 2 weeks of their roast date. Products are automatically removed from the catalog once they exceed this freshness threshold.

### Coffee Transparency
Each product includes detailed information about:
- Origin country and region
- Farm/producer information
- Elevation
- Processing method
- Variety
- Detailed tasting notes
- Roast level

### Order Management System
- Complete order tracking
- Order status updates
- Ability to cancel orders in processing status
- Inventory is automatically restored when orders are canceled

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB

### Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run development server
npm run dev
```

### Backend Setup
```bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (copy .env.example to .env)
cp .env.example .env

# Run development server
python app.py
```

## 📱 User Interface

The interface prioritizes:

1. **Usability** - Intuitive navigation and interaction patterns
2. **Visual appeal** - Professional aesthetics that reflect quality coffee culture

## 🔒 Security

- **Authentication** - JWT-based secure authentication
- **Data protection** - Sensitive user information is properly encrypted
- **Input validation** - Both client and server-side validation

## 📈 Future Enhancements

- **Subscription service** - Regular coffee deliveries
- **Coffee quiz** - Personalized recommendations based on taste preferences
- **Reviews system** - Allow users to share experiences
- **Advanced filtering** - Find coffees based on taste profile, processing method, etc.
- **Coffee education section** - Learn about coffee origins, processing methods, and brewing guides


© 2025 RoastDirect | Designed and Developed by Hassan