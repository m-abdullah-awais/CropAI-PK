# Deploying CropAI PK to DigitalOcean - a complete beginner's guide

This guide assumes this is your first ever deployment. Every step explains
WHAT you are doing and WHY, so nothing feels like magic. Follow it top to
bottom; total time is about 30-45 minutes, most of it waiting for installs.

---

## Part 0 - Understand what you are about to do

### What you are deploying

Right now the app runs on your PC with `pnpm dev`. Deployment means running
the same app on a computer in a datacenter (a "server") that is switched on
24/7 and reachable from the internet, so anyone can open it in a browser.

The app ships as three Docker containers working together:

```
Internet --:80--> caddy --> frontend (Next.js, port 4319, internal)
                                |  /api/ml/* server-side proxy
                                v
                            backend (FastAPI + ML models, port 9271, internal)
```

- **caddy** - the "front door". It is the only container exposed to the
  internet. It receives every browser request on port 80 and forwards it to
  the frontend. Later it will also handle HTTPS certificates automatically.
- **frontend** - the Next.js website. It renders the pages and, when the
  browser asks for an ML prediction, it forwards that request to the backend
  over a private internal network.
- **backend** - FastAPI with the trained scikit-learn models. It is NEVER
  reachable from the internet directly. Only the frontend can talk to it.
  This is a security best practice: the smaller your public surface, the
  less there is to attack.

### What is Docker and why are we using it?

Docker packages an app together with everything it needs (Python, Node,
libraries, trained models) into an "image". A running image is called a
"container". The point: if the image works on your PC, the identical image
works on the server. No "it works on my machine" problems, no manually
installing Python and Node on the server.

`docker compose` is the tool that starts all three containers together and
wires up the private network between them, using the `docker-compose.yml`
file in the repo root.

One nice property of this setup: the ML models are trained DURING the image
build, from the real datasets committed in `data/`. If training fails, the
build fails - a broken model can never reach production.

### What you need before starting

1. A DigitalOcean account (https://www.digitalocean.com - needs a credit
   card, but you only pay for what you create).
2. Your code pushed to a Git host (GitHub). The server will download it
   from there.
3. About $12-14/month for the server. That is it.
4. (Optional, later) A domain name if you want https://yourdomain.com
   instead of an IP address.

---

## Part 1 - Create the Droplet (the server)

**Why:** A "Droplet" is DigitalOcean's name for a virtual server - a slice
of a real machine in one of their datacenters, rented by the hour.

In the DigitalOcean dashboard:

1. Click **Create -> Droplets**.
2. **Region:** pick the one closest to your users so pages load faster.
   For Pakistan, **Bangalore (BLR1)** is the nearest.
3. **Image:** choose **Ubuntu 24.04 (LTS) x64**.
   Why Ubuntu LTS: it is the most widely documented server OS, and LTS
   (Long Term Support) means security updates until 2029.
4. **Size:** choose **Basic -> Regular -> 2 GB RAM / 1 CPU** (about $12/mo).
   Why 2 GB minimum: building the Next.js frontend is memory-hungry. On a
   1 GB server the build gets killed halfway. More RAM (like your 8 GB) is
   simply more comfortable - builds run faster with room to spare.
5. **Authentication:** choose **SSH Key** and tick the key(s) already saved
   in your DigitalOcean account from your earlier projects. (If you ever set
   up a new PC, add its key here with **New SSH Key**.)
   Why not a password: password logins get hammered by bots within minutes
   of a server going online. Key-only login shuts that door completely.
6. Optionally enable **Backups** (weekly snapshots for 20% extra cost).
7. Click **Create Droplet**.

After about a minute the Droplet is ready and shows an **IP address** like
`164.90.x.x`. Copy it - that IP is your server's address on the internet.

---

## Part 2 - Connect to the server

**Why:** everything from here on happens ON the server, so first we log
into it.

In PowerShell on your PC (replace with your actual IP):

```powershell
ssh root@164.90.x.x
```

- `root` is the administrator account Ubuntu Droplets start with.
- The first time, SSH shows a fingerprint and asks
  `Are you sure you want to continue connecting?` - type `yes`. This is SSH
  memorizing the server's identity so it can warn you if it ever changes
  (which could mean tampering).

