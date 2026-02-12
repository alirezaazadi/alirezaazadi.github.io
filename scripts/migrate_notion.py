import os
import re
import shutil
import datetime
from pathlib import Path
import urllib.parse
import unicodedata

# Configuration
SOURCE_DIR = Path("/Users/alireza/Projects/Personal/personal-blog/Archive/Alireza Azadi’s Blog")
DEST_DIR = Path("/Users/alireza/Projects/Personal/personal-blog/content/posts")

def normalize(s):
    return unicodedata.normalize('NFC', s)

def find_assets_folder(filename):
    # Filename: "Title Hash.md"
    # Content typically in folder "Title" (without hash)
    # But checking for normalization too.
    
    # 1. Try stripping hash
    base_name = filename.rsplit('.', 1)[0]
    candidate = re.sub(r'\s[a-f0-9]{32}$', '', base_name) # Strip hash
    
    candidate_path = SOURCE_DIR / candidate
    if os.path.exists(candidate_path) and os.path.isdir(candidate_path):
        return candidate_path
        
    # 2. Try searching dir with normalization
    normalized_candidate = normalize(candidate)
    
    for item in os.listdir(SOURCE_DIR):
        item_path = SOURCE_DIR / item
        if os.path.isdir(item_path):
            if normalize(item) == normalized_candidate:
                return item_path
            # Also try matching if item matches base_name (with hash? Unlikely based on observation)
            
    return None

def parse_notion_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if not lines:
        return None, {}, ""

    title = lines[0].strip().lstrip('#').strip()
    
    metadata = {}
    content_start_index = 1
    
    i = 1
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            if metadata:
                 content_start_index = i + 1
                 break
            i += 1
            continue
        
        match = re.match(r'^([^:]+):\s*(.*)$', line)
        if match:
            key = match.group(1).strip()
            value = match.group(2).strip()
            metadata[key] = value
            i += 1
        else:
            content_start_index = i
            break
            
    content = "".join(lines[content_start_index:])
    return title, metadata, content

def get_slug(title, metadata, filename):
    if 'slug' in metadata:
        return metadata['slug']
    
    base_name = filename.rsplit('.', 1)[0]
    base_name = re.sub(r'\s[a-f0-9]{32}$', '', base_name)
    
    slug = base_name.lower().replace(' ', '-')
    slug = re.sub(r'[^a-z0-9-]', '', slug)
    
    if not slug:
        slug = "untitled"
    return slug

def get_date(metadata):
    if 'date' in metadata:
        try:
            return datetime.datetime.strptime(metadata['date'], '%Y/%m/%d').strftime('%Y-%m-%d')
        except ValueError:
            pass
            
    if 'updatedAt' in metadata:
        try:
             dt = datetime.datetime.strptime(metadata['updatedAt'], '%B %d, %Y %I:%M %p')
             return dt.strftime('%Y-%m-%d')
        except ValueError:
            pass
            
    return datetime.date.today().strftime('%Y-%m-%d')

def start_migration():
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)
        
    for filename in os.listdir(SOURCE_DIR):
        if not filename.endswith(".md"):
            continue
            
        file_path = SOURCE_DIR / filename
        # print(f"Processing: {filename}")
        
        try:
            title, metadata, content = parse_notion_file(file_path)
            if not title:
                print(f"Skipping empty file: {filename}")
                continue
        except Exception as e:
            print(f"Error parsing {filename}: {e}")
            continue

        date_str = get_date(metadata)
        slug = get_slug(title, metadata, filename)
        
        date_prefix = date_str.replace('-', '')
        folder_name = f"{date_prefix}_{slug}"
        post_dir = DEST_DIR / folder_name
        
        if not os.path.exists(post_dir):
            os.makedirs(post_dir)
        
        # Find assets folder
        assets_folder_path = find_assets_folder(filename)
        
        def replace_image_link(match):
            alt_text = match.group(1)
            original_url = match.group(2)
            
            url_decoded = urllib.parse.unquote(original_url)
            image_filename = os.path.basename(url_decoded)
            
            # If we found an assets folder, look there
            if assets_folder_path:
                 source_image_path = assets_folder_path / image_filename
                 if os.path.exists(source_image_path):
                    # Copy
                    dest_image_path = post_dir / image_filename
                    shutil.copy2(source_image_path, dest_image_path)
                    return f"![{alt_text}]({image_filename})"
                 
                 # Try normalization on image filename too?
                 # Sometimes encoded filename differs from FS filename
                 normalized_img = normalize(image_filename)
                 for item in os.listdir(assets_folder_path):
                     if normalize(item) == normalized_img:
                         shutil.copy2(assets_folder_path / item, post_dir / item)
                         return f"![{alt_text}]({item})"

            # If check failed, maybe the URL path pointed somewhere else?
            # But we assume local images are in the asset folder.
            
            return match.group(0)

        new_content = re.sub(r'!\[(.*?)\]\((.*?)\)', replace_image_link, content)
        
        frontmatter = "---\n"
        frontmatter += f"title: \"{title}\"\n"
        frontmatter += f"date: \"{date_str}\"\n"
        
        summary = metadata.get('summary', '')
        if summary:
            summary = summary.replace('"', '\\"')
            frontmatter += f"summary: \"{summary}\"\n"
            
        if 'category' in metadata:
             raw_cats = metadata['category'].split(',')
             categories = [c.strip().lower() for c in raw_cats]
             frontmatter += f"categories: {categories}\n"
             
        frontmatter += "---\n\n"
        
        final_file_content = frontmatter + new_content
        
        with open(post_dir / "index.md", 'w', encoding='utf-8') as f:
            f.write(final_file_content)
            
        # print(f"Migrated {filename} -> {post_dir}/index.md")

    print("Migration complete.")

if __name__ == "__main__":
    start_migration()
