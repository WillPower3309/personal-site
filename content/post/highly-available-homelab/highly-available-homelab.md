---
title: "Highly Available NixOS Homelab: Part 1 (Design)"
date: 2026-10-09
draft: true
---

## Background

Despite spending my working days building distributed highly available systems (currently at Amazon Web Services), I have a desire to introduce high availability to my homelab, and move away from my current humble single server PC. Perhaps some of my work has bled into my personal life, or perhaps my Plex server has reached the critical mass of usage among friends and family that will complain to me if the server goes down. In either case, I want to introduce some more fault-tolerance into my homelab, and I can mentally justify that added expense and time as professional development. That's a good enough reason for me!

Because of the technical complexity involved in this endeavor, this journey will be broken down into multiple pieces. This post represents part 1 of the process: the design.

## Constraints & Criteria

Whenever one begins a technical project involving some level of ambiguity, outlining constraints and criteria should be the initial starting point. Within these requirements, a solution can then be developed.

The constraints are generally tied to my current living situation: a small one bedroom Toronto condo, already packed to the gills with equipment related to various hobbies. This system will therefore need to be **as physically condensed as possible** --- no full size network rack allowed here. In addition, I really care about the environment, so despite having effectively free energy in the form of the static condo fees that are included in my rent, I want this cluster to be **energy efficient**. This also lends itself nicely to my final constraint: I want it to be **silent**. No loud fans when the cluster will live within a couple meters of my bed! Luckily a modern energy efficient system should inherently be thermally efficient, as wasted energy in the form of heat is minimized.

My general criteria is somewhat outlined in the intro: a highly available homelab. This can be more concretely specified as a cluster of servers that can maintain high availability. That is, if a single node is shutdown or experiences failure, the other nodes in the cluster can automatically pick up and resume its work. In addition, the cluster should be fully configured by NixOS, like the other personal computers I use. This will also make migration of my existing server easy --- I can simply refactor its existing NixOS configuration.

## The Hardware

Three nodes is generally the lower limit for a distributed system, since an odd number of nodes is required for establishing [quorum](https://en.wikipedia.org/wiki/Quorum_(distributed_computing)). Following the lower limit will also help make the small footprint constraint easier to fulfill, while still providing adequate fault tolerance for a homelab.

Storage is an important consideration as well. In a cluster, any node could run any service, so the same data needs to be available to all of the nodes in the cluster in a shared storage layer. While many networks separate compute and storage, I will be opting for a hyperconverged infrastructure, meaning that the three nodes will be responsible for running both the services in my homelab as well as a distributed filesystem. A single NAS could be an alternative option, but it would result in introducing a single point of failure, plus add another machine to the already size constrained network.

With the size of the cluster in mind, I began my search for a trio of mini PCs. The [MS-01](https://store.minisforum.com/en-ca/products/minisforum-ms-01-workstation) from Minisforum ended up fitting the bill. They contain laptop CPUs (read: energy efficient) with integrated graphics for hardware decoding the videos in my media server, and plenty of networking --- 2x 10 GB SFP+ ports and 2x 2.5 GB RJ45 ports. As clusters require dedicated networks for running their consensus algorithms with no interference, I could have a port for both the compute and storage layers, while leveraging SR-IOV on the 10 GB ports, allowing each service's VM or container direct hardware access to the network interface with no overhead (which is not only energy efficient but also performant). In addition, these mini PCs have a PCIe slot, meaning that I can use HBAs to connect them to the hard drives where all of my media would be stored.

After checking the measurements of the mini PCs, I realized that all 3 could fit in a half-width network rack in about 4U of space. This meant that if I could find an appropriately sized switch, patch panel, and enclosure for the HDDs that I'd pass to the mini PCs, I could feasibly have my whole homelab on an 8U half-width rack. I ended up finding a switch on Aliexpress that matched my size and port requirements, with 4 SFP+ ports (one for each of the 3 nodes plus my desktop), and 16 1GB RJ45 ports. For the HDDs I found an STL for a hot-swappable 2U half-width 6 drive JBOD [on Printables](https://www.printables.com/model/1305461-10-inch-rack-2u-6-x-35-inch-hdd-hot-swap).

## The Software

### NixOS

While the specifics of NixOS are out of scope for this blog post, the uninitiated can consider it a tool to declaratively define a computer through configuration files, with primitives for things like installing packages, and creating and managing systemd services, directories, and files. Modules are then built (for personal use or shared through the community) on top of those primitives, abstracting away a lot of the underlying configuration complexity, and allowing a user to configure a service for their machine using the high level options provided by the service's module. Because the cluster will consist of multiple nodes, with each node running an identical configuration (well, *near* identical, a small subset of settings will differ, such as IP and hostname), this configuration can be written once and deployed to each node, respecting the DRY principle.

### Distributed Compute

Handling distributed compute ultimately came down to a decision of containerization vs virtualization for the services running in the cluster, as each approach has their own management solutions. My only requirement was for relatively low overhead to meet the efficiency requirement.

My initial thought was to combine [Nomad](https://developer.hashicorp.com/nomad/docs/what-is-nomad), a workload orchestrator capable of clustering, with nix microvms, declarative minimal virtual machines. Microvms tend to have minor overhead compared to typical virtual machines, as they omit as much hardware emulation as possible, leveraging virtio drivers to interface directly with the hypervisor.

While virtual machines provide stronger security than containers (which share the host's kernel), containers are much lighter than virtual machines, even when considering microvms. Kubernetes has been on my "list of things to learn" for a while, and with declarative containers being a possibility through Nix, was a tempting alternative.

After creating a [nomad cluster + microvm POC](https://github.com/WillPower3309/nixos-config/tree/f943c46744985391d08a85b3b1bf86af5a548f3a/modules/hosts/server-cluster), I was happy with the outcomes but ultimately decided on using Kubernetes, sacrificing a bit of security to better meet my efficiency goal. For a production system, security would be the top priority, but for this personal cluster with minimal exposure to the internet, I was comfortable making that sacrifice.

### Distributed Filesystem

While [ceph](https://ceph.io) is arguably the standard, I decided to leverage SeaweedFS as the cluster's distributed filesystem of choice. This decision ultimately came down to the size of the cluster. While ceph scales better thanks to its CRUSH algorithm which locally calculates the location of a file client-side, at the scale of my homelab, this is overkill. Considering that SeaweedFS has a far lower resource footprint, my energy efficiency constraint is happy.

## Conclusion

This endeavour really reinforced the added complexity that high availability demands. While I tried to scope this blog post to the design phase of the homelab, I couldn't help but design and print mounts for the hardware to fit in the rack, and get all of the hardware mounted:

INSERT PICTURE

These STL files are publicly available on Printables:
+ 4U 3x MS-01 half-width rack mount
+ 2U Switch + Keystone Patch Panel

I hope you enjoyed my overview!

