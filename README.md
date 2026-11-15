# ChaosVibe studio website

Static site: `index.html`, `style.css`, `img/`, `CNAME`, `emberwrought/` (redirects only). No build step. Live at https://chaosvibe.com.

Look: minimalist 16-bit. Fonts Silkscreen (display) and Pixelify Sans (body); navy `#0d0b1e`, cream, pink `#ff3d7f`.
The pixel art is generated small and scaled up crisp (`image-rendering: pixelated`): `python tools/make_pixels.py`
redraws `img/px-scene.png` (the hero scene), `img/og.png` (link preview). The 16-bit look is the studio's
brand only: the game's screenshots (`img/shot-*.jpg`) are always shown as captured, never pixelated.

## The game's website

Heroes' Reach has its own site, in its own small public repo (`jonnyk2/heroesreach`, served at https://heroesreach.com).
This studio site only links to it (`https://heroesreach.com/` and `/press.html`). `emberwrought/` holds two redirect
pages that send old links to https://heroesreach.com/. The game itself lives in a separate **private** repo; never make
it public. Its `website/` folder is the source for the public site (refresh steps are in that repo's README).

## Publish on GitHub Pages

The repo is the account's user site, `jonnyk2.github.io` (public, Pages from `main` / root).

1. Create an empty **public** repo named exactly `jonnyk2.github.io` (no README), then push this one:
   `git remote add origin https://github.com/jonnyk2/jonnyk2.github.io.git && git push -u origin main`
2. Repo → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
   Custom domain: `chaosvibe.com` (the `CNAME` file sets it too).
3. DNS at GoDaddy (Domain → DNS → Manage). This replaces the old Website Builder page:
   - Remove the existing `A` records for `@` (GoDaddy's builder/parking IPs) and any "forwarding".
   - Add four `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Set `www` to a `CNAME` pointing at `jonnyk2.github.io`.
   - Unpublish the Website Builder site so it stops claiming the domain.
4. When GitHub shows the DNS check passed (minutes to a few hours), tick "Enforce HTTPS".

## Contact email

The site shows `contact@chaosvibe.com`. Make that address exist before going live: GoDaddy email
forwarding (free with the domain) to your inbox, or a Microsoft 365 / Google Workspace mailbox. Adding
mail does not touch the `A`/`CNAME` records above; it only adds `MX` records.

The game's screenshots in `img/` come from the game repo.
