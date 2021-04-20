# Virtual machine migration

This repository contains the project for the course Virtualization and cloud computing in my uni.

# Goal

The goal of the project is to demonstrate KVM live migration

Live migration is a mechanism that allows transfer of working virtual machine from one KVM host to another.

# Procedure to set up the hosts

First we will setup 2 hosts with following requirements

* Host 1:
    * OS: Ubuntu 20.04 or KDE Neon 20.04
    * static IP(for example ```192.168.0.28```)
    * hostname ```kvm1```

* Host 2:
    * OS: Ubuntu 20.04 or KDE Neon 20.04
    * static IP(for example ```192.168.0.29```)
    * hostname ```kvm2```

Then, on each host, we will install kvm and qemu

```bash
sudo apt update
sudo apt install qemu qemu-kvm bridge-utils virt-manager
```

Make sure ```libvirtd``` is enabled and loaded
```bash
systemctl status libvirtd
```

You should get output something like this(output is stripped)
```bash
● libvirtd.service - Virtualization daemon
     Loaded: loaded (/lib/systemd/system/libvirtd.service; enabled; vendor preset: enabled)
     Active: active (running) since Tue 2021-04-20 14:50:54 CEST; 2h 39min ago
TriggeredBy: ● libvirtd-ro.socket
             ● libvirtd-admin.socket
             ● libvirtd.socket
       Docs: man:libvirtd(8)
             https://libvirt.org
   Main PID: 1015 (libvirtd)
      Tasks: 20 (limit: 32768)
     Memory: 83.8M
     CGroup: /system.slice/libvirtd.service
             ├─1015 /usr/sbin/libvirtd
             ├─1431 /usr/sbin/dnsmasq --conf-file=/var/lib/libvirt/dnsmasq/default.conf --leasefile-ro --dhcp-script=/usr/lib/libvirt/libvirt_leaseshelper
             └─1432 /usr/sbin/dnsmasq --conf-file=/var/lib/libvirt/dnsmasq/default.conf --leasefile-ro --dhcp-script=/usr/lib/libvirt/libvirt_leaseshelper

апр 20 14:50:56 kvm1 dnsmasq[1431]: using nameserver 127.0.0.53#53
```

Next, you should set up a network bridge that virtual machines will use to access the internet

On both kvm1 and kvm2 hosts you will modify ```/etc/netplan/01-network-manager-all.yaml```

Put the following content:

```yaml
network:
  version: 2
  ethernets:
    enp8s0:
      dhcp4: no
      dhcp6: no

  bridges:
    br0:
      interfaces: [enp8s0]
      dhcp4: no
      addresses: [192.168.0.28/24]
      gateway4: 192.168.0.1
      nameservers:
        addresses: [217.16.82.92, 217.16.82.93]
```

You should replace ```enp8s0``` with whatever is the name of your ethernet interface.
You should replace ```adderesses```, ```gateway4``` and ```nameservers: addresses``` with your network settings.
Each host(kvm1 and kvm2) will have different static IP address.

# Set up a virtual machine on one host(example on host kvm1)

You can use the GUI tool to create and start a virtual machine

```bash
sudo virt-manager
```

Recommended OSes for the virtual machine:
    * Ubuntu Server 20.04
    * Ubuntu Desktop 20.04
    * KDE Neon

# Set up simple web application
