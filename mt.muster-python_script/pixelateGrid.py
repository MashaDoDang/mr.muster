import cv2
import numpy as np

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

def generate_pixelated_image(image_path, is_height, block_num, max_colors, thick_line_freq, scale_factor=2):
    # Load the original image
    original_image = cv2.imread(image_path)
    if original_image is None:
        print("Error: Unable to load the image.")
        return

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

    # Divide the image into blocks of uniform color
    pixelated_image = np.zeros_like(clustered_image)
    used_colors = set()  # Set of all used colors
    for i in range(0, clustered_image.shape[0], block_size_height):
        for j in range(0, clustered_image.shape[1], block_size_width):
            color = clustered_image[i, j]
            pixelated_image[i:i+block_size_height, j:j+block_size_width] = color
            used_colors.add(tuple(color))  # Add the color to the set of used colors

    # Add grid lines to the image
    pixelated_image_with_grid = draw_grid(pixelated_image, block_size_height, block_size_width, thick_line_freq)

    # Save the transformed image
    output_path = "pixelated_" + image_path.split("/")[-1]
    cv2.imwrite(output_path, pixelated_image_with_grid)
    print("Image has been generated and saved as:", output_path)

    # Print all used colors in hexadecimal format
    print("Used colors (hex):")
    for color in used_colors:
        hex_color = '#{:02x}{:02x}{:02x}'.format(*color)
        print(hex_color)

# Parameters
image_path = "hampter.jpg" 
is_height = False        # If True, the user specifies the number of blocks in height, otherwise in width
block_num = 40          # Number of blocks in the specified direction
max_colors = 50         # Maximum number of different colors
thick_line_freq = 5     # Frequency of thick grid lines (every fifth block)
scale_factor = 2        # Scaling factor

# Call the function to generate the transformed image
generate_pixelated_image(image_path, is_height, block_num, max_colors, thick_line_freq, scale_factor)
