import pymongo
from datetime import datetime

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
db = client['kp_arab_marble']

# 1. Update permalinkDetails in business_blueprints_v2 and business_blueprints
permalink_details = {
    "categoryBase": "category",
    "permalinkStructure": "/product",
    "productAttributeBase": "attribute",
    "productBrandBase": "brands",
    "productCategoryBase": "product-category",
    "productTagBase": "product-tag",
    "shopBase": "shop",
    "tagBase": "tag"
}

db['business_blueprints_v2'].update_many(
    {},
    {
        "$set": {
            "permalinkDetails": permalink_details,
            "seo.permalinks": permalink_details,
            "updatedAt": datetime.utcnow()
        }
    }
)
print("Updated permalinkDetails in business_blueprints_v2.")

db['business_blueprints'].update_many(
    {},
    {
        "$set": {
            "permalinkDetails": permalink_details,
            "seo.permalinks": permalink_details,
            "payload.permalinkDetails": permalink_details,
            "payload.seo.permalinks": permalink_details,
            "updatedAt": datetime.utcnow()
        }
    }
)
print("Updated permalinkDetails in business_blueprints.")

# 2. Update categorySlugs and ensure categoryIds on commerce_products
cat_by_id = {}
for c in db['commerce_categories'].find():
    cat_by_id[str(c['_id'])] = c.get('slug')

print("Category ID mapping:", cat_by_id)

updated_products = 0
for p in db['commerce_products'].find():
    cids = p.get('categoryIds') or []
    primary = p.get('primaryCategoryId')
    all_cids = list(cids) + ([primary] if primary else [])
    
    slugs = set()
    for cid in all_cids:
        if str(cid) in cat_by_id:
            slugs.add(cat_by_id[str(cid)])
            
    name_lower = p.get('name', '').lower()
    tags = [t.lower() for t in p.get('tags') or []]
    
    if any(k in name_lower or k in tags for k in ['granite']):
        slugs.add('granite')
    elif any(k in name_lower or k in tags for k in ['quartz', 'artificial']):
        slugs.add('artificial-stones')
    elif any(k in name_lower or k in tags for k in ['travertine']):
        slugs.add('natural-stones')
        slugs.add('marble')
    else:
        slugs.add('marble')

    slug_list = sorted(list(slugs))
    
    db['commerce_products'].update_one(
        {'_id': p['_id']},
        {
            "$set": {
                "categorySlugs": slug_list,
                "category": slug_list[0] if slug_list else 'marble',
                "status": "active",
                "updatedAt": datetime.utcnow()
            }
        }
    )
    updated_products += 1

print(f"Updated {updated_products} products with categorySlugs.")

