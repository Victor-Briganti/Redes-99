#!/bin/bash

VM="MinhaVM"
OVA="/home/nessuno/Downloads/fedora-coreos.ova"
IGNITION="pointer.ign"

# podman network my-network

# podman run --rm --name pg-test -p 5432:5432 --network my-network test
# podman run -it --rm --name node-test -p 3000:3000 --network my-network test2

# ssh-keygen -t ed25519 -f $(pwd)/ssh/key -N ""
# butane --pretty --strict pointer.yml > pointer.ign
# butane --pretty --strict config.yml > config.ign

python -m http.server 8080 &
VBoxManage import "$OVA" --vsys 0 --vmname "$VM"
VBoxManage modifyvm "$VM" --nic2 hostonly --hostonlyadapter2 vboxnet0
VBoxManage guestproperty set "$VM" "/Ignition/Config" "$(cat "$IGNITION")"
VBoxManage startvm "$VM"
