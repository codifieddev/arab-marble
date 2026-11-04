import os

files_to_clean = [
    r'd:\projects\kalp\arab-marble\src\app\[locale]\studio\page.tsx',
    r'd:\projects\kalp\arab-marble\src\lib\store\currency\currencySlice.ts',
]

for p in files_to_clean:
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as f:
            c = f.read()
        c = c.replace('kp_peekeeper', 'kp_arab_marble')
        c = c.replace("'peekeeper'", "'arab-marble'")
        c = c.replace('"peekeeper"', '"arab-marble"')
        c = c.replace('peekeeper_selected_currency', 'arab_marble_selected_currency')
        c = c.replace('PeeKeeper', 'Arab Marble')
        with open(p, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'Cleaned {p}')

