import base64
from flask import Flask, request, jsonify, send_file
import cv2
import numpy as np
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

def draw_grid(image, block_size_height, block_size_width, thick_line_freq):
    # Copy the image to avoid modifying the original
    image_with_grid = image.copy()
    
    # Draw the grid
    for i in range(0, image.shape[0], block_size_height):
        thickness = 1 if (i // block_size_height) % thick_line_freq != 0 else 2
        cv2.line(image_with_grid, (0, i), (image.shape[1], i), (0, 0, 0), thickness)
    
    for j in range(0, image.shape[1], block_size_width):
        thickness = 1 if (j // block_size_width) % thick_line_freq != 0 else 2
        cv2.line(image_with_grid, (j, 0), (j, image.shape[0]), (0, 0, 0), thickness)
    
    return image_with_grid

# Adjusted generate_pixelated_image function for integration
def generate_pixelated_image(image_path, is_height, block_num, max_colors, thick_line_freq, scale_factor=2, generateGrid=False):
    # Load the original image
    original_image = cv2.imread(image_path)
    if original_image is None:
        return None, "Error: Unable to load the image."

    # Resize the input image
    original_height, original_width = original_image.shape[:2]
    scaled_height, scaled_width = int(original_height * scale_factor), int(original_width * scale_factor)
    original_image_resized = cv2.resize(original_image, (scaled_width, scaled_height))

    # Calculate new block dimensions
    if is_height:
        block_size_height = original_image_resized.shape[0] // block_num
        block_size_width = block_size_height  # Proportional to height
    else:
        block_size_width = original_image_resized.shape[1] // block_num
        block_size_height = block_size_width  # Proportional to width

    # Crop the image into square blocks
    new_height = (original_image_resized.shape[0] // block_size_height) * block_size_height
    new_width = (original_image_resized.shape[1] // block_size_width) * block_size_width
    cropped_image = original_image_resized[:new_height, :new_width]

    # Reduce the number of colors using clustering
    reduced_image = cv2.pyrMeanShiftFiltering(cropped_image, 20, 20)
    reshaped_image = reduced_image.reshape(-1, 3)

    # Color clustering
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    _, labels, centers = cv2.kmeans(reshaped_image.astype(np.float32), max_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

    # Select a representative color for each cluster
    dominant_colors = np.uint8(centers)
    mapped_colors = dominant_colors[labels.flatten()]
    clustered_image = mapped_colors.reshape((reduced_image.shape))
    print("Image has been clustered into", max_colors, "colors.")

    # Divide the image into blocks of uniform color
    pixelated_image = np.zeros_like(clustered_image)
    used_colors = set()  # Set of all used colors
    for i in range(0, clustered_image.shape[0], block_size_height):
        for j in range(0, clustered_image.shape[1], block_size_width):
            color = clustered_image[i, j]
            pixelated_image[i:i+block_size_height, j:j+block_size_width] = color
            used_colors.add(tuple(color))  # Add the color to the set of used colors

    if generateGrid:
        # Add grid lines to the image
        pixelated_image = draw_grid(pixelated_image, block_size_height, block_size_width, thick_line_freq)

    # Save the transformed image
    output_path = "pixelated_" + image_path.split("/")[-1]
    cv2.imwrite(output_path, pixelated_image)
    print("Image has been generated and saved as:", output_path)

    # Convert used_colors set to list for serialization
    used_colors_hex = ['#{:02x}{:02x}{:02x}'.format(*color) for color in used_colors]

    return output_path, None, used_colors_hex  # Return colors as a list of hex strings  

@app.route('/pixelate_image', methods=['POST'])
def pixelate_image():
    image_file = request.files['image']
    is_height = request.form['is_height'] == 'true'
    block_num = int(request.form['block_num'])
    max_colors = int(request.form['max_colors'])
    thick_line_freq = int(request.form['thick_line_freq'])
    scale_factor = float(request.form['scale_factor'])
    generate_grid = request.form['generate_grid'] == 'true'

    # Save the image to a temporary path or process in-memory
    temp_path = './temp_image.jpg'
    image_file.save(temp_path)

    # Process the image
    output_path, _, used_colors_hex = generate_pixelated_image(temp_path, is_height, block_num, max_colors, thick_line_freq, scale_factor, generate_grid)
    
    # Convert the image to base64
    with open(output_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')

    # Return the image and the used colors
    return jsonify({'image': encoded_string, 'colors': used_colors_hex})

if __name__ == '__main__':
    app.run(debug=True)
    