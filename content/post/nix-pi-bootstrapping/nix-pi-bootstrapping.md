---
title: The Best Way to Bootstrap NixOS on a Raspberry Pi
date: 2025-08-21
draft: true
---

# Introduction

Typically, the NixOS installation process on a new Raspberry Pi (or any SBC that boots off of an SD card) looks something like this:
1. Track down and download the NixOS aarch64 SD card image
2. Flash the image to the SD card and load it into the Pi
3. Boot up the Pi and either connect to it over SSH or attach a mouse, keyboard, and monitor to it
4. Connect it to your network, clone or create a configuration for it, and then `nixos-rebuild`

Maybe you're an advanced user, and had been using a tool like NixOS infect or NixOS anywhere, and you're about to close this tab thinking *there's no way that I can achieve faster bootstrapping than this*. Well, you'd be wrong. What if I told you that you can flash your complete config directly onto the SD card, and thereby finish your setup on step 2, while even skipping the pain of tracking down the aarch64 image link?

# The Setup

## Prerequisites
Unfortunately, there is a setup process as you need to actually write the config in the first place! This is NixOS after all. Assuming you have a config, or at least know how to write one, you only need to ensure the following bits are present:
- Hardware support for the Raspberry Pi (which can be done through [nixos-hardware](https://github.com/NixOS/nixos-hardware))
- `boot.loader` properly set, as it requires the following values for Pis:
  ```nix
  boot.loader = {
    generic-extlinux-compatible.enable = true;
    grub.enable = false;
  }
  ```

## Disko
What makes this whole thing possible is [disko](https://github.com/nix-community/disko). Disko allows you to define your disks (as the name would imply), through the nix language.

The purpose of this article is not to teach you Disko, so I'll leave that to the official documentation, and instead fast-forward you to the end result, which can be copy-pasted into a `disks.nix` file in the same directory as your Pi's nix config:

**TODO: mention I am assuming the reader uses flakes?**

```nix
{ disko, nixpkgs, pkgs, ... }:

# TODO: resize /nix to fill space in excess of the 6G image size as hook
# https://github.com/nix-community/disko/blob/master/docs/disko-images.md

let
  configTxt = pkgs.writeText "config.txt" ''
    [pi4]
    kernel=u-boot-rpi4.bin
    enable_gic=1

    # Otherwise the resolution will be weird in most cases, compared to
    # what the pi3 firmware does by default.
    disable_overscan=1

    # Supported in newer board revisions
    arm_boost=1

    hdmi_enable_4kp60=1

    [all]
    # Boot in 64-bit mode.
    arm_64bit=1

    # U-Boot needs this to work, regardless of whether UART is actually used or not.
    # Look in arch/arm/mach-bcm283x/Kconfig in the U-Boot tree to see if this is still
    # a requirement in the future.
    enable_uart=1

    # Prevent the firmware from smashing the framebuffer setup done by the mainline kernel
    # when attempting to show low-voltage or overtemperature warnings.
    avoid_warnings=1

    dtparam=audio=on
  '';

in {
  imports = [ disko.nixosModules.disko ];

  disko = {
    imageBuilder = {
      enableBinfmt = true;
      pkgs = nixpkgs.legacyPackages.x86_64-linux;
      kernelPackages = nixpkgs.legacyPackages.x86_64-linux.linuxPackages_latest;
    };
    devices = { 
      disk.main = {
        device = "/dev/mmcblk0"; # SD Card
        type = "disk";
        imageSize = "6G"; # this is the minimum size needed, expand the /nix partition to fill the extra space on the disk afterwards
        imageName = "raspberry-pi";
        content = {
          type = "gpt";
          partitions = {
            firmware = {
              size = "30M";
              priority = 1;
              type = "0700";
              content = {
                type = "filesystem";
                format = "vfat";
                mountpoint = "/firmware";
                postMountHook = toString (pkgs.writeScript "postMountHook.sh" ''
                  cd ${pkgs.raspberrypifw}/share/raspberrypi/boot && cp bootcode.bin fixup*.dat start*.elf *.dtb /mnt/firmware/
                  cp ${pkgs.ubootRaspberryPi4_64bit}/u-boot.bin /mnt/firmware/u-boot-rpi4.bin
                  cp ${configTxt} /mnt/firmware/config.txt
                '');
              };
            };
            boot = {
              size = "1G";
              type = "EF00";
              content = {
                type = "filesystem";
                format = "vfat";
                mountpoint = "/boot";
                mountOptions = [ "umask=0077" ];
              };
            };
            nix = {
              name = "root";
              size = "100%";
              content = {
                type = "filesystem";
                format = "ext4";
                mountpoint = "/nix";
              };
            };
          };
        };
      };
      nodev."/" = {
        fsType = "tmpfs"; 
        mountOptions = [
          "size=128M"
          "defaults"
          "noatime"
          "mode=755"
        ];
      };
    };
  };
}
```

To explain the above, we just define some options specific to the image that we will be generating in the next step, as well as the required partitions: `/firmware` (which can be modified by adjusting the value of `configTxt`), `/boot`, and of course good old `/`.

This disks file then needs to be imported into your Pi's configuration (which should already be present as the prerequsities outlined).

Please note that if you had previously defined your Pi's filesystems the horrible old archaic way (with the `fileSystems` config option), all of those lines will need to be removed from the config, as `disks.nix` will grant the equivalent values. Now onto the fun part!

# The Installation
The installation is as simple as building the config into an image, and then flashing that image onto an SD card. You can run the following to create an image building script:

```bash
nix build .#nixosConfigurations.<CONFIG_NAME>.config.system.build.diskoImagesScript
```

Or, if you hate progress and therefore don't use Flakes (I jest, I know they're a WIP as of writing):

```bash
```

And then execute the newly created image script to generate the image:
```bash
sudo ./result
```

If you require any additional steps in bootstrapping, such as copying files to the host (like I do for agenix managed secrets), the result script exposes some options:
- `--post-format-files <LOCAL_PATH> <TARGET_PATH>`: copy a local file to a target destination on the image after partitioning 
- ``

From here, you should now have a `` file, which you can flash to a microSD card, and profit!

If you're running into issues and would like to reference a complete Pi config that was built to work with this process, feel free to reference [mine](https://github.com/willpower3309/nixos-config).

