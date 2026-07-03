#!/bin/bash

VM="VM"
OVA="/home/saito/Downloads/fedora-coreos.ova"
IGNITION="pointer.ign"

butane --pretty --strict pointer.yml >pointer.ign
butane -d . --pretty --strict config.yml >config.ign

if ! ss -ltnp | grep 8080 &>/dev/null; then
  python3 -m http.server 8080 &
fi

VBoxManage import "$OVA" --vsys 0 --vmname "$VM"
VBoxManage modifyvm "$VM" --nic2 hostonly --hostonlyadapter2 vboxnet0
VBoxManage guestproperty set "$VM" "/Ignition/Config" "$(cat "$IGNITION")"
VBoxManage startvm "$VM"
