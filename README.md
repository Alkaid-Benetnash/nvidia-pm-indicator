# Nvidia Power Management Indicator

### Description

This is a simple indicator used to report nvidia runtime power status. This is designed to help laptops, which are configured with [nvidia-prime+runtime power management](https://download.nvidia.com/XFree86/Linux-x86_64/460.39/README/dynamicpowermanagement.html), easily view the power status of the nvidia GPU.

This extension should display a nvidia icon on the top pannel, <img src="icons/nvidia-active.svg" alt="active" style="zoom:5%;" /> for active, <img src="icons/nvidia-suspend.svg" alt="suspend" style="zoom:5%;" /> for suspend.



### How to use?

git clone https://github.com/Alkaid-Benetnash/nvidia-pm-indicator nvidia-pm-indicator@alkaid

Then `gnome-extensions enable nvidia-pm-indicator@alkaid`.

PS: In addition, you may need to `alt+F2 r` to restart the gnome-shell to make things work.

### How does it work?

Periodically (30s) read `/sys/bus/pci/devices/0000:00:01.0/power/runtime_status`.

### TODO

Parse `power/runtime_active_time` and `power/runtime_suspend_time` to display active/suspend time in the dropdown menu of the indicator.