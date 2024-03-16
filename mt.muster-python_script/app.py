import pyrebase
from flask import Flask, render_template, url_for

app = Flask(__name__)

config = {
    "apiKey": "AIzaSyBetvNQsimhEVYx5iMVW8RpN0mCpfR9IS4",
    "authDomain": "pixel-project-b5752.firebaseapp.com",
    "databaseURL": "https://pixel-project-b5752-default-rtdb.europe-west1.firebasedatabase.app",
    "projectId": "pixel-project-b5752",
    "storageBucket": "pixel-project-b5752.appspot.com",
    "messagingSenderId": "837769034914",
    "appId": "1:837769034914:web:ab347bf4fa0e910a27abfb",
    "measurementId": "G-7CHKVK2S7L"
}
firebase = pyrebase.initialize_app(config)
db = firebase.database()

@app.route('/nav_page')
def nav_page():
    return render_template('nav_index.html')

@app.route('/')
def log_page():
    user_data = db.child("users").get().val()
    if user_data:
        user_id, user_info = next(iter(user_data.items()))
        user_name = f"{user_info['firstName']} {user_info['lastName']}"
        return render_template('log_index.html', user_name=user_name)
    else:
        return render_template('log_index.html', user_name="Guest")

#db.child("users").push({"userID":"1", "firstName":"John", "lastName":"Doe"})

if __name__ == "__main__":
    app.run(debug=True)