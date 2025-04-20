from flask import Blueprint

missions = Blueprint('missions', __name__)

@missions.route('/')
def index():
    return {'message': 'Drone Mission Route Ready'}
