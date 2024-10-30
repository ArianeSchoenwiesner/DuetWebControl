import { FileNotFoundError } from "@duet3d/connectors";
import { GCodeFileInfo } from "@duet3d/objectmodel";
import { defineStore } from "pinia";

import { getLocalSetting, removeLocalSetting, setLocalSetting } from "@/utils/localStorage";
import Path from "@/utils/path";

import { useMachineStore } from "./machine";
import { useSettingsStore } from "./settings";

/**
 * Default cache fields defined by third-party plugins
 */
export const defaultPluginCacheFields: Record<string, any> = {}

export const useCacheStore = defineStore("cache", {
	state: () => ({
		/**
		 * Last codes sent to this machine
		 */
		lastSentCodes: ["M0", "M1", "M84"],

		/**
		 * Record of G-code file name vs info
		 */
		fileInfos: {} as Record<string, GCodeFileInfo>,

		/**
		 * Custom plugin cache fields
		 */
		plugins: Object.assign({}, defaultPluginCacheFields) as Record<string, any>
	}),
	actions: {
		/**
		 * Load the cache
		 */
		async load() {
			const settingsStore = useSettingsStore(), machineStore = useMachineStore();

			let cache;
			if (settingsStore.cacheStorageLocal) {
				cache = getLocalSetting("cache");
				if (!cache) {
					cache = getLocalSetting(`cache/${machineStore.connector?.hostname ?? location.hostname}`);
				}
			} else {
				try {
					cache = await machineStore.download([{ filename: Path.dwcCacheFile }], false, false, false);
				} catch (e) {
					if (!(e instanceof FileNotFoundError)) {
						throw e;
					}
				}

				if (!cache) {
					try {
						cache = await machineStore.download([{ filename: Path.legacyDwcCacheFile }], false, false, false);
						await machineStore.delete(Path.legacyDwcCacheFile);
					} catch (e) {
						if (!(e instanceof FileNotFoundError)) {
							throw e;
						}
					}
				}
			}

			if (cache) {
				this.$patch(cache);
			}
		},

		/**
		 * Save the cache
		 */
		async save() {
			const settingsStore = useSettingsStore(); const machineStore = useMachineStore();
			if (settingsStore.cacheStorageLocal) {
				// If localStorage is full and the cache cannot be saved, clear file infos and try again
				if (!setLocalSetting("cache", this.$state)) {
					this.clearFileInfo();
					setLocalSetting("cache", this.$state);
				}
			} else {
				removeLocalSetting("cache");

				try {
					const content = new Blob([JSON.stringify(this.$state)]);
					await machineStore.upload([{ filename: Path.dwcCacheFile, content }], false, false, false);
				} catch (e) {
					// logged before we get here
				}
			}
		},

		/**
		 * Clear file info for a specific file or directory
		 * @param fileOrDirectory File or directory path
		 */
		clearFileInfo(fileOrDirectory?: string) {
			if (fileOrDirectory) {
				if (this.fileInfos[fileOrDirectory] !== undefined) {
					// Delete specific item
					delete this.fileInfos[fileOrDirectory];
				} else {
					// Delete directory items
					for (const filename in this.fileInfos) {
						if (Path.equals(fileOrDirectory, Path.extractDirectory(filename))) {
							delete this.fileInfos[filename];
						}
					}
				}
			} else {
				// Reset everything
				this.fileInfos = {};
			}
		},

		/**
		 * Register custom plugin cache data
		 * @param plugin Plugin ID
		 * @param key Data key
		 * @param defaultValue Default value
		 */
		registerPluginData(plugin: string, key: string, defaultValue: any) {
			const machineStore = useMachineStore();
			if (!machineStore.isConnected) {
				if (!(plugin in defaultPluginCacheFields)) {
					defaultPluginCacheFields[plugin] = {};
				}
				defaultPluginCacheFields[plugin][key] = defaultValue;
			}

			if (this.plugins[plugin] === undefined) {
				this.plugins[plugin] = {};
			}
			if (!(key in this.plugins[plugin])) {
				this.plugins[plugin][key] = defaultValue;
			}
		},

		/**
		 * Set custom plugin cache data
		 * @param plugin Plugin ID
		 * @param key Data key
		 * @param value Default value
		 */
		setPluginData(plugin: string, key: string, value: any) {
			if (this.plugins[plugin] === undefined) {
				this.plugins[plugin] = { key: value };
			} else {
				this.plugins[plugin][key] = value;
			}
		}
	}
})
