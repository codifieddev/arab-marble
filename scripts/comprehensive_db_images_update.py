import pymongo
import json
import re
from datetime import datetime

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
db = client['kp_arab_marble']

URL_REPLACEMENTS = {
    '/images/home-hero.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/07/Slabs-1.jpg',
    '/images/who-we-are.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/07/Aerial-View-0002.jpg',
    '/images/products-tile.jpg': 'https://arabmarble.ae/wp-content/uploads/2023/03/Marble-1024x1024-1.jpeg',
    '/images/projects-tile.jpg': 'https://arabmarble.ae/wp-content/uploads/2023/03/Shangri-La-001.jpg',
    '/images/page-banner.jpg': 'https://arabmarble.ae/wp-content/uploads/2023/06/title-bg.png',
    '/images/contact-map.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/07/Aerial-View-0002.jpg',
    '/images/arab-marble-logo.svg': 'https://arabmarble.ae/wp-content/uploads/2023/02/Arab-Marble-logo.svg',
    '/images/products/promo-light-emperador.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/08/Light-Emperador-001-Clearance_FINAL.jpeg',
    '/images/products/light-emperador.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/08/Light-Emperador-001-Clearance_FINAL.jpeg',
    '/images/products/promo-aegean-cream.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/08/Aegean-Cream-Honed.jpg',
    '/images/products/promo-crema-marfil.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/08/Crema-Marfil.jpg',
    '/images/products/promo-black-opal.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/08/Black-Opal-e1620127429235.jpeg',
    '/images/products/promo-calacatta-oro.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/08/Calacatta-Oro-60x30-1-768x768-1.jpeg',
    '/images/products/promo-cats-eye.jpg': 'https://arabmarble.ae/wp-content/uploads/2022/08/Cats-Eye-001-Clearance_FINAL.jpeg',
    '/images/project-boulevard-heights.jpg': 'https://arabmarble.ae/wp-content/uploads/2025/06/Boulevard-Heights-01.jpg',
    '/images/project-burj-vista.jpg': 'https://arabmarble.ae/wp-content/uploads/2026/03/Burj-Vista-01.jpg',
    '/images/project-clemenceau.jpg': 'https://arabmarble.ae/wp-content/uploads/2026/03/CMC-01.jpg',
    '/images/project-fountain-views.jpg': 'https://arabmarble.ae/wp-content/uploads/2023/03/Park-Hyatt-001.jpg',
}

def replace_in_obj(obj):
    if isinstance(obj, dict):
        return {k: replace_in_obj(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [replace_in_obj(elem) for elem in obj]
    elif isinstance(obj, str):
        for old_url, new_url in URL_REPLACEMENTS.items():
            if old_url in obj:
                obj = obj.replace(old_url, new_url)
        return obj
    return obj

print("--- Comprehensive Replacement across ALL Collections ---")
for col_name in sorted(db.list_collection_names()):
    col = db[col_name]
    updated_in_col = 0
    for doc in col.find():
        doc_str = json.dumps(doc, default=str)
        if any(old_url in doc_str for old_url in URL_REPLACEMENTS):
            new_doc = replace_in_obj(doc)
            col.replace_one({'_id': doc['_id']}, new_doc)
            updated_in_col += 1
    if updated_in_col > 0:
        print(f"Collection '{col_name}': Updated {updated_in_col} documents.")
    else:
        print(f"Collection '{col_name}': Clean.")

print("\n--- Verifying remaining old image URLs ---")
remaining = 0
for col_name in db.list_collection_names():
    col = db[col_name]
    for doc in col.find():
        s = json.dumps(doc, default=str)
        matches = [m for m in re.findall(r'/images/[^\s"\'\)\>]+', s) if any(ext in m.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.svg'])]
        if matches:
            remaining += len(matches)
            print(f"Found remaining in {col_name} doc {doc.get('_id')}: {set(matches)}")

if remaining == 0:
    print("SUCCESS: 0 old /images/ or unsplash URLs remaining in ANY collection in kp_arab_marble!")
else:
    print(f"WARNING: {remaining} remaining old URLs.")

