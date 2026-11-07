import pymongo
from datetime import datetime

client = pymongo.MongoClient('mongodb://deepak:deepak123@2.25.90.170:27017/kalpzero_enter?authSource=admin')
db = client['kp_arab_marble']

footer_data = {
    "brand": {
        "name": {
            "en": "Arab Marble",
            "ar": "الرخام العربي"
        },
        "description": {
            "en": "Arab Marble was established in Abu Dhabi in 1973. Exclusive distributor of Omani Beige marble, Italian marble, and natural stone solutions across the UAE.",
            "ar": "تأسست شركة الرخام العربي في أبوظبي عام 1973. الموزع الحصري لرخام بيج عماني والرخام الإيطالي وحلول الأحجار الطبيعية في جميع أنحاء الإمارات."
        }
    },
    "columns": [
        {
            "title": {"en": "PRODUCTS", "ar": "المنتجات"},
            "links": [
                {"label": {"en": "Marble", "ar": "رخام"}, "path": "/category/marble"},
                {"label": {"en": "Granite", "ar": "جرانيت"}, "path": "/category/granite"},
                {"label": {"en": "Natural Stones", "ar": "أحجار طبيعية"}, "path": "/category/natural-stones"},
                {"label": {"en": "Artificial Stones", "ar": "أحجار صناعية"}, "path": "/category/artificial-stones"}
            ]
        },
        {
            "title": {"en": "PROJECTS", "ar": "المشاريع"},
            "links": [
                {"label": {"en": "Latest Projects", "ar": "أحدث المشاريع"}, "path": "/projects/latest"},
                {"label": {"en": "Iconic Projects", "ar": "مشاريع مميزة"}, "path": "/projects/iconic"},
                {"label": {"en": "Commercial Projects", "ar": "مشاريع تجارية"}, "path": "/projects/commercial"},
                {"label": {"en": "Custom Projects", "ar": "مشاريع مخصصة"}, "path": "/projects/custom"}
            ]
        },
        {
            "title": {"en": "COMPANY", "ar": "الشركة"},
            "links": [
                {"label": {"en": "About Us", "ar": "من نحن"}, "path": "/about"},
                {"label": {"en": "Promotions", "ar": "العروض والخصومات"}, "path": "/promotions"},
                {"label": {"en": "Contact Us", "ar": "اتصل بنا"}, "path": "/contact"}
            ]
        }
    ],
    "contact": {
        "title": {"en": "CONTACT US", "ar": "اتصل بنا"},
        "phone": "+971 2 555 4008",
        "fax": "+971 2 555 4005",
        "email": "am@arabmarble.ae",
        "phoneLabel": {"en": "Phone", "ar": "الهاتف"},
        "faxLabel": {"en": "Fax", "ar": "الفاكس"},
        "emailLabel": {"en": "Email", "ar": "البريد الإلكتروني"}
    },
    "copyright": {
        "en": "Copyright © {year} | ARAB MARBLE | All Rights Reserved",
        "ar": "حقوق النشر © {year} | الرخام العربي | جميع الحقوق محفوظة"
    },
    "bottomBar": {
        "credits": {
            "en": "Designed & Managed by CODIFIED",
            "ar": "تصميم وإدارة CODIFIED"
        }
    },
    "socialLinks": [
        {"platform": "instagram", "url": "https://instagram.com/arabmarble"},
        {"platform": "facebook", "url": "https://facebook.com/arabmarble"},
        {"platform": "linkedin", "url": "https://linkedin.com/company/arabmarble"}
    ],
    "updatedAt": datetime.utcnow()
}

db['cms_footer'].update_many({}, {"$set": footer_data})
print("Updated cms_footer with full multilingual data")

