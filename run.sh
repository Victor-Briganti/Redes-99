#!/bin/bash

VM="VM"
OVA="/home/nessuno/Downloads/fedora-coreos.ova"
IGNITION="pointer.ign"

rm -f app.tar.gz
tar -czf app.tar.gz db web

# rm -f ssh/key ssh/key.pub
# ssh-keygen -t ed25519 -f $(pwd)/ssh/key -N ""

# SSH_KEY="$(cat ssh/key.pub)"
# while IFS= read -r line; do
#   printf '%s\n' ${line//\$\{SSH_KEY\}/$SSH_KEY}
# done <pointer.yml | butane --pretty --strict >pointer.ign

# butane --pretty --strict pointer.yml >pointer.ign
# butane --pretty --strict config.yml >config.ign

# python -m http.server 8080 &

# if VBoxManage list runningvms | grep -q "\"$VM\""; then
#   VBoxManage controlvm "$VM" poweroff
#   sleep 10
# fi
#
# VBoxManage unregistervm "$VM" --delete

VBoxManage import "$OVA" --vsys 0 --vmname "$VM"
VBoxManage modifyvm "$VM" --nic2 hostonly --hostonlyadapter2 vboxnet0
VBoxManage guestproperty set "$VM" "/Ignition/Config" "$(cat "$IGNITION")"
VBoxManage startvm "$VM"
