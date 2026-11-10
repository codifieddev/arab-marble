import xml.etree.ElementTree as ET
import re
from urllib.parse import urlparse
import os
from datetime import datetime
from bson import ObjectId
import pymongo

def parse_and_import():
    xml_path = r"C:\Users\manis\Downloads\Images.xml"
    if not os.path.exists(xml_path):
        print(f"Error: {xml_path} does not exist.")
        return

    tree = ET.parse(xml_path)
    root = tree.getroot()
    ns = {
        'wp': 'http://wordpress.org/export/1.2/',
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'dc': 'http://purl.org/dc/elements/1.1/'
    }

    client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
    db = client['kp_arab_marble']
    media_col = db['media']

    items = root.findall('.//item')
    print(f"Found {len(items)} items in XML.")

    media_docs = []
    seen_urls = set()

    for item in items:
        pt = item.find('wp:post_type', ns)
        if pt is None or pt.text != 'attachment':
            continue

        att_url = item.find('wp:attachment_url', ns)
        url = att_url.text.strip() if att_url is not None and att_url.text else ''
        if not url:
            guid = item.find('guid')
            url = guid.text.strip() if guid is not None and guid.text else ''

        if not url:
            continue

        if url in seen_urls:
            continue
        seen_urls.add(url)

        title_el = item.find('title')
        title = title_el.text.strip() if title_el is not None and title_el.text else ''

        date_el = item.find('wp:post_date', ns)
        date_str = date_el.text.strip() if date_el is not None and date_el.text else ''
        try:
            created_dt = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
        except Exception:
            created_dt = datetime.utcnow()

        meta_dict = {}
        for pm in item.findall('wp:postmeta', ns):
            k = pm.find('wp:meta_key', ns)
            v = pm.find('wp:meta_value', ns)
            if k is not None and k.text:
                meta_dict[k.text] = v.text if v is not None and v.text else ''

        meta_raw = meta_dict.get('_wp_attachment_metadata', '')
        width_match = re.search(r's:5:"width";i:(\d+);', meta_raw)
        height_match = re.search(r's:6:"height";i:(\d+);', meta_raw)
        filesize_match = re.search(r's:8:"filesize";i:(\d+);', meta_raw)

        width = int(width_match.group(1)) if width_match else None
        height = int(height_match.group(1)) if height_match else None
        dimensions = f"{width}x{height}" if width and height else ""

        if filesize_match:
            size = int(filesize_match.group(1))
        elif 'wpmf_size' in meta_dict and meta_dict['wpmf_size'].isdigit():
            size = int(meta_dict['wpmf_size'])
        else:
            size = 50000

        alt = meta_dict.get('_wp_attachment_image_alt', '').strip()
        if not alt:
            alt = title if title else os.path.splitext(os.path.basename(urlparse(url).path))[0]

        parsed_path = urlparse(url).path
        filename = os.path.basename(parsed_path)
        base_name, ext = os.path.splitext(filename)
        file_type = ext.lstrip('.').lower() if ext else 'jpg'

        # kp_peekeeper schema compatibility:
        # '_id', 'url', 'alt', 'foldername', 'filename', 'size', 'type', 'isWatermark', 'createdAt', 'updatedAt'
        doc = {
            '_id': ObjectId(),
            'url': url,
            'alt': alt,
            'filename': filename,
            'foldername': '',
            'size': size,
            'type': file_type,
            'dimensions': dimensions,
            'isWatermark': False,
            'createdAt': created_dt,
            'updatedAt': created_dt
        }
        media_docs.append(doc)

    print(f"Prepared {len(media_docs)} media documents.")
    if media_docs:
        result = media_col.insert_many(media_docs)
        print(f"Successfully inserted {len(result.inserted_ids)} media documents into kp_arab_marble.media.")

if __name__ == "__main__":
    parse_and_import()

