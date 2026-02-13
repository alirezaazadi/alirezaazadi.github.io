import os
import re
import shutil
import datetime

CONTENT_DIR = "content/posts"

def normalize_date(date_str):
    """Ensures date is YYYY-MM-DD"""
    try:
        return datetime.datetime.strptime(date_str, "%Y-%m-%d").strftime("%Y-%m-%d")
    except ValueError:
        return date_str

def process_post(folder_name):
    folder_path = os.path.join(CONTENT_DIR, folder_name)
    if not os.path.isdir(folder_path):
        return

    # Extract date and slug from folder name: YYYYMMDD_slug
    match = re.match(r"^(\d{8})_(.+)$", folder_name)
    if not match:
        print(f"Skipping {folder_name}: naming convention mismatch")
        return

    date_str = match.group(1) # YYYYMMDD
    slug = match.group(2)
    formatted_date = f"{date_str[:4]}-{date_str[4:6]}-{date_str[6:]}"

    print(f"Processing {folder_name} -> {slug} ({formatted_date})")

    index_path = os.path.join(folder_path, "index.md")
    if not os.path.exists(index_path):
        print(f"  No index.md found in {folder_name}")
        return

    # Create media folder
    media_path = os.path.join(folder_path, "media")
    if not os.path.exists(media_path):
        os.makedirs(media_path)

    # Read index.md
    with open(index_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse frontmatter
    frontmatter_match = re.search(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not frontmatter_match:
        print("  No frontmatter found")
        return
    
    frontmatter = frontmatter_match.group(1)
    body = content[frontmatter_match.end():]

    # Find cover image in frontmatter
    cover_image_match = re.search(r'image:\s*["\']?(\./)?([^"\']+)["\']?', frontmatter)
    cover_image_name = None
    if cover_image_match:
        cover_image_name = cover_image_match.group(2)
    
    # Identify images in folder
    files = os.listdir(folder_path)
    images = [f for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')) and os.path.isfile(os.path.join(folder_path, f))]

    # Map old filenames to new filenames
    file_map = {}

    # Logic: 
    # 1. If cover_image matches a file, that file becomes poster.ext
    # 2. If no cover_image defined but images exist:
    #    - If 1 image -> poster.ext
    #    - If multiple -> first one (alphabetical?) -> poster.ext? User said "first one".
    #      Let's pick alphabetical first if no cover arg.
    
    target_poster = None
    
    if cover_image_name and cover_image_name in images:
        target_poster = cover_image_name
    elif not cover_image_name and images:
        images.sort()
        target_poster = images[0]

    if target_poster:
        ext = os.path.splitext(target_poster)[1]
        new_name = f"poster{ext}"
        file_map[target_poster] = new_name
        
        # Move poster
        shutil.move(os.path.join(folder_path, target_poster), os.path.join(media_path, new_name))
        print(f"  Moved cover: {target_poster} -> media/{new_name}")

    # Move rest of images
    for img in images:
        if img == target_poster:
            continue
        
        # Move as is
        shutil.move(os.path.join(folder_path, img), os.path.join(media_path, img))
        file_map[img] = img
        print(f"  Moved image: {img} -> media/{img}")
        
    # Update content
    # 1. Update frontmatter date
    if f"date: " not in frontmatter: # regex check better
         pass # Should be there
    
    # Simple replace for date if it's there
    frontmatter = re.sub(r'date:\s*["\']?.*?["\']?$', f'date: "{formatted_date}"', frontmatter, flags=re.MULTILINE)

    # 2. Update frontmatter image
    if target_poster:
        ext = os.path.splitext(target_poster)[1]
        poster_name = f"poster{ext}"
        if "image:" in frontmatter:
            frontmatter = re.sub(r'image:.*$', f'image: "./media/{poster_name}"', frontmatter, flags=re.MULTILINE)
        else:
            frontmatter += f'\nimage: "./media/{poster_name}"'

    # 3. Update markdown links
    # Pattern: ![alt](url)
    def replace_link(match):
        alt = match.group(1)
        url = match.group(2)
        
        # Remove ./ prefix if present
        clean_url = url
        if clean_url.startswith("./"):
            clean_url = clean_url[2:]
            
        if clean_url in file_map:
            return f"![{alt}](media/{file_map[clean_url]})"
        
        # Process url encoded checks if needed... assuming simple names for now or matches
        return match.group(0)

    new_body = re.sub(r'!\[(.*?)\]\((.*?)\)', replace_link, body)

    # Reconstruct content
    new_content = f"---{frontmatter}\n---{new_body}"
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(new_content)

    # Clean up empty media folder if no images
    if not os.listdir(media_path):
        os.rmdir(media_path)

    # Rename folder
    new_folder_path = os.path.join(CONTENT_DIR, slug)
    # Check if exists
    if os.path.exists(new_folder_path):
        print(f"  Target folder {new_folder_path} exists! processing in-place or skipping rename.")
        # If we are just updating an already renamed one?
        # But we are iterating loop.
        # Let's assume safely we can move safely if it doesn't exist.
    else:
        os.rename(folder_path, new_folder_path)
        print(f"  Renamed folder to {slug}")

def main():
    if not os.path.exists(CONTENT_DIR):
        print("Content dir not found")
        return

    folders = os.listdir(CONTENT_DIR)
    for folder in folders:
        process_process = False
        # Filter for YYYYMMDD_slug pattern
        if re.match(r"^\d{8}_.+$", folder):
            process_post(folder)

if __name__ == "__main__":
    main()
