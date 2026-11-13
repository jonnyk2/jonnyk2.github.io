# ChaosVibe studio website

Static site: `index.html`, `style.css`, `img/`, `CNAME`. No build step. Live at https://chaosvibe.com.

## Publish on GitHub Pages

The repo is the account's **user site**, `jonnyk2.github.io`. Because the user site carries the custom
domain, every project site on the account moves under it too, so the Emberwrought website (Pages from the
Emberwrought repo) is served at `https://chaosvibe.com/Emberwrought/`, which the studio site links to.

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

Images come from the Emberwrought repo (`website/img/hero.jpg`, `website/press/`).
