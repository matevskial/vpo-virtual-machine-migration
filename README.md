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
	* will have nfs that will share only the directory ```/home/user/libvirt/images``` (```user``` is your username)

* Host 2:
    * OS: Ubuntu 20.04 or KDE Neon 20.04
    * static IP(for example ```192.168.0.29```)
    * hostname ```kvm2```

## Set up shared directory

To do a migration of a virtual machine, both host need  to access a shared directory that will be a disk pool for KVM, and it can be done with nfs server.

Only one of the hosts need to have nfs server installed, so on one host setup the nfs server:

```bash
sudo apt install nfs-kernel-server
```

Create the folder ```/home/user/libvirt/images``` if it doesn't exist:

```bash
mkdir -p /home/user/libvirt/images```
```

Replace ```user``` with your username.

Then, edit ```/etc/exports``` to specify a shared directory with the following content:

```
/home/user/libvirt/images 192.168.0.1/24(rw,no_root_squash)
```

Replace the user name and the IP address of hosts that will be able to access the directory with your configuration.

On the other hosts, its enough to install only ```nfs-common```

```bash
sudo apt install nfs-common
```

## Install virtualization software

On each host, we will install kvm and qemu

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

## Set up a bridge network

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

Then apply the network configuration:

```bash
sudo netplan apply
```

You can check current network configuration to ensure the bridge ```br0``` is working

```bash
sudo networkctl status -a
```

When above command is executed, you should see something like the following output after scrolling to the information for the bridge:
```bash
● 5: br0
               Link File: /usr/lib/systemd/network/99-default.link
            Network File: /run/systemd/network/10-netplan-br0.network
                    Type: bridge
                   State: routable (configured)
                  Driver: bridge
              HW Address: 12:35:z6:be:63:5b
                     MTU: 1500 (min: 68, max: 65535)
           Forward Delay: 15s
              Hello Time: 2s
                 Max Age: 20s
             Ageing Time: 5min
                Priority: 32768
                     STP: no
  Multicast IGMP Version: 2
    Queue Length (Tx/Rx): 1/1
                 Address: 192.168.0.28
                          fe80::908f:84ff:fea7:1acb
                 Gateway: 192.168.0.1
                     DNS: 217.16.82.92
                          217.16.82.93
```


## Add storage pool with virt-manager(on both hosts)

Use virt-manager to add the shared directory as storage pool.

# Set up a virtual machine on one host(example on host kvm1) with virt-manager

You can use the GUI tool to create and start a virtual machine

```bash
sudo virt-manager
```

Recommended OSes for the virtual machine:
	* Alpine Linux extended
    * Ubuntu Server 20.04

You should also configure the CPU model to not copy host CPU configuration, but set the model as kvm64

# Set up simple web application

This repository contains the web app that we are going to deploy on the virtual machine

It is a simple nodejs web app that contains a single endpoint ```GET /hello. It also serves static content such as html, css, etc...

To run the app first you must have installed node and npm on the virtual machine where we are going to deploy the web app, and then:

```bash
cd web-app
npm install
npm start
```

You can also change the index page located in ```public/index.html```

# Make the migration


