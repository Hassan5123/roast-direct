from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_database
from routes.auth_routes import auth_bp

app = Flask(__name__)
CORS(app)

db = get_database()

# Register blueprints (like Express app.use())
app.register_blueprint(auth_bp)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5001)

# source venv/bin/activate