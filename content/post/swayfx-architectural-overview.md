+++
date = '2026-11-11T15:04:31-05:00'
draft = true
title = 'Sway(FX) Architectural Overview'
+++

This post outlines the high-level design of the SwayFX Wayland compositor, and by extension, the Sway compositor that it is forked off of. Please note that this is up to date as of November 11, 2026.

## Background

**Wayland** is a protocol that specifies the communication between a display server and its clients. It is what allows Linux environments to arrange and render multiple graphical applications (the clients) on the screen at a time.

A **wayland compositor** is the program responsible for that arrangement and rendering, by performing the following:

1. **communicating with applications** to get their window textures to display on the screen
2. **composing the screen** by rendering all of the applications together onto the screen (thus its designation as a *compositor*)
3. **managing windows** by determining where they are placed and passing input through to them

[Sway](https://github.com/swaywm/sway) is a *tiling* wayland compositor, meaning that it arranges windows into a tiled layout, unlike the traditional stacking layouts that are the default on windows, MacOS, and many Linux desktop environments.

![An image comparing floating and tiling layouts](/img/tiling-vs-floating.svg)

Since Sway aims to be relatively barebones, its maintainers reject any pull requests implementing visual effects. This constraint is what birthed my personal pet project, [SwayFX](https://github.com/wlrfx/swayfx). SwayFX adds animations and eye candy effects to the Sway rendering layer, including blur, rounded corners, and shadows.

### wlroots

[wlroots](https://gitlab.freedesktop.org/wlroots/wlroots/) is a C library built by the Sway developers that provides building blocks for creating Wayland compositors. In their words:
> Pluggable, composable, unopinionated modules for building a Wayland compositor; or about 60,000 lines of code you were going to write anyway.

It provides a number of useful abstractions, including backends for interfacing with input and output hardware, and a scene graph API for rendering and arranging windows on to the screen.

## Sway Architecture

The following is a relatively high level overview of how Wayland clients (which are akin to application windows) interact with Sway and wlroots.

{{< figure src="/img/sway-architecture.svg" caption="The above diagram was rendered through [this mermaid file](/file/sway-architecture.mmd)" >}}

### The Tree

### SwayFX Changes
