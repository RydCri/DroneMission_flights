from flask import Blueprint, request, send_file
import tempfile, os
from simplekml import Kml
import zipfile

export = Blueprint('export', __name__)

@export.route('/export', methods=['POST'])
def export_wayline():
    data = request.json
    mission = data.get('mission')  # list of [lat, lon]
    format = data.get('format', 'kml')  # 'kml' or 'kmz'

    if not mission:
        return {"error": "No mission data provided"}, 400

    kml = Kml()
    linestring = kml.newlinestring(name="Drone Path")
    linestring.coords = mission
    linestring.extrude = 1
    linestring.altitudemode = "clampToGround"
    linestring.style.linestyle.color = "ff0000ff"  # red
    linestring.style.linestyle.width = 3

    with tempfile.TemporaryDirectory() as tmpdir:
        kml_path = os.path.join(tmpdir, "wayline.kml")
        kml.save(kml_path)

        if format == 'kmz':
            kmz_path = os.path.join(tmpdir, "wayline.kmz")
            with zipfile.ZipFile(kmz_path, 'w', zipfile.ZIP_DEFLATED) as zf:
                zf.write(kml_path, arcname="doc.kml")
            return send_file(kmz_path, as_attachment=True)
        else:
            return send_file(kml_path, as_attachment=True)
