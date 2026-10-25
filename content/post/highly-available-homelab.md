---
title: "Highly Available NixOS Homelab: Part 1 (Design)"
date: 2026-10-17
---

## Background

One of my many hobbies is maintaining a homelab --- a self-contained computing environment set up at home used for self-hosting services, learning infrastructure, and experimenting. My personal homelab currently consists of a single PC that hosts Plex, Immich, Home Assistant, Syncthing, Radicale, and several other useful tools. It allows me to own my data while replacing some of my subscription services.

Despite spending my working days building distributed highly available systems (currently at Amazon Web Services), I've developed a strong desire to introduce high availability into my home environment. Perhaps my work is bleeding into my personal life, or perhaps my Plex server has reached the critical mass of usage among friends and family who will complain if goes down. In either case, I want to introduce fault tolerance to this setup. I can mentally justify that added expense and time as professional development, and honestly, that's a good enough reason for me!

Due to the technical complexity of this endeavor, I'm breaking the journey down into a series of posts. This piece contains part 1: the design.

## Constraints & Criteria

I have a few constraints that are generally tied to my current living situation: a small one-bedroom Toronto condo that is packed to the gills with equipment related to various hobbies. Because of this, the new system needs to be **as physically condensed as possible** --- no full size network racks allowed here. It needs to fit within a 10U half-width rack footprint, since that's how much open room I have on my shelf. Additionally, I want this cluster to be **energy efficient**. Despite having effectively "free" electricity bundled into my static condo fees, I still care about my environmental footprint. While I don't have a quantitative threshold for this goal, I will be biased towards lower-power options when making design choices. This ties nicely into my final constraint: it must be **silent**. Loud server fans are a non-starter when the cluster will live just a couple meters from my bed! Fortunately, targeting lower power draw inherently reduces thermal output, making quieter cooling easy to achieve.

As for the criteria, the goal is to transition my services to a cluster of servers that can maintain high availability. That is, if a single node is shutdown or experiences failure, the remaining nodes in the cluster can automatically pick up and resume its work with minimal downtime. Finally, the cluster must be fully provisioned and configured via NixOS, just like my other machines. This will make migrating my existing server easy --- I can simply refactor its existing declarative configuration.

## The Hardware

