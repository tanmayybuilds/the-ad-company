"""Prepare the nine supplied service photos without changing their originals."""
from pathlib import Path
from PIL import Image, ImageOps
import json, sys

assert len(sys.argv) == 2, 'Usage: python scripts/prepare-service-executions.py <Services directory>'
root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]).resolve()
destination = root / 'public/service-executions'
catalogue = root / 'src/content/service-executions.json'
selection = [
    ('hoardings', 'Hoarding.jpg', {'alt': 'The Diamond Factory outdoor hoarding displayed beside a neighbourhood road.', 'client': 'The Diamond Factory', 'description': 'Outdoor hoarding placement.'}),
    ('lift-posters', 'Lift Poster.jpg', {'alt': 'Jewellery advertisement displayed beside the lifts in a residential lobby.', 'description': 'Lift-lobby advertising placement.'}),
    ('pole-kiosks', 'Pole Kiosk.jpg', {'alt': 'Nova IVF Fertility pole kiosk advertisements displayed along a road.', 'client': 'Nova IVF Fertility', 'description': 'Roadside pole kiosk advertising.'}),
    ('community', 'Society BTL Activity.jpg', {'alt': 'Truemeds team at a branded health-checkup activity in a residential society.', 'client': 'Truemeds', 'location': 'Pune, Maharashtra', 'description': 'Society BTL health-checkup activity.'}),
    ('tagging', 'Tagging Activity.jpg', {'alt': 'Promotional tag attached to the windscreen of a parked vehicle.', 'location': 'Kalyan, Maharashtra', 'description': 'Promotional vehicle tagging activity.'}),
    ('van', 'Van Branding 2.jpg', {'alt': 'The Diamond Factory campaign displayed across the side of a branded van.', 'client': 'The Diamond Factory', 'description': 'Mobile van branding campaign.'}),
    ('auto', 'Auto Branding.jpg', {'alt': 'Nova IVF Fertility campaign covering the rear panel of an auto rickshaw.', 'client': 'Nova IVF Fertility', 'description': 'Auto rickshaw branding.'}),
    ('cab', 'Cab Branding.jpg', {'alt': 'Nova IVF Fertility advertising displayed across the side panels of a cab.', 'client': 'Nova IVF Fertility', 'description': 'Cab branding campaign.'}),
    ('outdoor-digital', 'Digital Hoarding.jpg', {'alt': 'The Diamond Factory advertisement on an outdoor digital hoarding beside a busy road.', 'client': 'The Diamond Factory', 'description': 'Digital hoarding placement.'}),
]
assert len(selection) == len({item[0] for item in selection}) == 9
assert not destination.exists() and not catalogue.exists(), 'Outputs already exist; preserve existing assets before regeneration.'
assert all((source / filename).is_file() for _, filename, _ in selection), 'A selected source photo is missing.'
destination.mkdir(parents=True)
executions = {}
for service_id, filename, details in selection:
    with Image.open(source / filename) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        full = image.copy(); full.thumbnail((1440, 1440), Image.Resampling.LANCZOS)
        preview = image.copy(); preview.thumbnail((640, 640), Image.Resampling.LANCZOS)
        full_path = destination / f'{service_id}.webp'
        preview_path = destination / f'{service_id}-thumb.webp'
        full.save(full_path, 'WEBP', quality=82, method=6)
        if full_path.stat().st_size >= 350_000:
            full.save(full_path, 'WEBP', quality=76, method=6)
        preview.save(preview_path, 'WEBP', quality=76, method=6)
        for path, expected_size, budget in [(full_path, full.size, 350_000), (preview_path, preview.size, 100_000)]:
            with Image.open(path) as encoded:
                encoded.load()
                assert encoded.format == 'WEBP' and encoded.size == expected_size
            assert path.stat().st_size < budget, f'Transfer budget exceeded: {path.name}'
        executions[service_id] = {'src': f'/service-executions/{full_path.name}', 'thumbnail': f'/service-executions/{preview_path.name}', 'thumbnailWidth': preview.width, 'width': full.width, 'height': full.height, **details}
catalogue.write_text(json.dumps(executions, indent=2) + '\n', encoding='utf8')
print(f'Prepared {len(executions)} execution photos, {sum(path.stat().st_size for path in destination.iterdir()):,} bytes including previews.')
