import pymongo
from datetime import datetime

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
db = client['kp_arab_marble']

# 1. Product mapping: slug -> { "primary": url, "gallery": [urls] }
PRODUCT_IMAGE_MAP = {
    'omani-beige': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Crema-Beige.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Crema-Beige.jpg',
            'https://arabmarble.ae/wp-content/uploads/2022/08/Diamond-Beige.jpg',
            'https://arabmarble.ae/wp-content/uploads/2022/08/Aegean-Beige-001-Clearance.jpeg'
        ]
    },
    'crema-marfil': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Crema-Marfil.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Crema-Marfil.jpg',
            'https://arabmarble.ae/wp-content/uploads/2022/08/Crema-Marfil-2nd-Choice-001-Clearance_FINAL-768x768-1.jpeg',
            'https://arabmarble.ae/wp-content/uploads/2022/09/Crema-Marfil-Vanity-002-1280x640-1.jpeg'
        ]
    },
    'dark-emperador': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Dark-Emperador.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Dark-Emperador.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Dark-Emperador.jpg'
        ]
    },
    'light-emperador': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Light-Emperador.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Light-Emperador.jpg',
            'https://arabmarble.ae/wp-content/uploads/2022/08/Light-Emperador-001-Clearance_FINAL.jpeg'
        ]
    },
    'carrara-white': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Bianco-Carrara.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Bianco-Carrara.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/White-Orchid.jpg'
        ]
    },
    'statuario': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Statuario.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Statuario.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Nano-Statuario-Venato.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Nano-Statuario.jpg'
        ]
    },
    'calacatta-oro': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Calacatta-Oro-60x30-1-768x768-1.jpeg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Calacatta-Oro-60x30-1-768x768-1.jpeg',
            'https://arabmarble.ae/wp-content/uploads/2022/08/Calacatta-Oro-60x60-1-768x768-1.jpeg'
        ]
    },
    'nero-marquina': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Black-Marquina.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Black-Marquina.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Black-Marquina.jpg'
        ]
    },
    'botticino-classico': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Botticino.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Botticino.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Botticino.jpg'
        ]
    },
    'travertine-classic': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Travertino-Romano.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Travertino-Romano.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Travertino-Beige.jpg'
        ]
    },
    'cats-eye': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Cats-Eye-001-Clearance_FINAL.jpeg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Cats-Eye-001-Clearance_FINAL.jpeg'
        ]
    },
    'aegean-cream': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Aegean-Cream-Honed.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Aegean-Cream-Honed.jpg',
            'https://arabmarble.ae/wp-content/uploads/2022/08/Desert-Cream-Egypt.jpg'
        ]
    },
    'black-opal-quartz': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Black-Opal-e1620127429235.jpeg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Black-Opal-e1620127429235.jpeg'
        ]
    },
    'verde-guatemala': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Verde-Montjovet.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Verde-Montjovet.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Indian-Green.jpg'
        ]
    },
    'volakas-white': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Volakas.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Volakas.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Vietnam-White.jpg'
        ]
    },
    'thassos-snow-white': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Thassos.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Thassos.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/White-Faraya.jpg'
        ]
    },
    'pietra-grey': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Armani-Grey.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Armani-Grey.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Savoy-Grey.jpg',
            'https://arabmarble.ae/wp-content/uploads/2022/07/Armani-Grey-Vanity-1.jpg'
        ]
    },
    'silver-wave': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Silver-Spirit.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Silver-Spirit.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Blue-Pearl-Silver.jpg'
        ]
    },
    'rosa-portogallo': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Rosa-Porino-Spain.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Rosa-Porino-Spain.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Rosa-Porino-G456.jpg'
        ]
    },
    'rosso-levanto': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Rosso-Levanto.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Rosso-Levanto.jpg'
        ]
    },
    'black-marquina-gold': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Pakistani-Portoro.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Pakistani-Portoro.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Portoro.jpg'
        ]
    },
    'travertino-navona': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Travertino-Oro.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Travertino-Oro.jpg',
            'https://arabmarble.ae/wp-content/uploads/2022/08/Travertino-Skirting-768x768-1.jpeg'
        ]
    },
    'silver-travertine': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Travertino-Noche.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Travertino-Noche.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Silver-Spirit.jpg'
        ]
    },
    'black-absolute': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Nero-Absoluto.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Nero-Absoluto.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Black-Galaxy.jpg'
        ]
    },
    'tan-brown': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/08/Coffee-Brown.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/08/Coffee-Brown.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Desert-Brown.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Baltic-Brown.jpg'
        ]
    },
    'kashmir-white': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Moon-White.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Moon-White.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Colonial-White.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Alaska-white.jpg'
        ]
    },
    'pure-white-quartz': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Nano-Crystal-White.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Nano-Crystal-White.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/03/Artificial-Stone-1024x1024-1.jpeg'
        ]
    },
    'calacatta-gold-quartz': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2022/09/Nano-Calacatta-001-1024x1024-750x450-1.jpeg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2022/09/Nano-Calacatta-001-1024x1024-750x450-1.jpeg',
            'https://arabmarble.ae/wp-content/uploads/2022/09/Nano-Calacatta-002-1280x640-1.jpeg'
        ]
    },
    'rosa-portugal': {
        'primary': 'https://arabmarble.ae/wp-content/uploads/2023/01/Rosa-Porino-Spain.jpg',
        'gallery': [
            'https://arabmarble.ae/wp-content/uploads/2023/01/Rosa-Porino-Spain.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/01/Rosy-Pink.jpg'
        ]
    }
}

