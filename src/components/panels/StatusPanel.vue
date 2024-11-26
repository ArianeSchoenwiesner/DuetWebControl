<style scoped>
.axis-span {
	border-radius: 5px;
}

strong {
	align-self: center;
	text-align: center;
}

.category-header {
	flex: 0 0 100px;
}

a:not(:hover) {
	color: inherit;
}

.content span,
.content strong {
	padding-left: 8px;
	padding-right: 8px;
}

.probe-span {
	border-radius: 5px;
	text-align: center;
	white-space: nowrap;
	width: 60px;
}

.probe-span:not(:last-child) {
	margin-right: 8px;
}
</style>

<template>
	<v-card>
		<v-card-title class="py-2">
			<v-icon small class="mr-1">mdi-information</v-icon>
			{{ $t("panel.status.caption") }}

			<v-spacer />

			<status-label v-if="model.state.status" />

			<v-spacer />

			<!--span v-if="machineMode">{{ $t('panel.status.mode', [machineMode.toUpperCase()]) }}</span-->
		</v-card-title>

		<v-card-text v-if="sensorsPresent || (visibleAxes.length + model.move.extruders.length > 0)"
					 class="px-0 pt-0 pb-2 content text-xs-center">
			<!-- Axis Positions -->
			<template v-if="visibleAxes.length > 0">
				<v-row no-gutters class="flex-nowrap">
					<v-col tag="strong" class="category-header">
						Position
					</v-col>

					<v-col>
						<v-row align-content="center" no-gutters>
							<v-col v-for="(axis, index) in visibleAxes" :key="index"
								   class="d-flex flex-column align-center">
								<span class="axis-span font-weight-bold" :class="axisSpanClasses(index)">
									{{ axis.letter }}
								</span>
								<span>
									{{ $displayAxisPosition(axis, !displayToolPosition) }}
								</span>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</template>

			<!-- Extruders -->
			<template v-if="model.move.extruders.length > 0">
				<v-divider v-if="visibleAxes.length > 0" class="my-2" />

				<v-row align-content="center" no-gutters class="flex-nowrap">
					<v-col tag="strong" class="category-header">
						Volume (mL)
					</v-col>

					<v-col v-if="displayVirtualEPos" class="d-flex align-center justify-center">
						{{ $display(virtualEPos, 1) }}
					</v-col>
					<v-col v-else>
						<v-row align-content="center" no-gutters>
							<!--v-col v-for="(extruder, index) in move.extruders.slice(0,2)" :key="index" class="d-flex flex-column align-center">
								<strong>
									{{ $t(["A","B"][index]) }}
								</strong>
								<span>
									{{ $display(move.extruders[index].position*0.05, 3) }}
								</span-->
							<v-row v-if="model.global.extruder_num>2">
								<v-col v-for="(extruder, index) in model.move.extruders" :key="index" class="d-flex flex-column align-center">
									<strong>
										<div>
										{{ $t(["A","B","A2","B2","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"][index]) }}
										</div>
									</strong>
									<span>
										<div>
											{{ $display(model.move.extruders[index].position*0.05, 0) }}
										</div>
									</span>
								</v-col>
							</v-row>
							<v-row v-else>
								<v-col class="d-flex flex-column align-center">
									<strong><div>A</div></strong>
									<span><div>{{ $display(model.move.extruders[0].position*0.05, 0) }}</div></span>
								</v-col>
								<v-col class="d-flex flex-column align-center">
									<strong><div>B</div></strong>
									<span><div>{{ $display(model.move.extruders[1].position*0.05, 0) }}</div></span>
								</v-col>
							</v-row>
							<!--/v-col-->
						</v-row>
					</v-col>
				</v-row>
			</template>

			<!-- Speeds -->
			<template v-if="isFinite(model.move.currentMove.requestedSpeed) || isFinite(model.move.currentMove.topSpeed)">
				<v-divider v-if="visibleAxes.length + model.move.extruders.length > 0" class="my-2" />

				<v-row align-content="center" no-gutters class="flex-nowrap">
					<v-col tag="strong" class="category-header">
						{{ $t("panel.status.speeds") }}
					</v-col>

					<!--v-col>
						<v-row align-content="center" no-gutters>
							<v-col v-if="isFinite(model.move.currentMove.requestedSpeed)"
								   class="d-flex flex-column align-center">
								<strong>
									{{ $t("panel.status.requestedSpeed") }}
								</strong>
								<span>
									{{ $displayMoveSpeed(model.move.currentMove.requestedSpeed) }}
								</span>
							</v-col>

							<v-col v-if="isFinite(model.move.currentMove.topSpeed)"
								   class="d-flex flex-column align-center">
								<strong>
									{{ $t("panel.status.topSpeed") }}
								</strong>
								<span>
									{{ $displayMoveSpeed(model.move.currentMove.topSpeed) }}
								</span>
							</v-col>

							<v-col v-if="isFinite(model.move.currentMove.extrusionRate) && isFFForUnset"
								   class="d-flex flex-column align-center">
								<strong>
									<a href="javascript:void(0)" @click="displayVolumetricFlow = !displayVolumetricFlow">
										{{ displayVolumetricFlow ? $t("panel.status.volumetricFlow") : $t("panel.status.extrusionRate") }}
									</a>
								</strong>
								<span>
									{{ displayVolumetricFlow ? $display(volumetricFlow, 1, "mL/s") : $displayMoveSpeed(model.move.currentMove.extrusionRate) }}
								</span>
							</v-col-->
					<v-col v-if="isNumber(model.move.currentMove.requestedSpeed)" class="d-flex flex-column align-center">
						<strong>
							Max Speed
						</strong>
						<span>
							{{ $displayMoveSpeed(model.move.currentMove.requestedSpeed) }}
						</span>
					</v-col>

					<v-col v-if="isNumber(model.move.currentMove.topSpeed)" class="d-flex flex-column align-center">
						<strong>
							Speed
						</strong>
						<span>
							{{ $displayMoveSpeed(model.move.currentMove.topSpeed) }}
						</span>
					</v-col>
					<!--v-col v-if="isFinite(model.move.currentMove.extrusionRate) && isFFForUnset"
							class="d-flex flex-column align-center">
						<strong>
							<a href="javascript:void(0)" @click="displayVolumetricFlow = !displayVolumetricFlow">
								{{ displayVolumetricFlow ? $t("panel.status.volumetricFlow") : $t("panel.status.extrusionRate") }}
							</a>
						</strong>
						<span>
							{{ displayVolumetricFlow ? $display(volumetricFlow, 1, "mL/s") : $displayMoveSpeed(model.move.currentMove.extrusionRate) }}
						</span>
					</v-col-->
						<!--/v-row>
					</v-col-->
				</v-row>
			</template>

			<!-- Sensors -->
			<!--template v-if="sensorsPresent">
				<v-divider v-show="model.move.axes.length || mode.move.extruders.length || isNumber(model.move.currentMove.requestedSpeed) || isNumber(model.move.currentMove.topSpeed)" class="my-2"></v-divider>

				<v-row align-content="center" no-gutters class="flex-nowrap">
					<v-col tag="strong" class="category-header">
						{{ $t("panel.status.sensors") }}
					</v-col>

					<v-col>
						<v-row align-content="center" justify="center" no-gutters>
							<template v-if="mainboard !== null">
								<v-col v-if="mainboard.vIn !== null" class="d-flex flex-column align-center">
									<strong>
										{{ $t('panel.status.vIn') }}
									</strong>
									<v-tooltip bottom>
										<template #activator="{ on }">
											<span v-on="on" class="text-no-wrap">
												{{ $display(mainboard.vIn.current, 1, 'V') }}
											</span>
										</template>

										{{ $t('panel.status.minMax', [$display(mainboard.vIn.min, 1, 'V'), $display(mainboard.vIn.max, 1, 'V')]) }}
									</v-tooltip>
								</v-col>

								<v-col v-if="mainboard.v12 !== null" class="d-flex flex-column align-center">
									<strong>
										{{ $t('panel.status.v12') }}
									</strong>
									<v-tooltip bottom>
										<template #activator="{ on }">
											<span v-on="on" class="text-no-wrap">
												{{ $display(mainboard.v12.current, 1, 'V') }}
											</span>
										</template>

										{{ $t('panel.status.minMax', [$display(mainboard.v12.min, 1, 'V'), $display(mainboard.v12.max, 1, 'V')]) }}
									</v-tooltip>
								</v-col>

								<v-col v-if="mainboard.mcuTemp !== null" class="d-flex flex-column align-center">
									<strong class="text-no-wrap">
										{{ $t('panel.status.mcuTemp') }}
									</strong>
									<v-tooltip bottom>
										<template #activator="{ on }">
											<span v-on="on" class="text-no-wrap">
												{{ $display(mainboard.mcuTemp.current, 1, '°C') }}
											</span>
										</template>

										{{ $t('panel.status.minMax', [$display(mainboard.mcuTemp.min, 1, '°C'), $display(mainboard.mcuTemp.max, 1, '°C')]) }}
									</v-tooltip>
								</v-col>
							</template>

							<v-col v-if="fanRPM.length > 0" class="d-flex flex-column align-center">
								<strong>
									{{ $t("panel.status.fanRPM") }}
								</strong>

								<div class="d-flex flex-row">
									<template v-for="(item, index) in fanRPM">
										<template v-if="index !== 0">
											,
										</template>
										<span :key="index" :title="item.name" class="mx-0">
											{{ item.rpm }}
										</span>
									</template>
								</div>
							</v-col>

							<v-col v-if="validProbes.length > 0" class="d-flex flex-column align-center">
								<strong>
									{{ $tc("panel.status.probe", validProbes.length) }}
								</strong>
								<div class="d-flex">
									<span v-for="(probe, index) in validProbes" :key="index" class="pa-1 probe-span"
										  :class="probeSpanClasses(probe, index === 0)">
										{{ formatProbeValues(probe.value) }}
									</span>
								</div>
							</v-col>
						</v-row>
					</v-col>
				</v-row>
			</template-->
		</v-card-text>
		<v-card-text v-else class="pa-0">
			<v-alert :value="true" type="info">
				{{ $t("panel.status.noStatus") }}
			</v-alert>
		</v-card-text>
	</v-card>

