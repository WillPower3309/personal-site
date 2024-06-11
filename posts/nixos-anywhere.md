---
title: Easily Install NixOS with nixos-anywhere
date: 2024-06-24
---

If you enjoy NixOS as much as I do, you're probably starting to amass quite a large and complex config. Perhaps you have started to use secret management tools like [agenix](https://github.com/ryantm/agenix) or [sops-nix](https://github.com/Mic92/sops-nix), and maybe you even have your [root directory living in a tmpfs](https://grahamc.com/blog/erase-your-darlings/).

If you fall under this category, you've surely came to a realisation: *adding a new machine to your config is a pain in the ass*.

Fortunately for you, I've been there - and boy, do I have a great solution. Want to install your complex config, or onboard a new host, in as little as two steps, all remotely (or as remotely as you can get)? Read on.

## Setup

The nixos installation media is awesome! It provides a simple nixos instance from which you can install the operating system, but what if I told you it could be better? We can make our own version of the nixos-installation image, which includes the public keys of the machines in our config - allowing you to boot up the installation media, and then `ssh` into the host and perform the rest of the installation remotely.

The config for the image is a simple 5 lines:
```nix
{
  system.activatable = false;
  networking.hostName = "nixos-install";
  users.users.root.openssh.authorizedKeys.keys = [ <PUBLIC KEYS OF THE REMOTE HOST GO HERE> ];
}
```

Assuming you are using flakes, you will also need to add the following to your `flake.nix`:
```nix
 inputs = {
  nixos-generators = {
    url = "github:nix-community/nixos-generators";
    inputs.nixpkgs.follows = "nixpkgs";
  };
};
outputs = { self, nixos-generators, ... }: {
  packages.x86_64-linux.installationMedia = mkImage "install-iso" [ <PATH TO YOUR CONFIG CREATED ABOVE`> ];
}
```

To build this image into an `.iso` file, simply run
```sh
TODO
```

From here, you can flash the iso onto an installation medium, such as a usb stick.

## Installation Steps
1. Boot nixos through the installation medium holding the image we created in the setup
  1. if the machine is not connected to your network via a wired connection, connect the machine to the network [wirelessly](TODO)
2. Fetch the IP address of the machine that we will be installing NixOS onto. This can be done either by running `ip addr` and noting the IP address for the network interface that is connected to your network (likely `wlp1s0` or `eth0` if connected wirelessly or wired respectively), or by checking the IP address given to `nixos-install`
2. Now, to remotely install nixos on the new machine, simply run:
```sh

```