Your prompt changes to something like `root@ubuntu-...:~#`. You are now
typing commands on the server, not on your PC. Everything below runs there.

---

## Part 3 - Update the system and install Docker

### 3a. Update Ubuntu's package lists and installed software

**Why:** the Droplet image was built weeks ago; this pulls the latest
security patches before we install anything on top.

```bash
apt-get update && apt-get upgrade -y
```

- `apt-get update` refreshes the catalog of available software.
- `apt-get upgrade -y` installs pending updates (`-y` answers "yes" for you).
- If a pink screen asks about restarting services, just press Enter.

### 3b. Install Docker from Docker's official repository

**Why not just `apt install docker.io`:** Ubuntu's own Docker package is
often old and does not include the modern `docker compose` plugin. Docker's
official repository always has the current, supported version.

Run these one block at a time:

```bash
# Tools needed to add a new package repository over HTTPS
apt-get install -y ca-certificates curl

# Download Docker's signing key. Why: apt refuses packages that are not
# cryptographically signed by a key you have explicitly trusted.
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Register Docker's repository with apt
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  > /etc/apt/sources.list.d/docker.list

# Install Docker engine + the compose plugin
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verify it worked:

```bash
docker --version
docker compose version
```

Both should print version numbers. If they do, Docker is ready.

---

## Part 4 - Set up the firewall

**Why:** by default every program on the server could accept connections
from the whole internet. A firewall flips that: block everything, then allow
only what we actually serve. We need exactly three doors open:

- **OpenSSH (port 22)** - so YOU can keep logging in.
- **80 (HTTP)** - normal web traffic.
- **443 (HTTPS)** - encrypted web traffic (for when you enable HTTPS later).

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

Order matters: allow OpenSSH BEFORE enabling, otherwise you lock yourself
out of your own server.

Check with `ufw status` - you should see the three rules.

Good to know: Docker publishes container ports by editing the firewall
rules directly, which can bypass ufw. In this stack that is harmless - the
only ports any container publishes are 80 and 443, which we opened anyway.
The backend and frontend publish nothing.

---

## Part 5 - Get the code onto the server

**Why:** the server needs the source code (Dockerfiles, datasets, app code)
to build the images. We pull it from GitHub rather than uploading from your
PC, because then updating later is just `git pull`.

```bash
git clone https://github.com/<your-username>/<your-repo>.git cropai
cd cropai
```

If the repository is **private**, GitHub will refuse the anonymous clone.
Two easy options:

- Make the repo public (fine for this project), or
- Create a Personal Access Token on GitHub (Settings -> Developer settings
  -> Personal access tokens, scope `repo`) and clone with:
  `git clone https://<TOKEN>@github.com/<user>/<repo>.git cropai`

---

## Part 6 - First deploy

**Why each flag:** `up` creates and starts the containers, `--build` builds
the images first (needed on the first run and after code changes), `-d`
means "detached" - the stack keeps running in the background after you
close the terminal.

```bash
docker compose up -d --build
```

What happens now (first run takes 5-15 minutes - this is normal):

1. Docker downloads the base images (Python, Node, Caddy).
2. Backend image: installs Python packages, then TRAINS the three ML models
   from the real datasets in `data/`. You will see the training log
   (accuracy, MAE) scroll by in the build output.
3. Frontend image: installs npm packages with pnpm, then compiles the
   production Next.js build.
4. All three containers start; Docker waits for the backend to report
   healthy before starting the frontend, and the frontend before caddy.

### Verify it works

```bash
docker compose ps
```

All three services should say `Up` and `(healthy)`. Then:

```bash
curl -s http://localhost/api/ml/health
```

Expected output (the important parts): `"status":"ok","models_loaded":true`.

Finally, on your PC, open a browser at:

```
http://YOUR_DROPLET_IP
```

The CropAI dashboard should load. Test all three tools (recommend, yield,
rotation) end to end. Congratulations - you have deployed.

**Why the app survives reboots:** every service in `docker-compose.yml` has
`restart: unless-stopped`, so Docker restarts crashed containers and brings
the whole stack back automatically if the Droplet reboots. Nothing else to
configure.

---

## Part 7 - Deploying updates later

**Why this flow:** the server rebuilds only what changed, then swaps the
running containers with the new ones. Downtime is a few seconds.

