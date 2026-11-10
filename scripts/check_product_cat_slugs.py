import pymongo

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
db = client['kp_arab_marble']

cat_by_id = {}
for c in db['commerce_categories'].find():
    cat_by_id[str(c['_id'])] = c.get('slug')

print("Categories mapping:", cat_by_id)

for p in db['commerce_products'].find():
    cids = p.get('categoryIds') or []
    primary = p.get('primaryCategoryId')
    all_cids = list(cids) + ([primary] if primary else [])
    
    slugs = set()
    for cid in all_cids:
        if str(cid) in cat_by_id:
            slugs.add(cat_by_id[str(cid)])
            
    # Also infer from product name or tags
    name_lower = p.get('name', '').lower()
    tags = [t.lower() for t in p.get('tags') or []]
    if 'granite' in name_lower or 'granite' in tags:
        slugs.add('granite')
    if 'marble' in name_lower or 'marble' in tags:
        slugs.add('marble')
    if 'quartz' in name_lower or 'quartz' in tags or 'artificial' in tags:
        slugs.add('artificial-stones')
    if 'stone' in name_lower or 'stone' in tags or 'travertine' in name_lower:
        slugs.add('natural-stones')

    print(f"Product '{p.get('name')}' -> slugs: {list(slugs)}")

