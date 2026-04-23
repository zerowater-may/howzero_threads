# zipsaja-content

Sister skill of `zipsaja-design`. Generates 1080×1440 instagram carousel slides from proptech_db data.

## Setup

```bash
cd .claude/skills/zipsaja-content
pip install -r requirements.txt
npm install
```

Set `PROPTECH_PG_PASSWORD` env var (or use default `proptech2026`).

## Usage

```bash
python -m lib.cli init seoul-10y       # creates output/YYYY-MM-DD-seoul-10y/spec.yaml
# edit spec.yaml — set slides
python -m lib.cli build seoul-10y      # fetch → render → export PNG
```

## Tests

```bash
pytest -v
```

Live tests require SSH to `root@151.245.106.86`.

## Contributing

When adding components:
1. Create `components/<name>.j2` extending `_base.html.j2`
2. Add render context handler in `lib/render.py`
3. Add test in `tests/test_render.py`
4. Update SKILL.md component catalog
