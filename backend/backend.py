import os
import subprocess
import pandas as pd

from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_cors import CORS


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)

# Allow the deployed Vercel frontend to access this backend
CORS(app)


# ============================================================
# PATH SETUP
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

LOGS_DIR = os.path.join(BASE_DIR, "logs")
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")

HELMET_SNAPS = os.path.join(BASE_DIR, "helmetless__snaps")
MOBILE_SNAPS = os.path.join(BASE_DIR, "mobile_use_snaps")
TRIPLE_SNAPS = os.path.join(BASE_DIR, "snapshots", "triple_riding")
WRONGWAY_SNAPS = os.path.join(BASE_DIR, "violations", "wrong_way")

CSV_PATH = os.path.join(LOGS_DIR, "violations.csv")

INPUT_VIDEO_PATH = os.path.join(
    BASE_DIR,
    "INPUT_VIDEO.mp4"
)


# ============================================================
# CREATE REQUIRED DIRECTORIES
# ============================================================

os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)


# ============================================================
# HOME / HEALTH CHECK
# ============================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "RoadSense AI Backend is running",
        "service": "RoadSense Mobility Intelligence API"
    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy"
    })


# ============================================================
# GET VIOLATION DATA
# ============================================================

@app.route("/api/violations", methods=["GET"])
def get_violations():

    if not os.path.exists(CSV_PATH):
        return jsonify([])

    try:
        df = pd.read_csv(CSV_PATH)

        # Replace NaN values so JSON remains valid
        df = df.fillna("")

        records = df.to_dict(orient="records")

        return jsonify(records)

    except Exception as e:
        return jsonify({
            "error": "Unable to read violation data",
            "details": str(e)
        }), 500


# ============================================================
# DOWNLOAD CSV
# ============================================================

@app.route("/download/csv", methods=["GET"])
def download_csv():

    if not os.path.exists(CSV_PATH):
        return jsonify({
            "error": "CSV file not found"
        }), 404

    return send_file(
        CSV_PATH,
        as_attachment=True,
        download_name="violations.csv"
    )


# ============================================================
# SERVE PROCESSED VIDEOS
# ============================================================

@app.route("/videos/<path:filename>", methods=["GET"])
def serve_videos(filename):

    if not os.path.exists(
        os.path.join(OUTPUTS_DIR, filename)
    ):
        return jsonify({
            "error": "Video not found"
        }), 404

    return send_from_directory(
        OUTPUTS_DIR,
        filename
    )


# ============================================================
# SERVE EVIDENCE SNAPSHOTS
# ============================================================

@app.route("/snapshots/<path:filename>", methods=["GET"])
def serve_snapshots(filename):

    # Convert Windows-style path to URL-style path
    filename = filename.replace("\\", "/")

    folders = [
        HELMET_SNAPS,
        MOBILE_SNAPS,
        TRIPLE_SNAPS,
        WRONGWAY_SNAPS
    ]

    for folder in folders:

        file_path = os.path.join(
            folder,
            filename
        )

        if os.path.exists(file_path):

            return send_from_directory(
                folder,
                filename
            )

    return jsonify({
        "error": "Snapshot not found"
    }), 404


# ============================================================
# OPTIONAL VIDEO UPLOAD
# ============================================================

@app.route("/upload", methods=["POST"])
def upload_video():

    if "file" not in request.files:
        return jsonify({
            "error": "No file found"
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "error": "No filename provided"
        }), 400

    file.save(INPUT_VIDEO_PATH)

    return jsonify({
        "message": "Video uploaded successfully"
    })


# ============================================================
# OPTIONAL AI DETECTION
# ============================================================

@app.route("/run", methods=["POST"])
def run_detection():

    try:

        subprocess.run(
            ["python", "main.py"],
            cwd=BASE_DIR,
            check=True
        )

        return jsonify({
            "message": "Detection completed successfully"
        })

    except subprocess.CalledProcessError as e:

        return jsonify({
            "error": "Detection process failed",
            "details": str(e)
        }), 500


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    print("🚀 RoadSense AI Backend Running")

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
