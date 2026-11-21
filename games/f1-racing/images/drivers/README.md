# Driver Portraits

Placeholder portrait/headshot images for the six F1 drivers used by the
invincibility-mode gallery. Real driver photos are NOT bundled here for
licensing reasons — these are simple team-colored cards with the driver's
race number and surname so the display logic has something to show.

## Files

All PNGs are 256x256 RGB, ~5 KB each, in this folder:

  verstappen.png  (1,  Red Bull)
  russell.png     (63, Mercedes)
  hamilton.png    (44, Mercedes)
  piastri.png     (81, McLaren)
  antonelli.png   (12, Mercedes)
  norris.png      (4,  McLaren)

`manifest.json` lists every driver with `slug`, `firstName`, `lastName`,
`number`, `team`, and `file`. Cycle order matches the task spec
(Verstappen → Russell → Hamilton → Piastri → Antonelli → Norris).

## How to load from JS

This folder lives in Vite's `public/` directory, so files are served at the
root URL with no bundler magic:

  /images/drivers/verstappen.png
  /images/drivers/manifest.json

From JS:

  const manifest = await fetch('/images/drivers/manifest.json').then(r => r.json());
  const img = new Image();
  img.src = '/images/drivers/' + manifest.drivers[0].file;
  // img is a normal HTMLImageElement — usable in ctx.drawImage().

## Replacing with real photos later

Drop a 256x256 (or larger, square-cropped) PNG into this folder using the
same filename and it will be picked up automatically by anything that reads
`manifest.json`. No code changes required.
