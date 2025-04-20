from flask import Blueprint, request, jsonify, session
from ..models import User

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        session['user_id'] = user.id
        print("Session Created ", session['user_id'])
        return jsonify({"message": "Logged in successfully"}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401


@auth.route('/session')
def session_status():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        print("Get Session Called")
        return jsonify({'username': user.username, 'user_id': user.id})
    return jsonify({'message': 'Not logged in'}), 401


@auth.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out'}), 200

