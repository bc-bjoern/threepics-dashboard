# Threepics Dashboard – Debian APT Repository

This repository hosts a Debian APT repository for the **threepics-dashboard** application, a dashboard component for the Threepics project.

## 📦 Repository Contents

This repository includes:

- `dists/`: Distribution metadata (Release, InRelease, etc.)
  - `stable/`: Stable release metadata and package listings
  - `unstable/`: Development/nightly builds and package listings
- `pool/threepics-dashboard/`: Compiled `.deb` packages
- `public.key`: The public GPG key used to verify the repository's signed metadata
- `release.conf`, `release-stable.conf`, `release-unstable.conf`: Configuration files for release generation

## 🔐 GPG Signing

All packages and metadata are **signed with a GPG key**. You can find the public key in the `public.key` file.

To trust the key on your Debian/Ubuntu system:

```sh
wget -O - https://three-pics.com/debian/public.key \
  | gpg --dearmor | sudo tee /etc/apt/trusted.gpg.d/threepics.gpg
```

## 🐧 Using this APT Repository

To use the repository on a Debian-based system:

1. Add the repository to your APT sources:

   ```sh
   echo "deb [arch=armhf] https://three-pics.com/debian stable main" | sudo tee /etc/apt/sources.list.d/threepics.list
   ```

2. Add the GPG key (see above)

3. Update package list and install:

   ```sh
   sudo apt update
   sudo apt install threepics-dashboard
   ```

For the development/unstable version:

```sh
echo "deb [arch=armhf] https://three-pics.com/debian unstable main" | sudo tee -a /etc/apt/sources.list.d/threepics.list
```

## 🤖 Automated Builds

`.deb` packages are automatically built and deployed via **GitHub Actions**, including:

- Automatic versioning
- Repository metadata generation
- GPG signing of `Release`, `InRelease` files

## 📄 License

This repository contains build and packaging metadata only. The threepics-dashboard software is licensed separately under its own license.

---

Maintained by [three-pics.com](https://three-pics.com)
