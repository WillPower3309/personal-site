---
title: Building a Continuously Deployed LaTeX Resume
date: 2025-07-28
draft: true
---

# Background

In order to ensure I stand out amongst an endless sea of Microsoft Word based resumes (but actually because Microsoft Word isn't available on Linux), I have crafted my resume in LaTeX. It's great! It helps me feel like the special snowflake I am while also being source controlled over Git. One drawback, however, is that if I both update my resume and want it to be available to download somewhere, like on this website or LinkedIn, I need to reupload it. Taking a few seconds to do this once a year or so is simply too much work!

# Setting up Continuous Deployment

Since my resume's source is hosted on GitHub, I can leverage some GitHub features (that should also be available on most other Git hosts) to compile + upload it whenever a change is made to the main branch. The location where it will be uploaded to is just a file in a release, which I can then link to.

Fortunately, this can be accomplished pretty easily with GitHub actions, as we just need to have a two step workflow:
1. Compile the resume into a PDF
2. Upload the PDF to the release

In practice, I just needed to create the following `build.yml` file in the `.github` directory of my resume's repo:
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

Prior to running this action, I needed to grant Github actions write permissions to the resume repo, otherwise it wouldn't be able to update the release. I found this setting in Settings / Actions / General / Workflow Permissions:

TODO: IMAGE

# Conclusion
As simple as that, updating my resume now requires no additional work beyond the update itself (like most sane people)! Beyond this process, I've also added a step in the release workflow to create a `.png` copy of my resume as well, so that it can be seen in all of its glory in the README of the project's repo, as well as on this site. This image will always be up to date, as it links to the `.png` file in the release:


(with all of this glazing of my resume, I figured I owed you all a look at it, be gentle in the comments :))

If you'd also like to add an image generation step, you'll need to update your `build.yml`:
```yml
```

