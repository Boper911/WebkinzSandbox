import cv2
import numpy as np
import os
from PIL import Image
from pathlib import Path

def remove_northwest_color_blocks(image_path, output_path, debug_folder=None):
    """
    Remove solid color blocks from northwest quadrant after trimming whitespace
    """
    # Read image with alpha channel
    img_pil = Image.open(image_path).convert('RGBA')
    img_array = np.array(img_pil)
    
    # Separate RGB and alpha channels
    rgb = img_array[:, :, :3]
    alpha = img_array[:, :, 3]
    
    # Only process non-transparent areas
    non_transparent = alpha > 0
    
    if not np.any(non_transparent):
        img_pil.save(output_path)
        return False
    
    # STEP 1: Trim whitespace first
    trimmed_data = trim_to_content(rgb, alpha, non_transparent)
    if trimmed_data is None:
        img_pil.save(output_path)
        return False
    
    trimmed_rgb, trimmed_alpha, trim_bounds = trimmed_data
    min_y, max_y, min_x, max_x = trim_bounds
    
    # Convert trimmed image to BGR for processing
    trimmed_bgr = cv2.cvtColor(trimmed_rgb, cv2.COLOR_RGB2BGR)
    trimmed_non_transparent = trimmed_alpha > 0
    
    height, width = trimmed_bgr.shape[:2]
    
    # Define northwest quadrant on the TRIMMED image
    nw_height = height // 2
    nw_width = width // 2
    
    print(f"  Original size: {img_array.shape[1]}x{img_array.shape[0]}")
    print(f"  Trimmed to: {width}x{height}")
    print(f"  NW quadrant: (0,0) to ({nw_width},{nw_height})")
    
    # Find erroneous blocks in the trimmed image
    blocks_to_remove = find_erroneous_blocks_smart(
        trimmed_bgr, trimmed_non_transparent, nw_height, nw_width
    )
    
    # Create removal mask for trimmed image
    removal_mask_trimmed = np.zeros((height, width), dtype=np.uint8)
    for block in blocks_to_remove:
        removal_mask_trimmed[block] = 255
    
    # Map removal mask back to original image coordinates
    removal_mask_full = np.zeros(img_array.shape[:2], dtype=np.uint8)
    if np.any(removal_mask_trimmed):
        removal_mask_full[min_y:max_y+1, min_x:max_x+1] = removal_mask_trimmed
    
    # Save debug image
    if debug_folder:
        debug_path = Path(debug_folder)
        debug_path.mkdir(exist_ok=True)
        
        # Create debug image from original
        original_bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        debug_img = original_bgr.copy()
        
        # Mark trim bounds
        cv2.rectangle(debug_img, (min_x, min_y), (max_x, max_y), (0, 255, 255), 2)  # Cyan for trim
        # Mark NW quadrant in trimmed coordinates
        cv2.rectangle(debug_img, (min_x, min_y), (min_x + nw_width, min_y + nw_height), (255, 255, 0), 2)  # Yellow for NW
        
        if np.any(removal_mask_full):
            debug_img[removal_mask_full > 0] = [0, 0, 255]  # Red for removed areas
        
        debug_file = debug_path / f"{Path(image_path).stem}_debug.png"
        cv2.imwrite(str(debug_file), debug_img)
    
    # Apply removal to original image
    if np.any(removal_mask_full):
        alpha[removal_mask_full > 0] = 0
        result_array = np.dstack([rgb, alpha])
        result_img = Image.fromarray(result_array, 'RGBA')
        result_img.save(output_path)
        return True
    else:
        img_pil.save(output_path)
        return False

def trim_to_content(rgb, alpha, non_transparent):
    """
    Trim image to content bounds, removing whitespace
    """
    coords = np.where(non_transparent)
    if len(coords[0]) == 0:
        return None
    
    min_y, max_y = np.min(coords[0]), np.max(coords[0])
    min_x, max_x = np.min(coords[1]), np.max(coords[1])
    
    # Extract the trimmed region
    trimmed_rgb = rgb[min_y:max_y+1, min_x:max_x+1]
    trimmed_alpha = alpha[min_y:max_y+1, min_x:max_x+1]
    
    return trimmed_rgb, trimmed_alpha, (min_y, max_y, min_x, max_x)

