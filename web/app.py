#!/usr/bin/env python3
"""
Flask-SocketIO Web Application for English Learning Voice Assistant
Phase 1: Basic foundation with Flask-SocketIO and basic UI
"""

import os
import sys
import ssl
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
from datetime import datetime
import logging
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize Flask-SocketIO with threading mode (as per specification)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    allow_unsafe_werkzeug=True,  # Python 3.13 compatibility
    async_mode='threading',      # Use threading instead of eventlet
    path='/ws/socket.io'         # Explicit WebSocket path
)

# Scene and role data (temporary - will be moved to config file)
SCENE_ROLE_DATA = {
    "scenes": [
        {
            "id": "restaurant",
            "name": "Restaurant",
            "icon": "🍽️",
            "roles": {
                "user": ["customer", "waiter"],
                "ai": ["waiter", "customer"]
            }
        },
        {
            "id": "hotel",
            "name": "Hotel",
            "icon": "🏨",
            "roles": {
                "user": ["guest", "receptionist"],
                "ai": ["receptionist", "guest"]
            }
        },
        {
            "id": "airport",
            "name": "Airport",
            "icon": "✈️",
            "roles": {
                "user": ["passenger", "staff"],
                "ai": ["staff", "passenger"]
            }
        },
        {
            "id": "shopping",
            "name": "Shopping",
            "icon": "🛍️",
            "roles": {
                "user": ["customer", "clerk"],
                "ai": ["clerk", "customer"]
            }
        }
    ]
}

# Routes
@app.route('/')
def index():
    """Serve the main application page"""
    return render_template('index.html')

@app.route('/api/scenes', methods=['GET'])
def get_scenes():
    """Get available scenes and roles"""
    return jsonify(SCENE_ROLE_DATA)

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get application configuration"""
    return jsonify({
        'audio_settings': {
            'sampleRate': 16000,
            'channelCount': 1,
            'echoCancellation': True,
            'noiseSuppression': True
        },
        'supported_languages': ['ja', 'en']
    })

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connection_established', {'status': 'connected', 'timestamp': datetime.now().isoformat()})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {request.sid}")

@socketio.on('select_scene_role')
def handle_scene_role_selection(data):
    """Handle scene and role selection"""
    scene = data.get('scene')
    user_role = data.get('user_role')
    ai_role = data.get('ai_role')
    
    logger.info(f"Scene selected: {scene}, User role: {user_role}, AI role: {ai_role}")
    
    # Send confirmation back to client
    emit('scene_role_confirmed', {
        'scene': scene,
        'user_role': user_role,
        'ai_role': ai_role,
        'status': 'ready'
    })

@socketio.on('start_session')
def handle_start_session():
    """Handle session start request"""
    logger.info("Session start requested")
    # In Phase 1, just acknowledge the request
    emit('session_status', {
        'status': 'active',
        'message': 'Session started (Phase 1 - no Gemini integration yet)'
    })

@socketio.on('stop_session')
def handle_stop_session():
    """Handle session stop request"""
    logger.info("Session stop requested")
    emit('session_status', {
        'status': 'inactive',
        'message': 'Session stopped'
    })

@socketio.on('audio_data')
def handle_audio_data(data):
    """Handle incoming audio data"""
    # In Phase 1, just acknowledge receipt
    logger.info("Audio data received")
    emit('audio_received', {
        'status': 'received',
        'message': 'Audio received (Phase 1 - no processing yet)'
    })

# HTTPS support for development
def create_self_signed_cert():
    """Create a self-signed certificate for development"""
    from werkzeug.security import generate_password_hash
    import subprocess
    
    cert_dir = os.path.join(os.path.dirname(__file__), 'certs')
    os.makedirs(cert_dir, exist_ok=True)
    
    cert_file = os.path.join(cert_dir, 'cert.pem')
    key_file = os.path.join(cert_dir, 'key.pem')
    
    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        # Generate self-signed certificate for development
        logger.info("Generating self-signed certificate for development...")
        try:
            subprocess.run([
                'openssl', 'req', '-x509', '-newkey', 'rsa:4096',
                '-keyout', key_file, '-out', cert_file,
                '-days', '365', '-nodes',
                '-subj', '/C=US/ST=State/L=City/O=Organization/CN=localhost'
            ], check=True)
            logger.info("Self-signed certificate generated successfully")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to generate certificate: {e}")
            return None, None
    
    return cert_file, key_file

if __name__ == '__main__':
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='English Learning Voice Assistant Web App')
    parser.add_argument('--port', type=int, default=os.environ.get('PORT', 5001),
                        help='Port to run the server on (default: 5001)')
    parser.add_argument('--host', default='0.0.0.0',
                        help='Host to bind to (default: 0.0.0.0)')
    parser.add_argument('--no-ssl', action='store_true',
                        help='Disable SSL in development mode')
    args = parser.parse_args()
    
    # Check if running in production or development
    is_production = os.environ.get('FLASK_ENV') == 'production'
    
    if is_production:
        # Production: Use proper SSL certificates
        cert_path = os.environ.get('SSL_CERT_PATH', '/etc/letsencrypt/live/yourdomain.com/')
        cert_file = os.path.join(cert_path, 'fullchain.pem')
        key_file = os.path.join(cert_path, 'privkey.pem')
        
        if os.path.exists(cert_file) and os.path.exists(key_file):
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain(cert_file, key_file)
            socketio.run(app, host=args.host, port=443, ssl_context=context)
        else:
            logger.error("SSL certificates not found. Please set up Let's Encrypt certificates.")
            socketio.run(app, host=args.host, port=args.port, debug=False)
    else:
        # Development: Use self-signed certificate or HTTP
        logger.info(f"Running in development mode on port {args.port}")
        
        if not args.no_ssl:
            cert_file, key_file = create_self_signed_cert()
            
            if cert_file and key_file:
                context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                context.load_cert_chain(cert_file, key_file)
                logger.info(f"Starting server with SSL on https://{args.host}:{args.port}")
                socketio.run(app, host=args.host, port=args.port, ssl_context=context, debug=True)
            else:
                # Fall back to HTTP
                logger.info(f"Starting server without SSL on http://{args.host}:{args.port}")
                socketio.run(app, host=args.host, port=args.port, debug=True)
        else:
            # Run without SSL
            logger.info(f"Starting server without SSL on http://{args.host}:{args.port}")
            socketio.run(app, host=args.host, port=args.port, debug=True)