Whenever you have pushed new code to GitHub:

```bash
ssh root@YOUR_DROPLET_IP
cd cropai
git pull                          # fetch the new code
docker compose up -d --build      # rebuild changed images, restart changed services
docker image prune -f             # delete old, now-unused image layers
```

Why the prune: every rebuild leaves the previous image behind; over months
these orphans can fill the disk. `prune -f` cleans them up safely (it only
removes images no container uses).

---

## Part 8 - Enabling HTTPS (when you have a domain)

**Why HTTPS:** browsers mark plain HTTP sites "Not secure", and HTTPS
encrypts traffic so nobody between the user and your server can read or
modify it. Thanks to Caddy this is nearly zero work.

1. At your domain registrar, create a DNS **A record** pointing your domain
   (e.g. `cropai.example.com`) to the Droplet's IP. An A record is simply
   the phonebook entry "this name -> this IP".
2. Wait a few minutes, then check it resolves: `ping cropai.example.com`
   should show your Droplet IP.
3. On the server, edit the Caddy config:

   ```bash
   nano deploy/Caddyfile
   ```

   Replace the line `:80` with your domain, so the file starts with:

   ```
   cropai.example.com {
   ```

   Save and exit (Ctrl+O, Enter, Ctrl+X).
4. Recreate the caddy container so it picks up the new config:

   ```bash
   docker compose up -d --force-recreate caddy
   ```

That is everything. Caddy contacts Let's Encrypt (a free, nonprofit
certificate authority), proves it controls your domain, installs the
certificate, redirects HTTP to HTTPS, and renews the certificate forever.
Port 443 was already published and the firewall already allows it; the
`caddy_data` volume keeps the certificates across restarts.

---

## Part 9 - Everyday operations cheat sheet

```bash
docker compose ps                    # what is running, health status
docker compose logs -f               # live logs from all services (Ctrl+C to stop watching)
docker compose logs -f backend       # live logs from one service
docker compose logs --tail 100 caddy # last 100 log lines of one service
docker compose restart frontend      # restart a single service
docker compose down                  # stop the whole stack (data volumes survive)
docker compose up -d                 # start it again (no rebuild)
docker system df                     # how much disk Docker is using
free -h                              # server memory usage
df -h /                              # server disk usage
```

---

## Troubleshooting

**The frontend build dies with "exit code 137"**
Out of memory - should not happen on an 8 GB Droplet. If it ever does
(e.g. on a smaller server), add a temporary swap file and rebuild:
`fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`

**`docker compose ps` shows backend as unhealthy**
Read its logs: `docker compose logs backend`. A "Model artifacts not found"
error means the training stage failed during the build - rebuild with full
output: `docker compose build --no-cache backend` and read the error.

**Browser cannot reach http://YOUR_DROPLET_IP**
1. `docker compose ps` - is caddy up?
2. `ufw status` - is 80/tcp allowed?
3. Are you typing `http://` (not `https://`)? HTTPS only works after Part 8.

**"port is already allocated" or "address already in use" on port 80**
Another web server is running on the host. Find and stop it:
`systemctl disable --now apache2` or `systemctl disable --now nginx`.

**`git pull` asks for credentials on a private repo**
Use the Personal Access Token clone URL from Part 5.

**HTTPS does not activate after Part 8**
`docker compose logs caddy` shows why. The usual causes: the A record does
not point at this server yet (DNS can take up to an hour), or port 443 is
blocked by an external firewall (DigitalOcean Cloud Firewalls, if you added
one, must also allow 80 and 443).

---

## Glossary

- **Droplet** - DigitalOcean's name for a rented virtual server.
- **SSH** - secure remote terminal; how you control the server from your PC.
- **Image** - a frozen, ready-to-run package of an app and its dependencies.
- **Container** - a running instance of an image.
- **docker compose** - tool that runs several containers as one stack.
- **Reverse proxy** - the front-door server (Caddy) that receives all
  public traffic and forwards it to the right internal service.
- **Port** - a numbered door on a machine; 80 = HTTP, 443 = HTTPS, 22 = SSH.
- **A record** - DNS entry mapping a domain name to a server IP.
- **Let's Encrypt** - free certificate authority Caddy uses for HTTPS.
- **Swap** - disk space used as overflow RAM.