def find_erroneous_blocks_smart(img_bgr, non_transparent, nw_height, nw_width):
    """
    Smart detection of erroneous blocks with better flood fill control
    """
    height, width = img_bgr.shape[:2]
    blocks_found = []
    processed = np.zeros((height, width), dtype=bool)
    
    # Find all connected components first to understand the image structure
    components = find_all_components(non_transparent)
    
    print(f"  Found {len(components)} distinct components in image")
    
    # Sample points in NW quadrant to find potential block seeds
    sample_step = 6
    
    for y in range(2, min(nw_height, height - 2), sample_step):
        for x in range(2, min(nw_width, width - 2), sample_step):
            
            if processed[y, x] or not non_transparent[y, x]:
                continue
            
            # Find which component this pixel belongs to
            pixel_component = None
            for i, component in enumerate(components):
                if component[y, x]:
                    pixel_component = i
                    break
            
            if pixel_component is None:
                continue
            
            # Check if this component looks like an erroneous block
            component_mask = components[pixel_component]
            
            # Mark this component as processed
            processed[component_mask] = True
            
            # Get the seed color for flood fill within this component
            seed_color = img_bgr[y, x]
            
            # Do controlled flood fill within this component only
            block_mask = controlled_flood_fill(
                img_bgr, component_mask, (y, x), seed_color, tolerance=8
            )
            
            if np.any(block_mask):
                # Analyze if this should be removed
                if should_remove_smart_block(img_bgr, block_mask, (y, x), components, pixel_component):
                    blocks_found.append(block_mask)
                    print(f"    ✓ Found erroneous block in component {pixel_component} at ({y}, {x})")
    
    return blocks_found

def find_all_components(non_transparent):
    """
    Find all spatially distinct components in the image
    """
    # Use connected components to find distinct objects
    num_labels, labels = cv2.connectedComponents(non_transparent.astype(np.uint8), connectivity=8)
    
    components = []
    for i in range(1, num_labels):  # Skip background (label 0)
        component_mask = (labels == i)
        if np.sum(component_mask) > 50:  # Only keep components with reasonable size
            components.append(component_mask)
    
    return components

def controlled_flood_fill(img, component_mask, seed_point, seed_color, tolerance=8):
    """
    Flood fill within a specific component boundary
    """
    height, width = img.shape[:2]
    result = np.zeros((height, width), dtype=bool)
    visited = np.zeros((height, width), dtype=bool)
    
    stack = [seed_point]
    
    while stack:
        y, x = stack.pop()
        
        if (y < 0 or y >= height or x < 0 or x >= width or 
            visited[y, x] or not component_mask[y, x]):
            continue
        
        # Check color similarity
        pixel_color = img[y, x]
        color_diff = np.sqrt(np.sum((pixel_color - seed_color) ** 2))
        
        if color_diff > tolerance:
            continue
        
        visited[y, x] = True
        result[y, x] = True
        
        # Add neighbors
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            stack.append((y + dy, x + dx))
    
    return result

