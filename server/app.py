from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from db import get_database
from routes.auth_routes import auth_bp
from routes.product_routes import products_bp
from routes.order_routes import orders_bp
from middlewares.error_handler import register_error_handlers

app = Flask(__name__)
CORS(app)

db = get_database()

# Register blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(products_bp)
app.register_blueprint(orders_bp)
register_error_handlers(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    print(f"\n🚀 Server is running on port {port}")
    app.run(debug=False, host='0.0.0.0', port=port)  # Note: debug=False and host='0.0.0.0'

# source venv/bin/activate