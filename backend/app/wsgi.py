from app import create_app

app = create_app()

if __name__ == "__main__":
    # `flask run` will also pick this up
    app.run(host="0.0.0.0", port=5000)