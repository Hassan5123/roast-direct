from flask import jsonify
import logging

def register_error_handlers(app):
    """Global error handlers"""
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Not Found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f'Server Error: {error}', exc_info=True)
        
        return jsonify({
            'error': 'Internal Server Error',
            'message': 'Something went wrong on the server'
        }), 500