from PIL import Image
import os

os.makedirs('assets/inspiration', exist_ok=True)
os.makedirs('assets/generated', exist_ok=True)

# 1. Crop 15 runway looks from image2.png
img2 = Image.open('assets/image2.png')
# Columns: 5 columns
# Rows: 3 rows
col_coords = [
    (88, 246),
    (264, 422),
    (439, 597),
    (615, 773),
    (790, 948)
]
row_coords = [
    (155, 342),
    (354, 541),
    (553, 740)
]

count = 1
for r_idx, (y1, y2) in enumerate(row_coords):
    for c_idx, (x1, x2) in enumerate(col_coords):
        crop = img2.crop((x1, y1, x2, y2))
        crop.save(f'assets/inspiration/runway_{count}.png')
        count += 1

print(f"Saved {count-1} runway images.")

# 2. Crop generated images from image3.jpeg
img3 = Image.open('assets/image3.jpeg')
# Section 1: Moodboard (around y: 80 to 345)
# 4 items roughly at:
# item 1: (85, 80, 225, 345)
# item 2: (240, 80, 375, 345)
# item 3: (390, 80, 525, 345)
# item 4: (540, 80, 675, 345)
mood_coords = [
    (85, 80, 225, 345),
    (240, 80, 375, 345),
    (390, 80, 525, 345),
    (540, 80, 675, 345)
]
for idx, coords in enumerate(mood_coords):
    crop = img3.crop(coords)
    crop.save(f'assets/generated/mood_{idx+1}.png')

# Section 2: Color & Fabric
color_coords = [
    (85, 450, 225, 715),
    (240, 450, 375, 715),
    (390, 450, 525, 715)
]
for idx, coords in enumerate(color_coords):
    crop = img3.crop(coords)
    crop.save(f'assets/generated/color_{idx+1}.png')

print("Generated assets cropped successfully!")
