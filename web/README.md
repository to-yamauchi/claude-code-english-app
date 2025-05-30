# English Learning Voice Assistant Web App

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

### Basic Usage (default port 5001)
```bash
python app.py
```

### Custom Port
If port 5001 is also in use, you can specify a different port:
```bash
python app.py --port 8080
```

Or use environment variable:
```bash
PORT=8080 python app.py
```

### Run without SSL (HTTP only)
```bash
python app.py --no-ssl
```

### macOS Note
Port 5000 is commonly used by AirPlay Receiver on macOS. The app now defaults to port 5001 to avoid this conflict. If you still encounter port conflicts, either:
- Disable AirPlay Receiver in System Preferences → General → AirDrop & Handoff
- Use a different port as shown above

## Command Line Options

- `--port PORT`: Specify the port to run on (default: 5001)
- `--host HOST`: Specify the host to bind to (default: 0.0.0.0)
- `--no-ssl`: Disable SSL and run with HTTP only

## Access the Application

- With SSL: `https://localhost:5001`
- Without SSL: `http://localhost:5001`

Note: When using SSL, your browser will show a security warning because the certificate is self-signed. This is normal for development - just proceed to the site.