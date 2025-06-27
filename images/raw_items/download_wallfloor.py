import os
import time
import csv
import requests

# Define folders for saving images
FOLDERS = {
    "wallfloor": "images/wallfloor",
}

# Ensure folders exist
for folder in FOLDERS.values():
    os.makedirs(folder, exist_ok=True)

def download_image(url, save_path):
    """Download an image from a URL and save it to a file."""
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "image/*"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200 and "image" in response.headers.get("Content-Type", ""):
            with open(save_path, "wb") as file:
                file.write(response.content)
            print(f"Downloaded: {save_path}")
        else:
            print(f"Failed ({response.status_code}): {url}")
    except Exception as e:
        print(f"Error downloading {url}: {e}")

def download_images_from_csv(csv_file):
    """Download images from a CSV file."""
    with open(csv_file, newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        data = list(reader)

    # Assuming CSV structure:
    # - Maintenance: Column 3 (Name), Column 6 (URL)
    # - Rotatable: Columns 7-10 (URLs), Columns 11-14 (Names)
    # - Wall/Floor: Columns 7-9 (URLs), Columns 10-12 (Names)
    for i in range(1, len(data)):
        for j in range(3):
            url = data[i][14 + j]  # Columns O-Q
            name = data[i][17 + j]  # Columns R-T
            if url and name:
                save_path = os.path.join(FOLDERS["wallfloor"], f"{name}.png")
                download_image(url, save_path)
            time.sleep(1)
     

if __name__ == "__main__":
    csv_filename = "Download item images.csv"  # Update with your actual CSV file name
    download_images_from_csv(csv_filename)
