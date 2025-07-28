---
title: Building a Resume in LaTeX with Continuous Deployment
date: 2025-07-28
---

## Setting up "Continuous Deployment"

While the term "continuous deployment" typically invokes a mildly anxious feeling of software being automatically deployed to production environments, within the context of my LaTeX resume, it refers to building my resume into a PDF that is made available for download off of my website, through a Github release.

To do this, I leveraged Github actions, creating the following `build.yml` file in the `.github` directory of my resume's repo:

```yml
name: build resume

on:
  push:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: cachix/install-nix-action@v31
      with:
        github_access_token: ${{ secrets.GITHUB_TOKEN }}
    - run: nix flake check
    - run: nix build
    - uses: svenstaro/upload-release-action@v2
      with:
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        file: result/resume.pdf
        asset_name: resume.pdf
        tag: release
        overwrite: true
        body: "Latest version of William McKinnon's resume"
```

Prior to pushing the new action, I needed to grant Github actions write permissions to the resume repo. I found this setting in Settings -> Actions -> General -> Workflow permissions:

TODO: IMAGE