Three nodes is generally the lower limit for a distributed system, since an odd number of nodes is required for establishing [quorum](https://en.wikipedia.org/wiki/Quorum_(distributed_computing)) and avoiding [split-brain](https://en.wikipedia.org/wiki/Split-brain_(computing)) scenarios. Following the lower limit will also help keep the physical footprint small while still providing adequate fault tolerance for a homelab.

With a three-node cluster in mind, I began searching for a trio of mini PCs. I wanted nodes that had:
+ A power efficient CPU with integrated graphics for hardware video decoding (I think I've mentioned Plex once or twice?)
+ Plenty of networking for both high speed LAN connections as well as dedicated interfaces for the low latency heartbeat and consensus algorithms that clusters require
+ A PCIe slot where a low-power Host Bus Adapter will live, for connecting hard drives to

Those are a lot of demands for a small computer! Fortunately, the [MS-01](https://store.minisforum.com/en-ca/products/minisforum-ms-01-workstation) from Minisforum ended up fitting the bill. They contain energy-efficient laptop CPUs with integrated graphics, a PCIe slot, and plenty of networking --- two 10 GbE SFP+ ports and two 2.5 GbE RJ45 ports. I was also interested in the twin USB4 ports; Thunderbolt networking could be used to create a high-bandwidth cross-node mesh network that might be useful for a storage layer.

After mapping out the measurements, I realized that all three mini PCs could fit in a half-width network rack in about 4U of space. If I could find a compact switch, patch panel, and enclosure for the hard drives, I could feasibly condense the entire homelab down to an 8U half-width rack. This, combined with an appropriately sized external UPS, would meet my size requirement.

I found a switch on Aliexpress that could be stripped down to fit in a 1U space, with 4 10 GbE SFP+ ports (one for each node plus my desktop), and 16 1 GbE RJ45 ports. For the hard drives I found an STL for a hot-swappable 2U half-width 6 drive JBOD [on Printables](https://www.printables.com/model/1305461-10-inch-rack-2u-6-x-35-inch-hdd-hot-swap).

## The Software

### NixOS

While the specifics of NixOS are out of scope for this blog post, the uninitiated can think of it as a tool to declaratively define a computer through configuration files. It provides primitives for package installation, user management, and creating and managing systemd services, directories, and files. The community then builds modules for specific services or features on top of those primitives, abstracting away some configuration complexity. This allows users to configure an entire service through a few high level options provided by its module.

Because my cluster will consist of multiple nodes running a near identical configuration (a small subset of settings will differ, such as IP and hostname), a shared configuration can be written and deployed to each node, respecting the DRY principle and minimizing setup time.

Beyond its reproducable nature, NixOS allows a system to be rolled back to a previous configuration "generation", which can be used to recover from regressions introduced by future deployments.

### Distributed Compute

#### Containers vs MicroVMs

MicroVMs are minimal and more efficient than typical virtual machines, as they omit as much hardware emulation as possible, leveraging virtio drivers to interface directly with their hypervisor. A Nix-based tool, [microvm-nix](https://github.com/microvm-nix/microvm.nix), exists to allow easy generation of MicroVMs through NixOS. This was a compelling option as it would allow me to migrate my existing services with minimal changes, beyond specifying the resource allocation needed for a given service to function.

While virtual machines provide stronger security than containers (which share the host's kernel), containers are much lighter than virtual machines, even when considering MicroVMs. I am comfortable with that tradeoff, given that all of my services --- sans Plex --- are only accessed through a mesh VPN and are not open to the wider internet.

Containers can also be declared through Nix, but would require some additional migration effort, as NixOS heavily leans on systemd for service lifecycle management. Systemd doesn't play nicely with containers as both it and the container runtime want to manage control groups within the container. Thankfully, a [service abstraction layer was recently merged into NixOS](https://github.com/NixOS/nixpkgs/pull/372170). This means that I can convert my existing service configs into containers by refactoring their upstream modules to be modular, and then leverage a tool like [Nimi](https://github.com/weyl-ai/nimi) to replace systemd as PID 1.

Despite containers requiring more refactoring than MicroVMs, they better align with my power efficiency goals, making them the better choice for me.

#### Cluster Workload Orchestrators

My initial thought was to use [Nomad](https://developer.hashicorp.com/nomad/docs/what-is-nomad), a workload orchestrator capable of clustering. It is the least resource demanding option I was able to find during my research, and already has a NixOS module. Despite deciding to pursue the containerization approach, I spun up a [nomad cluster + MicroVM POC](https://github.com/WillPower3309/nixos-config/tree/f943c46744985391d08a85b3b1bf86af5a548f3a/modules/hosts/server-cluster) for experimentation, using MicroVMs as they required minimal configuration changes. Nomad was enjoyable to use, and lightweight as promised, but I ultimately wanted to learn an orchestrator with more industry relevance.

Another option I considered was Proxmox VE, which some community enthusiasts recently [ported to run natively on NixOS](https://github.com/SaumonNet/proxmox-nixos). Unfortunately, this stack was heavier than Nomad, and (at the time of writing) was restricted in its NixOS configurability, primarily relying on configuration through its web interface.

The final option I looked into was Kubernetes, the industry standard for container orchestration. Kubernetes has a lot of overhead, due to being designed for large-scale production clusters, with a dedicated control plane. I really wanted to learn how to work with Kubernetes, but my power efficiency constraint wouldn't allow for it. Fortunately, I found K3s: a lightweight Kubernetes distribution optimized for resource-constrained environments. With an existing NixOS module and low resource footprint, it was an easy choice.

### Distributed Filesystem

In a high-availability cluster, any service must be able to quickly failover to any node. This means each container's persistent state needs to be consistently available across all of the nodes in the cluster via a shared storage layer. While many enterprise networks physically separate compute and storage, I am opting for a hyperconverged infrastructure, meaning that the same physical cluster will be responsible for both tasks. Adding a standalone NAS was an alternative option, but would result in introducing a single point of failure, and risk violating the narrow size constraints of my homelab.

An important choice for storage is redundancy. Since my cluster consists of only 3 nodes, I opted for a replication scheme that allows for a single-node failure. This allows the cluster to survive the loss of a single node at the cost of 33% of its total storage capacity. While 2 nodes of redundancy would have provided more resilience --- allowing a single node keep the storage layer operational --- losing 66% of the available capacity to overhead was too high of a price to pay. Furthermore, requiring more drives for the same usable storage linearly increases energy consumption, which would violate my power efficiency constraints.

My options for a distributed filesystem ended up mirroring my search for a cluster workload orchestrator: a choice between a heavy industry standard and a lightweight but niche alternative.

[Ceph](https://ceph.io) is arguably the standard distributed filesystem of choice. It is optimized for large-scale production clusters, and focuses on scaling, which it does very well thanks to offloading the calculations of a given file's location to the client-side via its CRUSH algorithm. Integration with the Kubernetes cluster would also be simple, thanks to the [Rook](https://rook.io/) storage orchestrator, which abstracts away much of the deployment complexity and automates the lifecycle management of the storage nodes. Unfortunately, beyond having a heavy footprint, Ceph's daemons are continuously communicating, meaning that the nodes will be prevented from idling and dropping to more power-efficient C-states.

Put off by the resource footprint of Ceph, I looked for an alternative choice, focusing on lightweight options. [Longhorn](https://longhorn.io/) proved to be the most compelling alternative. Similar to Rook-Ceph in that it is built specifically for Kubernetes, it delegates as much of its disk management to the Linux Kernel as possible, as opposed to implementing its own management layer like Ceph. This results in a much leaner footprint, with the caveat of poorer scalability, minimized in my case as my cluster has a mere three nodes.

Despite being tempted to follow the pattern of choosing the industry standard, I decided that the tradeoffs were not worth it, and chose Longhorn as my distributed filesystem of choice.

## Conclusion

This endeavour really reinforced the added complexity that high availability demands. While I tried to scope this blog post to the design phase of the homelab, I couldn't help but design and print mounts for the hardware to fit in the rack. After this was done, and all the hardware was mounted, I was left with a pretty nice result!

![A picture of the half-width network rack, with the hardware mounted](/img/network-rack.png)

I've made these STL files publicly available on Printables with a Creative Commons license, in case you'd like to replicate my setup:
+ [4U 3x MS-01 half-width rack mount](https://www.printables.com/model/1877442-3x-ms-01-4u-10-half-width-rack-mount)
+ [2U Switch + Keystone Patch Panel](https://www.printables.com/model/1877448-2u-aliexpress-16-x-1gb-4-x-10gb-poe-switch-10-rack)

I hope you enjoyed my overview! I'm looking forward to the implementation phase of this project, where I'll focus a bit more on the configuration process.

