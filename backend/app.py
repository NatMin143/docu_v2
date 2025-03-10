from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from rembg import remove
import pytesseract
from pdf2image import convert_from_bytes
from PIL import Image
import cv2
import numpy as np
import io
from utils import biggestContour, reorder, drawRectangle
from cvzone.SelfiSegmentationModule import SelfiSegmentation

app = Flask(__name__)
CORS(app)

def extractP(image):
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
    # Apply Gaussian Blur
    imgBlur = cv2.GaussianBlur(gray, (5, 5), 1)

    return imgBlur

def bgRemover(image):
    reImg = remove(image)

    return reImg

def scanVideo(image, scale=0.5):
    try:
        # Resize image while maintaining aspect ratio
        # height, width = image.shape[:2]
        # new_width = int(width * scale)
        # new_height = int(height * scale)
        # image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        rmImg = image

        # Convert to grayscale
        gray = cv2.cvtColor(rmImg, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian Blur
        imgBlur = cv2.GaussianBlur(gray, (5, 5), 1)

        # Apply Canny Edge Detection
        # You might need to experiment with threshold values
        imgThreshold = cv2.Canny(imgBlur, threshold1=50, threshold2=150)

        # Morphological operations to improve edge contours
        kernel = np.ones((5, 5), np.uint8)
        imgDial = cv2.dilate(imgThreshold, kernel, iterations=2)
        imgThreshold = cv2.erode(imgDial, kernel, iterations=1)

        # Find contours
        contours, hierarchy = cv2.findContours(imgThreshold, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Draw contours on a copy of the original image
        imgCon = image.copy()
        
        cv2.drawContours(imgCon, contours, -1, (0, 255, 0), 2)  # You can change color and thickness as needed

        _, buffer = cv2.imencode('.png', imgCon)

        return buffer
    except:
        print("HAHA")

def scanImg(image, scale=0.5):
    try:
        # Resize image while maintaining aspect ratio
        height, width = image.shape[:2]
        new_width = int(width * scale)
        new_height = int(height * scale)
        image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
        rmImg = 0

        # Remove the background
        rmImg = bgRemover(image)


        print(rmImg)
        # Convert to grayscale
        gray = cv2.cvtColor(rmImg, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian Blur
        imgBlur = cv2.GaussianBlur(gray, (5, 5), 1)

        # Apply Canny Edge Detection
        # You might need to experiment with threshold values
        imgThreshold = cv2.Canny(imgBlur, threshold1=50, threshold2=150)

        # Morphological operations to improve edge contours
        kernel = np.ones((5, 5), np.uint8)
        imgDial = cv2.dilate(imgThreshold, kernel, iterations=2)
        imgThreshold = cv2.erode(imgDial, kernel, iterations=1)

        # Find contours
        contours, hierarchy = cv2.findContours(imgThreshold, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Draw contours on a copy of the original image
        imgCon = image.copy()
        
        cv2.drawContours(imgCon, contours, -1, (0, 255, 0), 2)  # You can change color and thickness as needed
        
        biggest, maxArea = biggestContour(contours)
        print("Biggest", biggest)
        if biggest.size != 0:
            print("Until here")
            biggest=reorder(biggest)
            print("Until here 2")
            print(biggest)
            cv2.drawContours(imgCon, biggest, -1, (0,255,0), 20)
            print("Until here 3")
            print(biggest)
            imgCon=drawRectangle(imgCon, biggest, 2)
            print("Until here 4")
            pts1 = np.float32(biggest)
            pts2 = np.float32([[0,0], [new_width, 0], [0, new_height], [new_width, new_height]])
            matrix = cv2.getPerspectiveTransform(pts1, pts2)
            imgWarpedColored = cv2.warpPerspective(image, matrix, (new_width, new_height))

            imgWarpedColored=imgWarpedColored[20:imgWarpedColored.shape[0] - 10, 20:imgWarpedColored.shape[1] -10]
            imgWarpedColored= cv2.resize(imgWarpedColored, (new_width, new_height))

            imgWarpGray = cv2.cvtColor(imgWarpedColored, cv2.COLOR_BGR2GRAY)
            imgAdaptiveThre = cv2.adaptiveThreshold(imgWarpGray, 255, 1, 1, 7, 2)
            imgAdaptiveThre = cv2.bitwise_not(imgAdaptiveThre)
            imgAdaptiveThre = cv2.medianBlur(imgAdaptiveThre, 3)
        # Encode the processed image to PNG
        _, buffer = cv2.imencode('.png', imgAdaptiveThre)

        return buffer

    except Exception as e:
        print(f"Error: {e}")
        return None

@app.route('/scanner', methods=['POST'])
def scanner():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    
    file = request.files['file']
    print(file)
    scan_on = request.form.get('scanOn', '')
    print(scan_on)
    
    
    image_np = np.frombuffer(file.read(), np.uint8)

    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    
    if image is None:
        return jsonify({'error': 'Invalid image data'}), 400
    print("Before Process")
    preprocessed_image = scanImg(image) if scan_on == "image" else scanVideo(image)

    if preprocessed_image is None:
        return jsonify({'error': 'Error processing image'}), 500

    image_bytes = io.BytesIO(preprocessed_image)
    image_bytes.seek(0)
    return send_file(image_bytes, mimetype='image/png')

@app.route('/extract-text', methods=['POST'])
def extract_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    print(file)
    filename = file.filename.lower()
    print(filename)

    if filename.endswith('.pdf'):
        try:
            images = convert_from_bytes(file.read())
            extracted_text = []
            for image in images:
                image_np = np.array(image)
                processed_image = extractP(image_np)
                text = pytesseract.image_to_string(processed_image)
                extracted_text.append(text.strip())
            return jsonify({'text': "\n".join(extracted_text)})
        except Exception as e:
            return jsonify({'error': f'OCR processing failed: {str(e)}'}), 500

    elif filename.endswith(('.png', '.jpg', '.jpeg')):
        try:
            image = Image.open(file)
            image_np = np.array(image)
            processed_image = extractP(image_np)
            text = pytesseract.image_to_string(processed_image)
            print(text)
            return jsonify({'text': text.strip()})
        except Exception as e:
            return jsonify({'error': f'Image OCR processing failed: {str(e)}'}), 500
    else:
        return jsonify({'error': 'Only PDF and image files are supported'}), 400
    
@app.route('/bg-remover', methods=['POST'])
def bg_remover():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if not file.filename.lower().endswith(('png', 'jpg', 'jpeg')):
        return jsonify({'error': 'Unsupported file type'}), 400

    image_np = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    
    if image is None:
        return jsonify({'error': 'Invalid image data'}), 400

    removed_bg_img = bgRemover(image)
    _, buffer = cv2.imencode('.png', removed_bg_img)

    if buffer is None:
        return jsonify({'error': 'Error processing image'}), 500

    
    image_bytes = io.BytesIO(buffer)
    print(image_bytes)
    image_bytes.seek(0)
    return send_file(image_bytes, mimetype='image/png')

segmentor = SelfiSegmentation()

@app.route('/process-video-bgRemover', methods=['POST'])
def process_image():
    file = request.files['file'].read()
    np_arr = np.frombuffer(file, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Process the image
    imgOut = segmentor.removeBG(img, (255, 0, 0))

    # Convert processed image back to send to frontend
    _, img_encoded = cv2.imencode('.jpg', imgOut)
    return send_file(io.BytesIO(img_encoded.tobytes()), mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True)
