"""Prepare only the curated photos; source images remain untouched."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, sys

assert len(sys.argv) == 2, 'Usage: python scripts/prepare-campaign-snapshots.py <Campaign Snapshots directory>'
root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]).resolve()
selection = json.loads((root / 'scripts/campaign-selection.json').read_text(encoding='utf8'))
destination = root / 'public/campaigns'
assert not destination.exists(), 'Output already exists; preserve it or explicitly remove it before regeneration.'
for brand in selection['brands']:
    assert 1 <= len(brand['files']) <= 3
    for photo in brand['files']:
        path = source / brand['folder'] / photo['file']
        assert path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == photo['sha256'], f'Source changed: {path.name}'

catalogue = {'brands': []}
for brand in selection['brands']:
    directory = destination / brand['id']; directory.mkdir(parents=True)
    photos = []
    for index, photo in enumerate(brand['files'], 1):
        with Image.open(source / brand['folder'] / photo['file']) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            full = image.copy(); full.thumbnail((1440, 1440), Image.Resampling.LANCZOS)
            thumb = image.copy(); thumb.thumbnail((640, 640), Image.Resampling.LANCZOS)
            filename = f'{index:02}.webp'; thumbnail = f'{index:02}-thumb.webp'
            full.save(directory / filename, 'WEBP', quality=82, method=6)
            thumb.save(directory / thumbnail, 'WEBP', quality=76, method=6)
            assert (directory / filename).stat().st_size < 350_000
            assert (directory / thumbnail).stat().st_size < 100_000
            photos.append({'id': f'{brand["id"]}-{index:02}', 'src': f'/campaigns/{brand["id"]}/{filename}', 'thumbnail': f'/campaigns/{brand["id"]}/{thumbnail}', 'width': full.width, 'height': full.height, 'alt': photo['alt']})
    catalogue['brands'].append({'id': brand['id'], 'name': brand['name'], 'label': brand['label'], 'photos': photos})
(root / 'src/content/campaigns.json').write_text(json.dumps(catalogue, indent=2)+'\n', encoding='utf8')
files=list(destination.rglob('*.webp'))
print(f'Prepared {len(files)//2} photos, {sum(p.stat().st_size for p in files):,} total bytes including previews')
