# NanoKVM-USB

## Introduction

The NanoKVM-USB is a convenient tool for operations and multi-device collaboration. It allows you to perform maintenance tasks without the need for a keyboard, mouse, or monitor. Using just a single computer and no additional software downloads, you can start graphical operations directly through the Chrome browser.

NanoKVM-USB captures HDMI video signals and transmits them to the host via USB 3.0. Unlike typical USB capture cards, NanoKVM-USB also captures keyboard and mouse input from the host and sends it to the target machine in real-time, eliminating the need for traditional screen and peripheral connections. It also supports HDMI loop-out, with a maximum resolution of 4K@30Hz, making it easy to connect to a large display.

## Game Mode

- Toggle **Game Mode** from the keyboard menu (menu bar → keyboard icon → Game Mode switch).
- When enabled, the frontend rewrites outbound keyboard reports so gaming combos such as `W + Space` or `W + Ctrl` keep movement keys held even with limited hardware rollover.
- Game Mode defaults to **off**; enable it only when you need those improved combos as it has not been fully tested.


## Versions

We offer one version of the application: [Browser](https://github.com/SquareszLeaf/NanoKVM-USB/tree/main/browser). Available on the [Releases page](https://github.com/SquareszLeaf/NanoKVM-USB/releases/).

### Browser Version

Access our online service at [usbkvm.sipeed.com](https://usbkvm.sipeed.com).

For self-deployment, download the `NanoKVM-USB-xxx-browser.zip` and serve it. Refer to the [Deployment Guide](https://wiki.sipeed.com/hardware/en/kvm/NanoKVM_USB/development.html) for details.

> Please use the desktop Chrome browser.
