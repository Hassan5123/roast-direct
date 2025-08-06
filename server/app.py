from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_database
from routes.auth_routes import auth_bp
from middlewares.error_handler import register_error_handlers

app = Flask(__name__)
CORS(app)

db = get_database()

# Register blueprints
app.register_blueprint(auth_bp)
register_error_handlers(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)

# source venv/bin/activate