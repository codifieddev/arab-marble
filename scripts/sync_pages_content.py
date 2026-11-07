import pymongo

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
db = client['kp_arab_marble']

pages = list(db['site_pages'].find())
print(f"Total site_pages: {len(pages)}")

for doc in pages:
    slug = doc.get('slug')
    blocks = doc.get('blocks')
    if blocks:
        db['site_pages'].update_one(
            {'_id': doc['_id']},
            {
                '$set': {
                    'content': blocks,
                    'payload.content': blocks,
                    'payload.blocks': blocks,
                }
            }
        )
        print(f"Synced page: {slug} ({len(blocks)} blocks)")

        # Sync published revision if exists
        rev_id = doc.get('publishedRevisionId')
        if rev_id:
            res = db['cms_page_revisions'].update_one(
                {'revisionId': rev_id},
                {
                    '$set': {
                        'snapshot.blocks': blocks,
                    }
                }
            )
            print(f"  Synced revision {rev_id}: matched={res.matched_count}, modified={res.modified_count}")

print("All site_pages content successfully synchronized with blocks!")