def update_products():
    print("--- 1. Updating Commerce Products ---")
    products = list(db['commerce_products'].find({}))
    updated_count = 0

    for p in products:
        slug = p.get('slug')
        mapping = PRODUCT_IMAGE_MAP.get(slug)
        if not mapping:
            print(f"Warning: No mapping for slug {slug}")
            continue

        primary_url = mapping['primary']
        gallery_urls = mapping['gallery']
        
        gallery_items = []
        for i, url in enumerate(gallery_urls):
            gallery_items.append({
                'id': f"{slug}-img-{i+1}",
                'url': url,
                'alt': p.get('name', slug),
                'order': i
            })

        update_fields = {
            'image': primary_url,
            'imageUrl': primary_url,
            'thumbnail': primary_url,
            'images': gallery_urls,
            'gallery': gallery_items,
            'primaryImageId': f"{slug}-img-1",
            'updatedAt': datetime.utcnow()
        }

        db['commerce_products'].update_one(
            {'_id': p['_id']},
            {'$set': update_fields}
        )
        updated_count += 1
        print(f"Updated product {p.get('name')} ({slug}) -> {primary_url}")

    print(f"Successfully updated {updated_count} products.")

def update_projects():
    print("\n--- 2. Updating CMS Projects ---")
    project_map = {
        'Boulevard Heights': [
            'https://arabmarble.ae/wp-content/uploads/2025/06/Boulevard-Heights-01.jpg',
            'https://arabmarble.ae/wp-content/uploads/2025/06/Boulevard-Heights-02.jpg',
            'https://arabmarble.ae/wp-content/uploads/2025/06/Boulevard-Heights-03.jpg',
            'https://arabmarble.ae/wp-content/uploads/2025/06/Boulevard-Heights-04.jpg',
        ],
        'Burj Vista': [
            'https://arabmarble.ae/wp-content/uploads/2026/03/Burj-Vista-01.jpg',
            'https://arabmarble.ae/wp-content/uploads/2026/03/Burj-Vista-02.jpg',
        ],
        'Clemenceau Medical Center': [
            'https://arabmarble.ae/wp-content/uploads/2026/03/CMC-01.jpg',
            'https://arabmarble.ae/wp-content/uploads/2026/03/CMC-02.jpg',
            'https://arabmarble.ae/wp-content/uploads/2026/03/CMC-03.jpg',
        ],
        'The Address - Fountain Views': [
            'https://arabmarble.ae/wp-content/uploads/2023/03/Park-Hyatt-001.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/03/Park-Hyatt-002.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/03/Park-Hyatt-003.jpg',
        ],
        'Emirates Palace Luxury Suites': [
            'https://arabmarble.ae/wp-content/uploads/2023/03/Qasr-Al-Sarab-001.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/03/Qasr-Al-Sarab-002.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/03/Qasr-Al-Sarab-003.jpg',
        ],
        'Royal Presidential Villa': [
            'https://arabmarble.ae/wp-content/uploads/2023/03/Shangri-La-001.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/03/Shangri-La-002.jpg',
            'https://arabmarble.ae/wp-content/uploads/2023/03/Shangri-La-004.jpg',
        ],
        'Saadiyat Island Private Villa': [
            'https://arabmarble.ae/wp-content/uploads/2022/07/Slabs-1.jpg',
            'https://arabmarble.ae/wp-content/uploads/2022/07/Slabs-2.jpg',
            'https://arabmarble.ae/wp-content/uploads/2022/07/Slabs-3.jpg',
        ],
    }

    for title, imgs in project_map.items():
        res = db['cms_projects'].update_many(
            {'title': title},
            {
                '$set': {
                    'image': imgs[0],
                    'gallery': imgs,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        print(f"Updated project '{title}': matched {res.matched_count}")

def update_categories():
    print("\n--- 3. Updating Categories ---")
    cat_images = {
        'marble': 'https://arabmarble.ae/wp-content/uploads/2023/03/Marble-1024x1024-1.jpeg',
        'marble-supply-distribution': 'https://arabmarble.ae/wp-content/uploads/2023/03/Marble-1024x1024-1.jpeg',
        'granite': 'https://arabmarble.ae/wp-content/uploads/2023/03/Granite-1024x1024-1.jpeg',
        'natural-stones': 'https://arabmarble.ae/wp-content/uploads/2023/03/Natural-Stone-1024x1024-1.jpeg',
        'artificial-stones': 'https://arabmarble.ae/wp-content/uploads/2023/03/Artificial-Stone-1024x1024-1.jpeg',
    }

    for slug, img in cat_images.items():
        res = db['commerce_categories'].update_many(
            {'slug': slug},
            {
                '$set': {
                    'image': img,
                    'imageUrl': img,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        print(f"Updated category '{slug}': matched {res.matched_count}")

def update_site_pages():
    print("\n--- 4. Updating site_pages & cms_page_revisions ---")
    
    # 1. HOME
    home = db['site_pages'].find_one({'slug': 'home'})
    if home:
        blocks = home.get('blocks') or home.get('content') or []
        for b in blocks:
            b_type = b.get('type')
            props = b.get('props', {})
            if b_type == 'hero':
                props['backgroundImage'] = 'https://arabmarble.ae/wp-content/uploads/2022/07/Slabs-1.jpg'
            elif b_type == 'about-story':
                props['image'] = 'https://arabmarble.ae/wp-content/uploads/2022/07/Aerial-View-0002.jpg'
            elif b_type == 'home-tiles':
                props['leftImage'] = 'https://arabmarble.ae/wp-content/uploads/2023/03/Marble-1024x1024-1.jpeg'
                props['rightImage'] = 'https://arabmarble.ae/wp-content/uploads/2023/03/Shangri-La-001.jpg'
        
        db['site_pages'].update_one(
            {'_id': home['_id']},
            {
                '$set': {
                    'blocks': blocks,
                    'content': blocks,
                    'payload.blocks': blocks,
                    'payload.content': blocks,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        rev_id = home.get('publishedRevisionId')
        if rev_id:
            db['cms_page_revisions'].update_one(
                {'revisionId': rev_id},
                {'$set': {'snapshot.blocks': blocks, 'snapshot.content': blocks}}
            )
        print("Updated page 'home' with authentic real marble images.")

    # 2. CONTACT
    contact = db['site_pages'].find_one({'slug': 'contact'})
    if contact:
        blocks = contact.get('blocks') or contact.get('content') or []
        for b in blocks:
            b_type = b.get('type')
            props = b.get('props', {})
            if b_type == 'hero':
                props['backgroundImage'] = 'https://arabmarble.ae/wp-content/uploads/2023/06/title-bg.png'
            elif b_type == 'contact-form':
                props['mapImage'] = 'https://arabmarble.ae/wp-content/uploads/2022/07/Aerial-View-0002.jpg'

        db['site_pages'].update_one(
            {'_id': contact['_id']},
            {
                '$set': {
                    'blocks': blocks,
                    'content': blocks,
                    'payload.blocks': blocks,
                    'payload.content': blocks,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        rev_id = contact.get('publishedRevisionId')
        if rev_id:
            db['cms_page_revisions'].update_one(
                {'revisionId': rev_id},
                {'$set': {'snapshot.blocks': blocks, 'snapshot.content': blocks}}
            )
        print("Updated page 'contact'.")

    # 3. PROMOTIONS
    promotions = db['site_pages'].find_one({'slug': 'promotions'})
    if promotions:
        blocks = promotions.get('blocks') or promotions.get('content') or []
        for b in blocks:
            b_type = b.get('type')
            props = b.get('props', {})
            if b_type == 'hero':
                props['backgroundImage'] = 'https://arabmarble.ae/wp-content/uploads/2023/06/title-bg.png'
            elif b_type == 'promotions':
                items = props.get('items', [])
                for itm in items:
                    itm['image'] = 'https://arabmarble.ae/wp-content/uploads/2022/08/Light-Emperador-001-Clearance_FINAL.jpeg'

        db['site_pages'].update_one(
            {'_id': promotions['_id']},
            {
                '$set': {
                    'blocks': blocks,
                    'content': blocks,
                    'payload.blocks': blocks,
                    'payload.content': blocks,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        rev_id = promotions.get('publishedRevisionId')
        if rev_id:
            db['cms_page_revisions'].update_one(
                {'revisionId': rev_id},
                {'$set': {'snapshot.blocks': blocks, 'snapshot.content': blocks}}
            )
        print("Updated page 'promotions'.")

    # 4. CATEGORY
    cat_page = db['site_pages'].find_one({'slug': 'category'})
    if cat_page:
        blocks = cat_page.get('blocks') or cat_page.get('content') or []
        for b in blocks:
            b_type = b.get('type')
            props = b.get('props', {})
            if b_type == 'hero':
                props['backgroundImage'] = 'https://arabmarble.ae/wp-content/uploads/2023/06/title-bg.png'

        db['site_pages'].update_one(
            {'_id': cat_page['_id']},
            {
                '$set': {
                    'blocks': blocks,
                    'content': blocks,
                    'payload.blocks': blocks,
                    'payload.content': blocks,
                    'updatedAt': datetime.utcnow()
                }
            }
        )
        rev_id = cat_page.get('publishedRevisionId')
        if rev_id:
            db['cms_page_revisions'].update_one(
                {'revisionId': rev_id},
                {'$set': {'snapshot.blocks': blocks, 'snapshot.content': blocks}}
            )
        print("Updated page 'category'.")

if __name__ == '__main__':
    update_products()
    update_projects()
    update_categories()
    update_site_pages()
    print("\nALL UPDATES COMPLETED SUCCESSFULLY!")
