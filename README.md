# Duet Web Control 3.4.1 - RLP Drift

This is the Rapid Liquid Print-customized version of the Duet Web Control machine interface, built for the Alpha and Beta printers. The base interface can be built after commenting out all plugins except the Object Model browser in the *src --> plugins --> index.js* file. When building the RLP plugin, uncomment that plugin in the index file, open Git bash in the repository master folder, and run the
```
npm run build-plugin RLP
```
command.

The main branch is deployed on the Alpha machine, with the beta branch on both RLP's and Bionic Skins's Beta machines.

The interface was originally forked from Duet3D's repository, but has been unlinked to allow it to remain private to RLP. Primary functionality for the Alpha and Beta machines is defined in the RLP plugin, with most other changes in other files being cosmetic or for ease of use.

To build the entire interface, comment out the RLP plugin in the *src --> plugins --> index.js* file (building with the RLP plugin already there could create conflicting versions of the plugin that I have no idea how it'll handle), open Git bash in the repository master folder, and run the
```
npm run build
```
command. All files will be copied into the dist folder in the repository. To update the interface build on either machine, take the microSD card (or use FTP, easier but requires setup), delete all files in the /www/ directory EXCEPT for DuetAPI.xml, and extract all files and folders from the DuetWebControl-SD.zip file inside of dist into /www/. Either restart the machine or reload the page you are accessing the machine from, and all changes should take effect.

See below for general DWC information.



Duet Web Control is a fully-responsive HTML5-based web interface for RepRapFirmware which utilizes the Bootstrap framework, JQuery and a few other libraries to allow easy control of Duet-based 3D printer electronics.

It is designed to communicate with RepRapFirmware using WebSockets and RESTful HTTP requests. One goal of the core application is to keep things compact, so a good loading speed can be achieved even on slow networks. Another one is to communicate to the firmware using only AJAX calls, which either return JSON objects, plain texts or binary blobs.

Duet Web Control is free software; it is licensed under the terms of the GNU Public License v3.

## Supported electronics

At this time the following platforms are officially supported:

* Duet 2 Maestro
* Duet 2 WiFi
* Duet 2 Ethernet
* Duet 3 MB 6HC
* Duet 3 Mini 5+ Ethernet
* Duet 3 Mini 5+ WiFi

## Build variants

There are two build variants available:

* DuetWebControl-SD for Duet Maestro, Duet 2 series, and Duet 3 series in standalone mode
* DuetWebControl-SBC for Duet 3 series in SBC mode

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

In order to use the local development setup with software versions >= 3.2.0, it is possible to add `M586 C"*"` to your `config.g`.
However, this is a potential security issue because it permits cross-origin requests from ALL foreign sites.

### Compiles and minifies for production

```
npm run build
```
