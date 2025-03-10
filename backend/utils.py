import cv2
import numpy as np

def biggestContour(contours):
    biggest = np.array([])
    max_area = 0
    for i in contours:
        area = cv2.contourArea(i)
        if area > 5000:
            peri = cv2.arcLength(i, True)
            approx = cv2.approxPolyDP(i, 0.02 * peri, True)
            if area > max_area and len(approx) == 4:
                biggest = approx
                max_area = area
    return biggest, max_area

def reorder(myPoints):

    myPoints = myPoints.reshape((4,2))
    myPointsNew = np.zeros((4, 1, 2), dtype=np.int32)
    add = myPoints.sum(1)
    
    myPointsNew[0] = myPoints[np.argmin(add)]
    myPointsNew[3] = myPoints[np.argmax(add)]
    diff = np.diff(myPoints, axis=1)
    myPointsNew[1] = myPoints[np.argmin(diff)]
    myPointsNew[2] = myPoints[np.argmax(diff)]

    return myPointsNew

def drawRectangle(image, points, thickness=2, color=(0, 255, 0)):
    """
    Draws a rectangle on an image given four corner points.

    :param image: The image on which to draw.
    :param points: A NumPy array of four corner points (shape: (4,1,2)).
    :param thickness: Line thickness.
    :param color: BGR color for the rectangle.
    :return: The image with the drawn rectangle.
    """
    if points is None:
        raise ValueError("Error: The points array is None.")

    if not isinstance(points, np.ndarray):
        raise TypeError("Error: Points must be a NumPy array.")

    if points.shape != (4, 1, 2):
        raise ValueError(f"Error: Expected shape (4,1,2), but got {points.shape}")

    points = points.reshape(4, 2)  # Convert to (4,2) format

    for i in range(4):
        pt1 = tuple(points[i])
        pt2 = tuple(points[(i + 1) % 4])  # Connect to the next point
        cv2.line(image, pt1, pt2, color, thickness)

    return image