</template>

<script lang="ts">
import ObjectModel, { Axis, Board, MachineMode, Probe, ProbeType } from "@duet3d/objectmodel";
import Vue from "vue";

import store from "@/store";
import { isPrinting } from "@/utils/enums";
import { DashboardMode } from "@/store/settings";

export default Vue.extend({
	computed: {
		isConnected(): boolean {
			return store.getters["isConnected"];
		},
		model(): ObjectModel {
			return store.state.machine.model;
		},
		isFFForUnset(): boolean {
			if (store.state.settings.dashboardMode === DashboardMode.default) {
				return !store.state.machine.model.state.machineMode || store.state.machine.model.state.machineMode === MachineMode.fff;
			}
			return store.state.settings.dashboardMode === DashboardMode.fff;
		},
		virtualEPos(): number {
			return store.state.machine.model.move.virtualEPos;
		},
		volumetricFlow(): number {
			if (store.state.machine.model.state.currentTool >= 0 && store.state.machine.model.state.currentTool < this.model.tools.length) {
				const selectedTool = store.state.machine.model.tools[store.state.machine.model.state.currentTool];
				if (selectedTool !== null) {
					// Get the average extruder diameter x mix ratio
					let numExtruders = 0, filamentArea = 0;
					for (let i = 0; i < selectedTool.extruders.length; i++) {
						const extruderIndex = selectedTool.extruders[i];
						if (extruderIndex >= 0 && extruderIndex < store.state.machine.model.move.extruders.length) {
							const extruder = store.state.machine.model.move.extruders[extruderIndex];
							if (extruder !== null) {
								filamentArea += selectedTool.mix[i] * (Math.PI * Math.pow((extruder.filamentDiameter / 2), 2));
								numExtruders++;
							}
						}
					}

					// Compute volumetric flow
					if (numExtruders > 0) {
						filamentArea /= numExtruders;
						return filamentArea * store.state.machine.model.move.currentMove.extrusionRate;
					}
				}
			}
			return NaN;
		},
		/*fanRPM(): Array<{ name: string, rpm: number }> {
			return store.state.machine.model.fans
				.filter(fan => (fan !== null) && (fan.rpm >= 0))
		...mapState('machine/model', {
			boards: state => state.boards,
			fans: state => state.fans,
			move: state => state.move,
			extruders: state=> state.global.extruder_num,
			machineMode: state => state.state.machineMode,
			sensors: state => state.sensors,
			status: state => state.state.status
		}),
		...mapGetters(['isConnected']),*/
		fanRPM() {
			return store.state.machine.model.fans
				.filter((fan:any) => fan && fan.rpm >= 0)
				.map((fan: any, index: any) => ({
					name: fan!.name || this.$t("panel.fan.fan", [index]),
					rpm: fan!.rpm
				}), this);
		},
		validProbes(): Array<Probe> {
			return store.state.machine.model.sensors.probes.filter((probe: { type: any; }|null) => (probe !== null) && (probe.type !== ProbeType.none)) as Array<Probe>;
		},
		mainboard(): Board | null {
			return store.state.machine.model.boards.find((board: { canAddress: any; }) => !board.canAddress) ?? null;
		},
		/*sensorsPresent(): boolean {
			return ((this.mainboard !== null) && ((this.mainboard.vIn !== null) || (this.mainboard.v12 !== null) || (this.mainboard.mcuTemp !== null))) ||
				(this.fanRPM.length > 0) || (this.validProbes.length > 0);
		},*/
		visibleAxes(): Array<Axis> {
			return store.state.machine.model.move.axes.filter((axis: { visible: any; }) => axis.visible);
		},
		darkTheme(): boolean {
			return store.state.settings.darkTheme;
		}
	},
	data() {
		return {
			displayToolPosition: true,
			displayVirtualEPos: false,
			displayVolumetricFlow: true
		}
	},
	methods: {
		axisSpanClasses(axisIndex: number) {
			if (axisIndex >= 0 && axisIndex < store.state.machine.model.sensors.endstops.length && store.state.machine.model.sensors.endstops[axisIndex]?.triggered) {
				return store.state.settings.darkTheme ? "light-green darken-3" : "light-green lighten-4";
			}
			return null;
		},
		isFilamentSensorPresent(extruderIndex: number) {
			return (extruderIndex >= 0) && (extruderIndex < store.state.machine.model.sensors.filamentMonitors.length) &&
				(store.state.machine.model.sensors.filamentMonitors[extruderIndex] !== null) && store.state.machine.model.sensors.filamentMonitors[extruderIndex]!.enabled &&
				(typeof (store.state.machine.model.sensors.filamentMonitors[extruderIndex] as any).filamentPresent === "boolean");
		},
		isFilamentPresent(extruderIndex: number) {
			return (store.state.machine.model.sensors.filamentMonitors[extruderIndex] as any).filamentPresent;
		},
		formatProbeValues(values: Array<number>) {
			if (values.length === 1) {
				return values[0];
			}
			return `${values[0]} (${values.slice(1).join(", ")})`;
		},
		isValidProbe(probe: Probe | null) {
			return (probe !== null) && (probe.type !== ProbeType.none);
		},
		probeSpanClasses(probe: Probe, isFirstItem: boolean) {
			let result = [];
			if (!isFirstItem) {
				result.push("ml-2");
			}
			if (!isPrinting(store.state.machine.model.state.status) && probe.value.length > 0) {
				if (probe.value[0] >= probe.threshold) {
					result.push("red");
					result.push(store.state.settings.darkTheme ? "darken-3" : "lighten-4");
				} else if (probe.value[0] > probe.threshold * 0.9) {
					result.push("orange");
					result.push(store.state.settings.darkTheme ? "darken-2" : "lighten-4");
				}
			}
			return result;
		}
	}
});
</script>