def should_remove_smart_block(img, block_mask, seed_point, all_components, component_index):
    """
    Smart analysis to determine if a block should be removed
    """
    if not np.any(block_mask):
        return False
    
    seed_y, seed_x = seed_point
    block_pixels = img[block_mask]
    block_size = np.sum(block_mask)
    
    if len(block_pixels) == 0 or block_size < 80:
        return False
    
    # Get the component this block belongs to
    component_mask = all_components[component_index]
    component_size = np.sum(component_mask)
    
    # Check color uniformity
    color_std = np.std(block_pixels, axis=0)
    is_uniform = np.all(color_std < 12)
    
    # Check if block takes up most of its component (suspicious)
    block_ratio_in_component = block_size / component_size if component_size > 0 else 0
    dominates_component = block_ratio_in_component > 0.7
    
    # Check size relative to all content
    total_content = sum(np.sum(comp) for comp in all_components)
    size_ratio = block_size / total_content if total_content > 0 else 0
    is_reasonable_size = 0.01 < size_ratio < 0.3  # 1% to 30% of total content
    
    # Check if component is small relative to others (isolated blocks tend to be smaller)
    component_sizes = [np.sum(comp) for comp in all_components]
    avg_component_size = np.mean(component_sizes) if component_sizes else 1
    is_small_component = component_size < avg_component_size * 0.5
    
    # Get bounding box properties
    coords = np.where(block_mask)
    min_y, max_y = np.min(coords[0]), np.max(coords[0])
    min_x, max_x = np.min(coords[1]), np.max(coords[1])
    
    # Check if block is blob-like
    bounding_area = (max_y - min_y + 1) * (max_x - min_x + 1)
    density = block_size / bounding_area if bounding_area > 0 else 0
    is_blob_like = density > 0.4
    
    # Check color characteristics
    avg_color = np.mean(block_pixels, axis=0)
    hsv_color = cv2.cvtColor(avg_color.reshape(1, 1, 3).astype(np.uint8), cv2.COLOR_BGR2HSV)
    saturation = hsv_color[0, 0, 1]
    value = hsv_color[0, 0, 2]
    
    is_suspicious_color = (
        (saturation > 100 and value > 150) or  # Bright saturated
        value < 35 or                          # Very dark
        value > 220                            # Very bright
    )
    
    print(f"      Component {component_index} analysis:")
    print(f"        Block size: {block_size}/{component_size} ({block_ratio_in_component:.1%} of component)")
    print(f"        Uniform: {is_uniform}, Small component: {is_small_component}")
    print(f"        Dominates component: {dominates_component}, Reasonable size: {is_reasonable_size}")
    print(f"        Suspicious color: {is_suspicious_color}, Blob-like: {is_blob_like}")
    
    # Decision criteria - be more conservative
    criteria = [
        is_uniform,
        dominates_component or is_small_component,  # Either dominates its component OR component is small
        is_reasonable_size,
        is_suspicious_color,
        is_blob_like
    ]
    
    criteria_met = sum(criteria)
    should_remove = criteria_met >= 4  # Need 4 out of 5 criteria
    
    print(f"        -> Decision: {'REMOVE' if should_remove else 'KEEP'} ({criteria_met}/5 criteria)")
    
    return should_remove

def process_images_nw_targeted(input_folder, output_folder, debug_folder=None):
    """
    Process images with northwest-targeted block removal
    """
    input_path = Path(input_folder)
    output_path = Path(output_folder)
    output_path.mkdir(exist_ok=True)
    
    if debug_folder:
        debug_path = Path(debug_folder)
        debug_path.mkdir(exist_ok=True)
    
    supported_formats = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
    
    processed_count = 0
    modified_count = 0
    
    for img_file in input_path.iterdir():
        if img_file.suffix.lower() in supported_formats:
            print(f"Processing: {img_file.name}")
            
            output_file = output_path / img_file.name
            
            try:
                if output_file.suffix.lower() != '.png':
                    output_file = output_file.with_suffix('.png')
                
                if remove_northwest_color_blocks(str(img_file), str(output_file), debug_folder):
                    modified_count += 1
                    print(f"  ✓ Removed erroneous blocks")
                else:
                    print(f"  - No erroneous blocks found")
                
                processed_count += 1
                
            except Exception as e:
                print(f"  ✗ Error processing {img_file.name}: {e}")
                import traceback
                traceback.print_exc()
    
    print(f"\nProcessing complete!")
    print(f"Total images processed: {processed_count}")
    print(f"Images with blocks removed: {modified_count}")

# Usage
if __name__ == "__main__":
    input_folder = "images/rotatable_cleaned/fix"
    output_folder = "images/rotatable_cleaned"
    debug_folder = "images/rotatable_cleaned/debug_images"
    
    if not os.path.exists(input_folder):
        print(f"Error: Input folder '{input_folder}' not found!")
    else:
        process_images_nw_targeted(input_folder, output_folder, debug_folder)