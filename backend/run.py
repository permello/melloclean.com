"""Entry point for the Flask application.

Starts the development server on 0.0.0.0:5000 with debug mode.
"""

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
