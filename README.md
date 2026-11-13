# ChaosVibe studio website

Static site: `index.html`, `style.css`, `img/`. No build step.

## Publish on GitHub Pages

1. Create an empty repo on GitHub (e.g. `chaosvibe-site`) and push this one to it:
   `git remote add origin https://github.com/<you>/chaosvibe-site.git && git push -u origin main`
2. Repo → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Custom domain: add a file `CNAME` containing the domain (e.g. `chaosvibe.com`), then point the
   domain's DNS at GitHub Pages (A records to 185.199.108–111.153, or a CNAME for `www` to `<you>.github.io`).
   Tick "Enforce HTTPS" once the certificate is issued.

Images come from the Emberwrought repo (`website/img/hero.jpg`, `website/press/`).
