<template>
	<div>
		<v-row id="homedCard" class="justify-center stretch no-gutters">
			<div v-if="(!axes[0].homed) || (!axes[1].homed) || (!axes[2].homed)">
				<v-card id="homed" :disabled="status!='idle'" class="text-center flex-row stretch" color="warning">
					<v-card-title>
						Machine not homed!!!
						<v-btn class="ma-2" @click='homing("all")' color="blue">
							Home
						</v-btn>
					</v-card-title>
				</v-card>
			</div>
		</v-row>
		<v-row id="materialCard" class="justify-center stretch no-gutters">
			<div v-if='!global["material"]'>
				<v-card color="warning" class="ma-2">
					<v-card-title>
						Material may not be ready to print! Please check needle state before printing.
						<v-btn class="ma-2" color="blue" @click="sendCode('set global.material=true')">
							Dismiss
						</v-btn>
					</v-card-title>
				</v-card>
			</div>
		</v-row>
		<v-row class="justify-left">
			<v-col cols=8>
				<v-card id="purging" :disabled="status!='idle'" class="justify-left my-1 pa-6">
					<v-card-title>
						<v-icon class="mr-2">
							{{ purgeIcon }}
						</v-icon>
						Purge Options
					</v-card-title>
					<v-row>
						<v-col>
							<!--v-btn-toggle id="length" v-model='needle' class="flex-wrap" max=1>
								<v-btn id="twofivelength" value=0.25 color='gray'>
									0.25m
								</v-btn>
								<v-btn id="fivelength" value=0.5 color='gray'>
									0.5m
								</v-btn>
							</v-btn-toggle-->
							Ratio
							<br>
							<v-btn-toggle v-model="ratio" @change="makeRatioString">
								<v-btn value=1 color='gray' id="ratBtn1">
									1:1
								</v-btn>
								<v-btn value=0.1 color='gray' id="ratBtn2">
									1:10
								</v-btn>
							</v-btn-toggle>
							<br>
							<br>
							<div v-if="move.extruders.length>2">
								Additive %
								<br>
								<br>
								<v-row v-for="(extruder, index) in move.extruders" :key="index" class="mx-4">
									<div v-if="index > 1">
										<v-row>
											<input type="checkbox" label='[Cl,Dl,El,Fl,Gl,Hl,Il,Jl,Kl,Ll,Ml,Nl,Ol,Pl,Ql,Rl,Sl,Tl,Ul,Vl,Wl][index-2]' v-model='adds[index-2][1]' @change="refreshAdd($event, index-2)">
											<label for="[Cl,Dl,El,Fl,Gl,Hl,Il,Jl,Kl,Ll,Ml,Nl,Ol,Pl,Ql,Rl,Sl,Tl,Ul,Vl,Wl][index-2]" class="text-center mx-2">
												{{ $t(adds[index-2][0]) }}
											</label>
										</v-row>
										<div v-if="adds[index-2][1]">
											<v-row>
												<v-text-field type="number" :id="adds[index-2][0]" :placeholder="String(adds[index-2][2])" persistent-placeholder clearable @click:clear="refreshAdd($event, index-2)" @change="refreshAdd($event, index-2)" @blur="refreshAdd($event, index-2)"></v-text-field>
												<!--label for="adds[index-2][0]" class="text-left">
													{{ $display(parseFloat(adds[index-2][2])) }}
												</label-->
											</v-row>
										</div>
										<br>
									</div>
								</v-row>
							</div>
							<br>
							Custom Ratio
							<br>
							<br>
							<div>
								<v-row class="text-center mx-2">
									<!--v-text-field type="number" :id="ratios[index][0]+'custom'" :label="ratios[index][0]" :placeholder="String(ratios[index][2])" persistent-placeholder clearable @click:clear="refreshRatio($event, index)" @change="refreshRatio($event, index)" @blur="refreshRatio($event, index)"></v-text-field-->
									<v-text-field type="number" id="ratInp1" value=1 label="A:" v-model="aInp" clearable @click:clear="refreshRatio" @change="refreshRatio" @blur="refreshRatio"></v-text-field>
									<v-text-field type="number" id="ratInp2" value=1 label="B:" v-model="bInp" clearable @click:clear="refreshRatio" @change="refreshRatio" @blur="refreshRatio"></v-text-field>
								</v-row>
							</div>
							<br>
							<!--v-row class="mx-4">
								<div>
									<v-row>
										<input type="checkbox" label="Run Clean Purge at End" v-model='global["cleanPurge"]' @click='sendCode("set global.cleanPurge = !global.cleanPurge")'>
										<label for="Run Clean Purge at End" class="ml-1">
											{{ $t('Clean Purge At End') }}
										</label>
									</v-row>
								</div>
							</v-row-->
							Idle Mode - Purge Every:
							<br>
							<v-btn-toggle v-model="time" class="justify-center">
								<v-btn value=5 color='gray'>
									5min
								</v-btn>
								<v-btn value=10 color='gray'>
									10min
								</v-btn>
								<v-btn value=15 color='gray'>
									15min
								</v-btn>
							</v-btn-toggle>
							<br>
							<br>
						</v-col>
						<v-col>
							<div v-if="needle && ratio">
								Ratio Set At {{ $t(ratioString) }}
								<br>
								<div v-if="!idlePurging">
									<v-btn color="green" @click="fullPurge" block>
										Purge
									</v-btn>
									<br>
									<v-btn color="green" @click="refreshPurge" block>
										Refresh Purge
									</v-btn>
									<br>
									<v-btn color="teal" @click="printString" block>
										Print Extrusion String
									</v-btn>
								</div>
							</div>
							<br>
							<div v-if="needle && ratio && time">
								<div v-if="!idlePurging">
									<v-btn color="green" @click="idleMode" block>
										Idle Purge
									</v-btn>
									<br>
								</div>
								<div v-if="idlePurging">
									<v-btn color="red" @click="stopIdleMode" block>
										End Idle Purge
									</v-btn>
									<br>
								</div>
							</div>
							<div>
								<v-btn color="green darken-4" @click='cleanPurging' block>
									Run Clean Purge
								</v-btn>
							</div>
							<br>
							<div v-if="air==0">
								<v-btn color="green darken-4" @click="sendCode('M42 P3 S1')" block>
									Turn Air On
								</v-btn>
							</div>
							<div v-if="air==1">
								<v-btn color="red darken-3" @click="sendCode('M42 P3 S0')" block>
									Turn Air Off
								</v-btn>
							</div>
							<br>
							<div v-if="!idlePurging">
								<v-btn color="green darken-4" @click='sneezePurge("AB")' block>
									Sneeze
								</v-btn>
							</div>
							<!--div>
								<br>
								<v-btn color="green" @click="printString" block>
									Log Extrusion to Console
								</v-btn>
							</div-->
						</v-col>
					</v-row>
					<v-expansion-panels color="grey-lighten-5">
						<v-expansion-panel>
							<v-expansion-panel-header>Last Job Start Location</v-expansion-panel-header>
							<v-expansion-panel-content>
								X: {{ $display(global["placeX"]) }}<br>
								Y: {{ $display(global["placeY"]) }}<br>
								Z: {{ $display(global["placeZ"]) }}
							</v-expansion-panel-content>
						</v-expansion-panel>
					</v-expansion-panels>
				</v-card>
				<!--v-card id="clicker" :disabled="status!='idle' || idlePurging" class="justify-left my-2 pa-2">
					<v-card-title>
						<v-icon class="mr-2">
							{{ locationIcon }}
						</v-icon>
						Locations
					</v-card-title>
					<v-btn-toggle v-model='clickerEnabled'>
						<div v-if='!clickerEnabled'>
							<v-btn value=true color='green'>
								Enable Clicker
							</v-btn>
						</div>
						<div v-if='clickerEnabled'>
							<v-btn value=false color='red'>
								Disable Clicker
							</v-btn>
						</div>
					</v-btn-toggle>
					<v-row>
						<v-col>
							<div>
								Machine Position<br><br>
								<div v-if="status!='idle' && status!='busy'">
									Relative to Current Job
									<br>
									<br>
								</div>
								X: {{ $display(axes[0].machinePosition) }}<br>
								Y: {{ $display(axes[1].machinePosition) }}<br>
								Z: {{ $display(axes[2].machinePosition) }}
								<div v-if='clickerEnabled && currX && currY'>
									Clicker Position:<br><br>
									X: {{ $display(currX) }}<br>
									Y: {{ $display(currY) }}<br><br>
								</div>
							</div>
						</v-col>
						<v-col>
							<div id="saved" :disabled="status!='idle' || idlePurging">
								Last Job Start
								<br>
								<br>
								X: {{ $display(global["placeX"]) }}<br>
								Y: {{ $display(global["placeY"]) }}<br>
								Z: {{ $display(global["placeZ"]) }}
							</div>
						</v-col>
					</v-row>
				</v-card-->
			</v-col>
			<!--v-col v-resize="resize" class="text-center">
				<v-card id="clickercanvas" :disabled="status!='idle' || idlePurging" tile class="ma-1">
					<canvas id='canvas' @mousemove="getMousePos" @click="moveMachine" v-resize="resize"></canvas>
				</v-card>
			</v-col-->
			<v-col>
				<v-row>
					<v-col>
						<v-card id="keypad" :disabled="status!='idle' || idlePurging" color='#424242' class="justify-left my-1 py-2">
							<v-card-title class="ma-2 text-right">
								<v-icon class="mr-2">
									{{ arrowIcon }}
								</v-icon>
								Jogging
							</v-card-title>
							<v-row class="text-center mx-8">
								<v-text-field type="number" id="xx" label="X:" :placeholder=String(axes[0].machinePosition) persistent-placeholder v-model="xInp"></v-text-field>
							</v-row>
							<v-row class="text-center mx-8">
								<v-text-field type="number" id="yy" label="Y:" :placeholder=String(axes[1].machinePosition) persistent-placeholder v-model="yInp"></v-text-field>
							</v-row>
							<v-row class="justify-left px-10">
								<v-btn color="green" @click="goTo">
									Go
								</v-btn>
							</v-row>
							<br>
							<br>
							<v-row class="text-center mx-8">
								<v-text-field type="number" id="zz" label="Z:" :placeholder=String(axes[2].machinePosition) persistent-placeholder v-model="zInp"></v-text-field>
							</v-row>
							<v-row class="justify-left px-10">
								<v-btn color="green" @click="zGoTo">
									Go
								</v-btn>
							</v-row>
							<br>
							<br>
							<v-row class="justify-left px-10">
								<v-btn color="green" @click="setupLoc">
									Go to Setup Location
								</v-btn>
							</v-row>
							<br>
							<v-expansion-panels>
								<v-expansion-panel>
									<v-expansion-panel-header>Keypad</v-expansion-panel-header>
									<v-expansion-panel-content>
										<br>
										<br>
										<v-row class="text-center">
											<v-col>
												Y+
												<v-btn color='blue' @mousedown='started=true, sendTheCode("G1 Y", 10, 1)' @mouseup='started=false'>
													<v-icon>mdi-arrow-up-thick</v-icon>
												</v-btn>
											</v-col>
										</v-row>
										<v-row class="text-center">
											<v-col>
												X-
												<v-btn color='blue' @mousedown='started=true, sendTheCode("G1 X", -10, 0)' @mouseup='started=false'>
													<v-icon>mdi-arrow-left-thick</v-icon>
												</v-btn>
											</v-col>
											<v-col>
												X+
												<v-btn color='blue' @mousedown='started=true, sendTheCode("G1 X", 10, 0)' @mouseup='started=false'>
													<v-icon>mdi-arrow-right-thick</v-icon>
												</v-btn>
											</v-col>
										</v-row>
										<v-row class="text-center">
											<v-col>
												Y-
												<v-btn color='blue' @mousedown='started=true, sendTheCode("G1 Y", -10, 1)' @mouseup='started=false'>
													<v-icon>mdi-arrow-down-thick</v-icon>
												</v-btn>
											</v-col>
										</v-row>
										<v-row class="text-center ma-4">
											<v-col>
												Z-
												<v-btn color='blue' @mousedown='started=true, sendTheCode("G1 Z", -10, 2)' @mouseup='started=false'>
													<v-icon>mdi-arrow-down-thick</v-icon>
												</v-btn>
											</v-col>
											<v-col>
												Z+
												<v-btn color='blue' @mousedown='started=true, sendTheCode("G1 Z", 10, 2)' @mouseup='started=false'>
													<v-icon>mdi-arrow-up-thick</v-icon>
												</v-btn>
											</v-col>
										</v-row>
										<br>
										<v-row class="justify-left">
											<v-btn @click="homing('all')" color="orange darken-3" class="ma-1 flex-grow-1" cols=2>
												Home All
											</v-btn>
										</v-row>
										<v-row>
											<v-btn @click="homing('x')" color="orange darken-3" class="ma-1">
												Home X
											</v-btn>
											<v-btn @click="homing('y')" color="orange darken-3" class="ma-1">
												Home Y
											</v-btn>
											<v-btn @click="homing('z')" color="orange darken-3" class="ma-1">
												Home Z
											</v-btn>
										</v-row>
									</v-expansion-panel-content>
								</v-expansion-panel>
							</v-expansion-panels>
						</v-card>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
	</div>
</template>

<script>
'use strict';

import {mapState, mapGetters, mapActions} from 'vuex';
import { mapMutations } from 'vuex';

export default {
	computed: {
		...mapState(['selectedMachine']),
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapState('machine/cache', {
			pluginCache: (state) => state.plugins.RLP,
		}),
		...mapState('machine/model', {
			systemDirectory: (state) => state.directories.system,
			move: (state) => state.move,
			axes: (state) => state.move.axes,
			global: (state) => state.global,
			status: (state) => state.state.status,
			air: (state) => state.state.gpOut[3].pwm,
			kinematicsName: (state) => state.move.kinematics.name,
		}),
		...mapState('settings', ['language']),
	},
	data() {
		return {
			files: [],
			selectedFile: null,

			isActive: false,
			ready: false,
			loading: false,
			errorMessage: null,

			// RLP data
			needle: 0.5,
			ratio: undefined,
			ratios: [["A",false,1,0.5],["B",false,1,0.5],["C",false,0,0],["D",false,0,0],["E",false,0,0],["F",false,0,0],["G",false,0,0],["H",false,0,0],["I",false,0,0],["J",false,0,0],["K",false,0,0],["L",false,0,0],["M",false,0,0],["N",false,0,0],["O",false,0,0],["P",false,0,0],["Q",false,0,0],["R",false,0,0],["S",false,0,0],["T",false,0,0],["U",false,0,0],["V",false,0,0],["W",false,0,0]],
			adds: [["C",false,0],["D",false,0],["E",false,0],["F",false,0],["G",false,0],["H",false,0],["I",false,0],["J",false,0],["K",false,0],["L",false,0],["M",false,0],["N",false,0],["O",false,0],["P",false,0],["Q",false,0],["R",false,0],["S",false,0],["T",false,0],["U",false,0],["V",false,0],["W",false,0]],
			totAdditive: 0,
			ratioString: undefined,
			idlePurging: false,
			running: "not running",
			codeIdle: true,
			codeReply: null,
			started: false,
			canvas: null,
			rendering: null,
			ctx: null,
			pos: null,
			xPos: null,
			yPos: null,
			tempX: null,
			tempY: null,
			xInp: undefined,
			yInp: undefined,
			zInp: undefined,
			aInp: undefined,
			bInp: undefined,
			container: null,
			currX: null,
			currY: null,
			homed: false,
			clickerEnabled: false,
			arrowIcon: 'mdi-arrow-all',
			mouseIcon: 'mdi-mouse-move-vertical',
			purgeIcon: 'mdi-water-outline',
			locationIcon: 'mdi-map-marker',
			resizeNum: null,
			time: null,
			interval: null,
			refreshBed: true,
		};
	},
	methods: {
		...mapActions('machine', ['download', 'getFileList', 'sendCode', 'warn', 'model']),
		...mapMutations(['hideCodeReplyNotifications', 'showCodeReplyNotifications']),
		log() {
			console.log(process.env.BASE_URL);
		},
		resize() {
			if (!this.isActive) {
				return;
			}

			// Resize canvas elements
			const width = document.body.clientWidth / 3
			let height;
			switch (this.$vuetify.breakpoint.name) {
				case 'xs':
					height = (width * 103) / 111;
					break;
				case 'sm':
					height = (width * 103) / 111;
					break;
				case 'xl':
					height = (width * 103) / 111;
					break;
				default:
					height = (width * 103) / 111;
					break;
			}/*
			this.resizeNum = [width, height];
			this.canvas = document.getElementById("canvas");
			if (this.canvas) {
				this.canvas.width = width;
				this.canvas.height = height;

				this.ctx = this.canvas.getContext('2d');
				this.renderBed();
			}*/
			return { width, height };
		},
		refreshRatio() {
			/*var tempRatioInput;
			var tempRatio;
			for (var i = 0; i < move.extruders.length; i++) {
				tempRatioInput = document.getElementById(this.ratios[i][0]+"custom");
				tempRatio = parseFloat(tempRatioInput.value);
				this.ratios[i][2] = tempRatio;
			}
			var ratioTotal = 0;
			for (var i = 0; i < move.extruders.length; i++) {
				ratioTotal += this.ratios[i][2];
			}
			for (var i = 0; i < move.extruders.length; i++) {
				this.ratios[i][3] = this.ratios[i][2] / ratioTotal;
			}
			*/
			var btn1 = document.getElementById("ratBtn1");
			var btn2 = document.getElementById("ratBtn2");
			var inp1 = document.getElementById("ratInp1");
			var inp2 = document.getElementById("ratInp2");
			this.aInp = parseFloat(inp1.value);
			this.bInp = parseFloat(inp2.value);
			if ((this.aInp != 1 && String(this.aInp) != String(Number.NaN)) && (this.bInp == 1 || String(this.bInp) == String(Number.NaN))) {
				this.ratio = this.aInp;
				btn1.disabled = true;
				btn2.disabled = true;
			}
			else if ((this.aInp != 1 && String(this.aInp) != String(Number.NaN)) && (this.bInp != 1 &&  String(this.bInp) != String(Number.NaN))) {
				this.ratio = (this.aInp / this.bInp);
				btn1.disabled = true;
				btn2.disabled = true;
			}
			else if ((this.aInp == 1 || String(this.aInp) == String(Number.NaN)) && (this.bInp != 1 && String(this.bInp) != String(Number.NaN))) {
				this.ratio = (1 / this.bInp);
				btn1.disabled = true;
				btn2.disabled = true;
			}
			else {
				this.ratio = undefined;
				btn1.disabled = false;
				btn2.disabled = false;
			}
			this.makeRatioString();
		},
		refreshAdd(event, add = 0) {
			if (event.target.type == "checkbox") {
				if(!event.target.checked) {
					this.adds[add][1] = false;
					this.totAdditive = this.totAdditive - this.adds[add][2];
					this.adds[add][2] = 0;
				}
				this.makeRatioString();
				return;
			}
			if (event.target.value == 0 || event.target.value == undefined) {
				this.totAdditive = this.totAdditive - this.adds[add][2];
				this.adds[add][2] = 0;
				event.target.value = undefined;
				this.makeRatioString();
				return;
			}
			var newAdd = parseFloat((document.getElementById(event.target.id)).value) / 100;
			if (this.adds[add][2] != 0) {
				this.totAdditive = this.totAdditive - this.adds[add][2] + newAdd;
				this.adds[add][2] = newAdd;
				event.target.value = undefined;
				this.makeRatioString();
				return;
			}
			this.totAdditive = this.totAdditive + newAdd;
			this.adds[add][2] = newAdd;
			event.target.value = undefined;
			this.makeRatioString();
		},
		makeRatioString() {		// THIS WILL NOT WORK FOR D+ ADDITIVES THAT WON'T BE GOING INTO B
			if (this.ratio != undefined) {
				if (this.ratio == 0.1) {
					if (this.adds[0][2] > 0) {
						var a1perc = 1 - this.adds[0][2];
						var a2perc = this.adds[0][2];
						var a1 = Number(this.ratio) * a1perc * 10;
						var a2 = Number(this.ratio) * a2perc * 10;
					}
					else {
						a1 = 1;
						a2 = 0;
					}
					if (this.adds[1][2] > 0) {
						var b1perc = 1 - this.adds[1][2];
						var b2perc = this.adds[1][2];
						var b1 = (1 / Number(this.ratio)) * b1perc;
						var b2 = (1 / Number(this.ratio)) * b2perc;
					}
					else {
						b1 = 10;
						b2 = 0;
					}
					this.ratioString = String(a1.toFixed(3)) + ":" + String(b1.toFixed(3)) + ":" + String(a2.toFixed(3)) + ":" + String(b2.toFixed(3));
				}
				else {
					if (this.adds[0][2] > 0) {
						a1perc = 1 - this.adds[0][2];
						a2perc = this.adds[0][2];
						a1 = a1perc;
						a2 = a2perc;
					}
					else {
						a1 = 1;
						a2 = 0;
					}
					if (this.adds[1][2] > 0) {
						b1perc = 1 - this.adds[1][2];
						b2perc = this.adds[1][2];
						b1 = (1 / Number(this.ratio)) * b1perc;
						b2 = (1 / Number(this.ratio)) * b2perc;
					}
					else {
						b1 = 1;
						b2 = 0;
					}
					this.ratioString = String(a1.toFixed(3)) + ":" + String(b1.toFixed(3)) + ":" + String(a2.toFixed(3)) + ":" + String(b2.toFixed(3));
				}
				/*var addIndex = -1;
				for (var i = 0; i < this.adds.length; i++) {
					if (this.adds[i][2] > 0) {
						addIndex = i;
					}
				}
				if (addIndex > -1) {
					if (this.ratio == 0.1) {
						this.ratioString = String(this.ratio * 10) + ':'
						var b1perc = 1 - this.adds[addIndex][2];
						var b2perc = this.adds[addIndex][2]
						var b1 = (1 / Number(this.ratio)) * b1perc;
						var b2 = (1 / Number(this.ratio)) * b2perc;
						this.ratioString += String(b1) + ":" + String(b2);/*
						/*for (i = 0; i <= addIndex; i++) {
							this.ratioString += ':' + String((this.adds[addIndex][2] * (Number(this.ratio) + 1) * 10).toFixed(2));
						}*/
					/*}
					else {
						this.ratioString = String((1 / Number(this.ratio)) * (Number(this.ratio)).toFixed(3)) + ':';
						b1perc = 1 - this.adds[addIndex][2];
						b2perc = this.adds[addIndex][2]
						b1 = (1 / Number(this.ratio)) * b1perc;
						b2 = (1 / Number(this.ratio)) * b2perc;
						this.ratioString += String(b1.toFixed(2)) + ":" + String(b2.toFixed(3));
						/*for (i = 0; i <= addIndex; i++) {
							this.ratioString += ':' + String((this.adds[addIndex][2] * (Number(this.ratio) + 1)).toFixed(2));
						}*/
					//}
				if ((parseFloat(this.adds[0][2]) == 0) && (parseFloat(this.adds[1][2] == 0))) {
					if (this.ratio == 0.1) {
						this.ratioString = String(this.ratio * 10) + String(1 * 10) + ":0:0";
					}
					else {
						if (Number(this.ratio) == 1) {
							this.ratioString = "1:1:0:0";
						}
						else {
							this.ratioString = String((Number(this.ratio)).toFixed(3)) + ':1:0:0';
						}
					}
				}
			}
		},/*
		getMousePos(e) {
			if (this.clickerEnabled && this.status=="idle") {
				var xPos = this.canvas.getBoundingClientRect().left;
				var yPos = this.canvas.getBoundingClientRect().top;
				this.tempX = e.clientX-xPos;
				this.tempY = e.clientY-yPos;

				this.currX = this.axes[0].max*(this.tempX/this.canvas.getBoundingClientRect().width);
				this.currY = this.axes[1].max*(this.tempY/this.canvas.getBoundingClientRect().height);
				this.currY = this.axes[1].max-this.currY;
			
				this.ctx.beginPath();
				this.ctx.fillStyle = "#8c8c8c";
				this.ctx.fillRect(0,0,this.resizeNum[0],this.resizeNum[1]);
				this.ctx.fillStyle = "#d6d6d6";
				this.ctx.fillRect(this.resizeNum[0]/8,this.resizeNum[1]/8,this.resizeNum[0]*3/4,this.resizeNum[1]*3/4);
				this.ctx.closePath();
				this.ctx.beginPath();
				this.ctx.fillStyle = "#ff0000";
				this.ctx.arc(this.axes[0].machinePosition*(this.canvas.getBoundingClientRect().width/this.axes[0].max),(this.axes[1].max-this.axes[1].machinePosition)*(this.canvas.getBoundingClientRect().height/this.axes[1].max),8,0,Math.PI*2,true);
				this.ctx.fill();
				this.ctx.closePath();
				this.ctx.beginPath();
				this.ctx.fillStyle = "#3370d4";
				this.ctx.arc(this.tempX,this.tempY,8,0,Math.PI*2,true);
				this.ctx.fill();
				this.refreshBed = false;
			}
		},
		async moveMachine(e) {
			if (this.clickerEnabled) {
				if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
					this.sendCode('echo "One or more axes are not homed! Please home axes before moving."');
					return;
				}

				var xPos = this.canvas.getBoundingClientRect().left;
				var yPos = this.canvas.getBoundingClientRect().top;
				this.tempX = e.clientX-xPos;
				this.tempY = e.clientY-yPos;
				this.pos = [this.axes[0].max*(this.tempX/this.canvas.getBoundingClientRect().width), this.axes[1].max-this.axes[1].max*(this.tempY/this.canvas.getBoundingClientRect().height)];

				if (this.pos[0] > this.axes[0].max || this.pos[0] < this.axes[0].min || this.pos[1] > this.axes[1].max || this.pos[1] < this.axes[1].min) {
					this.sendCode('echo "Travel beyond machine limits!!!"');
					return;
				}

				if (this.axes[2].machinePosition < 0) {
					await this.sendCode("M42 P4 S0");
					await this.sendCode("G1 Z0 F4000");
				}
				await this.sendCode("M42 P4 S0");
				var codetosend = "G1 X"+this.pos[0]+" Y"+this.pos[1]+"F6000";
				this.codeReply = await this.sendCode(codetosend);
				await this.sendCode("M400");
				await this.sendCode("M42 P4 S1");
				
				this.ctx.beginPath();
				this.ctx.fillStyle = "#8c8c8c";
				this.ctx.fillRect(0,0,this.resizeNum[0],this.resizeNum[1]);
				this.ctx.fillStyle = "#d6d6d6";
				this.ctx.fillRect(this.resizeNum[0]/8,this.resizeNum[1]/8,this.resizeNum[0]*3/4,this.resizeNum[1]*3/4);
				this.ctx.beginPath();
				this.ctx.fillStyle = "#ff0000";
				this.ctx.arc(this.axes[0].machinePosition*(this.canvas.getBoundingClientRect().width/this.axes[0].max),(this.axes[1].max-this.axes[1].machinePosition)*(this.canvas.getBoundingClientRect().height/this.axes[1].max),8,0,Math.PI*2,true);
				this.ctx.closePath();
				this.ctx.fill();
				this.ctx.beginPath();
				this.ctx.arc(this.tempX, this.tempY, 8,0,Math.PI*2,true);
				this.ctx.closePath();
				this.ctx.fill();
				this.ctx.fillStyle = "#ff0000";

				this.refreshBed = true;
			}
		},*/
		async homing(axis) {
			if (axis == "all") {
				this.codeReply = this.sendCode('M98 P"homeall.g"');
				setTimeout(() => {
					var homed = document.getElementById("homedCard");
					if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
						return;
					}
					homed.style.display = "none";
				}, 400);
			}
			else if (axis == "x") {
				await this.sendCode('M98 p"homez.g"');
				this.codeReply = this.sendCode('M98 P"homex.g"');
				setTimeout(() => {
					var homed = document.getElementById("homedCard");
					if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
						return;
					}
					homed.style.display = "none";
				}, 400);
			}
			else if (axis == "y") {
				await this.sendCode('M98 p"homez.g"');
				this.codeReply = this.sendCode('M98 P"homey.g"');
				setTimeout(() => {
					var homed = document.getElementById("homedCard");
					if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
						return;
					}
					homed.style.display = "none";
				}, 400);
			}
			else if (axis == "z") {
				this.codeReply = this.sendCode('M98 P"homez.g"');
				setTimeout(() => {
					var homed = document.getElementById("homedCard");
					if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
						return;
					}
					homed.style.display = "none";
				}, 400);
			}
		},/*
		renderBed() {
			if (this.status == "idle" && this.clickerEnabled && !this.refreshBed) {
				return;
			}
			else if (this.status == "idle" || this.status == "busy") {
				this.ctx.beginPath();
				this.ctx.fillStyle = "#8c8c8c";
				this.ctx.fillRect(0,0,this.resizeNum[0],this.resizeNum[1]);
				this.ctx.fillStyle = "#d6d6d6";
				this.ctx.fillRect(this.resizeNum[0]/8,this.resizeNum[1]/8,this.resizeNum[0]*3/4,this.resizeNum[1]*3/4);
				this.ctx.beginPath();
				this.ctx.fillStyle = "#ff0000";
				this.ctx.arc(this.axes[0].machinePosition*(this.canvas.getBoundingClientRect().width/this.axes[0].max),(this.axes[1].max-this.axes[1].machinePosition)*(this.canvas.getBoundingClientRect().height/this.axes[1].max),8,0,Math.PI*2,true);
				this.ctx.closePath();
				this.ctx.fill();
			}
			else if (this.status == "processing" || this.status == "pausing" || this.status == "paused" || this.status == "resuming" || this.status == "halted") {
				this.ctx.beginPath();
				this.ctx.fillStyle = "#8c8c8c";
				this.ctx.fillRect(0,0,this.resizeNum[0],this.resizeNum[1]);
				this.ctx.fillStyle = "#d6d6d6";
				this.ctx.fillRect(this.resizeNum[0]/8,this.resizeNum[1]/8,this.resizeNum[0]*3/4,this.resizeNum[1]*3/4);
				this.ctx.beginPath();
				this.ctx.fillStyle = "#ff0000";
				this.ctx.arc((this.axes[0].machinePosition+this.global["placeX"])*(this.canvas.getBoundingClientRect().width/this.axes[0].max),(this.axes[1].max-(this.axes[1].machinePosition+this.global["placeX"]))*(this.canvas.getBoundingClientRect().height/this.axes[1].max),8,0,Math.PI*2,true);
				this.ctx.closePath();
				this.ctx.fill();
			}
		},
		async startRendering() {
			this.resize();
			this.canvas = document.getElementById('canvas')
			this.ctx = this.canvas.getContext('2d');
			this.rendering = setInterval(this.renderBed, 300);
		},*/
		async idleMode() {
			this.idlePurging = true;
			if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
				this.sendCode('echo "One or more axes are not homed! Please home axes before moving."');
				return;
			}
			if (this.axes[2].machinePosition != 0) {
				await this.sendCode("M42 P4 S0");
				await this.sendCode("G1 Z0 F4000");
			}
			await this.sendCode("M42 P4 S0");
			await this.sendCode('G1 X{global.purgeX} Y{global.purgeY} F6000');
			await this.sendCode('G1 Z{global.purgeZ} F4000');
			await this.sendCode('M400');
			this.interval = setInterval(this.purge, this.time*60000);
		},
		async stopIdleMode() {
			clearInterval(this.interval);
			this.idlePurging = false;
			await this.sendCode("M400");
			await this.sendCode("M42 P4 S1");
		},
		async refreshPurge() {
			if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
				this.sendCode('echo "One or more axes are not homed! Please home axes before moving."');
				return;
			}
			if (this.axes[0].machinePosition != this.global["purgeX"] || this.axes[1].machinePosition != this.global["purgeY"]) {
				await this.sendCode("M42 P4 S0");
				await this.sendCode("G1 Z0 F4000");
				await this.sendCode("G1 X{global.purgeX} Y{global.purgeY} F6000");
				await this.sendCode("G1 Z{global.purgeZ} F4000");
			}
			else if (this.axes[2].machinePosition != this.global["purgeZ"]) {
				await this.sendCode("M42 P4 S0");
				await this.sendCode("G1 Z{global.purgeZ} F4000");
			}
			await this.sendCode("M42 P4 S0");
			await this.sendCode('M400');
			await this.purge();
			await this.sendCode("M400");
			await this.sendCode("M42 P4 S1");
		},
		/*makeExtrusionString(extFactor) {				// possibly of use later if we reconfigure the way the additive pumps are set up
			var template = 0;
			var ratios = [0,0];
			for (let i=0; i<this.adds.length; i++) {
				if (this.adds[i][1]) {
					template = i;
				}
			}
			for (let i=0; i<=template; i++) {
				ratios.push(this.adds[i][2]);
			}
			var tempRat = parseFloat(this.ratio);
			var a = (1-this.totAdditive) * (tempRat/(tempRat+1));
			var b = (1-this.totAdditive) / (tempRat+1);
			ratios[0] = a;
			ratios[1] = b;
			var extString = "E" + String(ratios[0] * extFactor) + ":";
			for (let i=1; i<(ratios.length - 1); i++) {
				extString = extString + String(ratios[i] * extFactor) + ":";
			}
			extString = extString + (ratios[ratios.length - 1] * extFactor);
			console.log(extString);
			return extString;
		},*/
		makeExtrusionString(extFactor) {
			var ratios = [0,0,0,0];
			var tempRat = parseFloat(this.ratio);
			/*if (this.adds[1][1]) {
				var exA = tempRat / (tempRat + (this.totAdditive * (1 + tempRat)) + 1);
				var exB = 1 / (tempRat + (this.totAdditive * (1 + tempRat)) + 1);
				ratios[0] = exA;
				ratios[1] = exB;
				ratios.push(this.adds[0][2]/(this.totAdditive + 1));
				ratios.push(this.adds[1][2]/(this.totAdditive + 1));
			}*/
			/*exA = tempRat / (tempRat + (this.totAdditive * (1 + tempRat)) + 1);
			exB = 1 / (tempRat + (this.totAdditive * (1 + tempRat)) + 1);
			ratios[0] = exA;
			ratios[1] = exB;
			ratios.push(this.adds[0][2]/(this.totAdditive + 1));*/
			var exA = tempRat / (tempRat + 1);
			if (this.adds[0][1]) {
				var exC = exA * this.adds[0][2]
			}
			else {
				exC = 0;
			}
			var exB = (1 - exA);
			if (this.adds[1][1]) {
				var exD = exB * this.adds[1][2];
			}
			else {
				exD = 0;
			}
			ratios[0] = exA;
			ratios[1] = exB;
			ratios[2] = exC;
			ratios[3] = exD;
			var extString = "E" + String(ratios[0] * extFactor) + ":";
			for (let i=1; i<(ratios.length - 1); i++) {
				if (i > 1) {
					extString = extString + String(ratios[i] * extFactor) + ":";
				}
				else {
					extString = extString + String(ratios[i] * extFactor) + ":";
				}
			}
			if (ratios.length > 2) {
				extString = extString + (ratios[ratios.length - 1] * extFactor);
			}
			else {
				extString = extString + (ratios[ratios.length - 1] * extFactor);
			}
			return extString;
		},
		printString() {
			console.log(this.makeExtrusionString(300));
		},
		async fullPurge() {
			if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
				this.sendCode('echo "One or more axes are not homed! Please home axes before moving."');
				return;
			}
			if (this.axes[0].machinePosition != this.global["purgeX"] || this.axes[1].machinePosition != this.global["purgeY"]) {
				await this.sendCode("M42 P4 S0");
				await this.sendCode("G1 Z0 F4000");
				await this.sendCode("G1 X{global.purgeX} Y{global.purgeY} F6000");
				await this.sendCode("G1 Z{global.purgeZ} F4000");
			}
			else if (this.axes[2].machinePosition != -90) {
				await this.sendCode("M42 P4 S0");
				await this.sendCode("G1 Z{global.purgeZ} F4000");
			}
			await this.sendCode("M42 P4 S0");
			await this.sendCode('M400');
			await this.sendCode('M42 P3 S1');
			await this.sendCode('T0');
			await this.sendCode('M83');
			var tempRat = parseFloat(this.ratio);
			/*if (this.needle == 0.25) {
				var aS = -1*(3 * (tempRat/(tempRat+1)));
				var bS = -1*(3 / (tempRat+1));
				if (tempRat != 1) {									// these will have to be changed at some point to account for C pump
					await this.sendCode("G1 E80:80");
				}
				await this.sendCode("G1 "+this.makeExtrusionString(350));
				await this.sendCode("G1 E"+String(aS)+":"+String(bS));
			}*/
			var aS = -1*(3 * (tempRat/(tempRat+1)));
			var bS = -1*(3 / (tempRat+1));
			if (tempRat != 1) {
				if (this.adds[0][1]) {			// change here if we add more additive pumps
					var a2perc = this.adds[0][2];
					var a2 = 80 * a2perc;
				}
				else {
					a2 = 0;
				}
				if (this.adds[1][1]) {
					var b2perc = this.adds[1][2]
					var b2 = 80 * b2perc;
				}
				else {
					b2 = 0;
				}
				var purgeRatio = "80:" + String(a2) + ":80:" + String(b2);
				await this.sendCode("G1 E" + purgeRatio);
				await this.purge();
			}
			else {
				await this.sendCode("G1 "+this.makeExtrusionString(350));
				await this.sendCode("G1 E"+String(aS)+":"+String(bS));
			}
			await this.sendCode("M400");
			await this.sendCode("M42 P3 S0");
			await this.sendCode("M42 P4 S1");
		},
		async sneezePurge() {
			if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
				this.sendCode('echo "One or more axes are not homed! Please home axes before moving."');
				return;
			}
			await this.sendCode('T0');
			await this.sendCode('M83');
			await this.sendCode('M400');
			await this.sendCode("M42 P3 S1");
			await this.sendCode("G1 E2:2");
			await this.sendCode("M400");
			await this.sendCode("M42 P3 S0");
		},
		async purge() {
			if (this.axes[0].machinePosition != this.global["purgeX"] || this.axes[1].machinePosition != this.global["purgeY"] || this.axes[2].machinePosition != this.global["purgeZ"]) {
				await this.stopIdleMode();
				return;
			}
			await this.sendCode('T0');
			await this.sendCode('M83');
			await this.sendCode("M42 P3 S1");
			var tempRat = parseFloat(this.ratio);
			if (this.needle == 0.25) {
				var aS = -1*(3 * (tempRat/(tempRat+1)));
				var bS = -1*(3 / (tempRat+1));
				await this.sendCode("G1 "+this.makeExtrusionString(100));
				await this.sendCode("G1 E"+String(aS)+":"+String(bS));
			}
			else if (this.needle == 0.5) {
				aS = -1*(3 * (tempRat/(tempRat+1)));
				bS = -1*(3 / (tempRat+1));
				console.log(this.makeExtrusionString(160));
				await this.sendCode("G1 "+this.makeExtrusionString(160));
				await this.sendCode("G1 E"+String(aS)+":"+String(bS));
			}
			await this.sendCode("M400");
			await this.sendCode("M42 P3 S0");
		},
		async cleanPurging() {
			if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
				this.sendCode('echo "One or more axes are not homed! Please home axes before moving."');
				return;
			}
			else {
				await this.sendCode('M98 P"cleanpurge.g"');
			}
		},
		async airPressure() {
			if (!this.air) {
				await this.sendCode('M42 P3 S1');
			}
			else {
				await this.sendCode('M42 P3 S0');
			}
		},
		async goTo() {
			if (this.xInp || this.yInp) {
				if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
					this.sendCode('echo "One or more axes are not homed! Please home axes before moving."');
					var x = document.getElementById("xx");
					var y = document.getElementById("yy");
					x.value = undefined;
					y.value = undefined;
					this.xInp = undefined;
					this.yInp = undefined;
					return;
				}
				if ((this.xInp != undefined && (this.xInp > this.axes[0].max || this.xInp < this.axes[0].min)) || (this.yInp != undefined && (this.yInp > this.axes[1].max || this.yInp < this.axes[1].min))) {
					this.sendCode('echo "Travel beyond machine limits!!!"');
					x = document.getElementById("xx");
					y = document.getElementById("yy");
					x.value = undefined;
					y.value = undefined;
					this.xInp = undefined;
					this.yInp = undefined;
					return;
				}
				if (this.axes[2].machinePosition < 0) {
					await this.sendCode("M42 P4 S0");
					await this.sendCode("G1 Z0 F4000");
				}
				if (this.xInp != this.axes[0].machinePosition && this.yInp != this.axes[1].machinePosition) {
					if (this.yInp == undefined) {
						await this.sendCode("M42 P4 S0");
						await this.sendCode("G1 X"+this.xInp+"F6000");
					}
					else if (this.xInp == undefined) {
						await this.sendCode("M42 P4 S0");
						await this.sendCode("G1 Y"+this.yInp+"F6000");
					}
					else {
						await this.sendCode("M42 P4 S0");
						await this.sendCode("G1 X"+this.xInp+" Y"+this.yInp+"F6000");
					}
				}
				else if (this.xInp != this.axes[0].machinePosition && this.xInp != undefined) {
					await this.sendCode("M42 P4 S0");
					await this.sendCode("G1 X"+this.xInp+"F6000");
				}
				else if (this.yInp != this.axes[1].machinePosition && this.yInp != undefined) {
					await this.sendCode("M42 P4 S0");
					await this.sendCode("G1 Y"+this.yInp+"F6000");
				}
				await this.sendCode("M400");
				await this.sendCode("M42 P4 S1");
			}/*
			setTimeout(() => {
				this.renderBed();
				x = document.getElementById("xx");
				y = document.getElementById("yy");
				x.value = undefined;
				y.value = undefined;
				this.xInp = undefined;
				this.yInp = undefined;
			}, 1500);*/
		},
		async zGoTo() {
			if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
				this.sendCode('echo "One or more axes are not homed! Please home axes before moving."');
				var z = document.getElementById("zz");
				z.value = undefined;
				this.zInp = undefined;
				return;
			}
			if (this.zInp > this.axes[2].max || this.zInp < this.axes[2].min) {
				this.sendCode('echo "Travel beyond machine limits!!!')
				z = document.getElementById("zz");
				z.value = undefined;
				this.zInp = undefined;
				return;
			}
			await this.sendCode("M42 P4 S0");
			await this.sendCode("G1 Z"+this.zInp);
			z = document.getElementById("zz");
			z.value = undefined;
			this.zInp = undefined;
			await this.sendCode("M400");
			await this.sendCode("M42 P4 S1");
		},
		async setupLoc() {
			if ((!this.axes[0].homed) || (!this.axes[1].homed) || (!this.axes[2].homed)) {
				this.sendCode('echo "One or more axes are not homed! Please home axes before moving."');
				return;
			}
			if (this.axes[0].machinePosition != this.global["purgeX"] || this.axes[1].machinePosition != this.global["purgeY"]) {
				await this.sendCode("M42 P4 S0");
				await this.sendCode("G1 Z0 F4000");
				await this.sendCode("G1 X{global.purgeX} Y{global.purgeY} F6000");
				await this.sendCode("G1 Z{global.purgeZ} F4000");
			}
			else if (this.axes[2].machinePosition != this.global["purgeZ"]) {
				await this.sendCode("M42 P4 S0");
				await this.sendCode("G1 Z{global.purgeZ} F4000");
			}
			await this.sendCode("M400");
			await this.sendCode("M42 P4 S1");
		},
		async sendTheCode(codetosend, amount, axis) {
			if (!this.axes[axis].homed) {
				this.sendCode('echo "Axis not homed! Please home axis before moving."');
				return;
			}
			if (this.axes[axis].machinePosition+amount>this.axes[axis].max || this.axes[axis].machinePosition+amount<this.axes[axis].min) {
				this.sendCode('echo "Too far!!!"');
				return;
			}
			while (this.started == true && this.codeIdle == true) {
				try {
					this.codeIdle = false;
					await this.sendCode("M42 P4 S0");
					this.codeReply = await this.sendCode(codetosend+String(this.axes[axis].machinePosition+amount));
					await this.sendCode("M400");
					await this.sendCode("M42 P4 S1");
					setTimeout(() => {
						//this.renderBed();
						this.codeIdle = true;
					}, 400);
				}
				catch(e) {
					console.warn(e);
				}
			}
		},
		async refresh() {
			if (!this.isConnected) {
				this.ready = false;
				this.errorMessage = null;
				this.selectedFile = null;
				this.files = [];
				return;
			}

			if (this.loading) {
				// Don't do multiple actions at once
				return;
			}
		},
	},
	activated() {
		this.isActive = true;
		this.resize();
		//this.hideCodeReplyNotifications();
	},
	deactivate() {
		this.isActive = false;
		this.showCodeReplyNotifications();
	},
	/*created() {

	},*/
	async mounted() {
		if (this.isConnected) {
			this.refresh();
		}
		await this.resize();
		this.showCodeReplyNotifications();
		//window.addEventListener("load", this.startRendering());
		window.addEventListener("keydown", (e) => {
			var key = e.code;
			switch (key) {
				case "ArrowLeft":	//left
					if (String(document.activeElement) == "[object HTMLInputElement]") {
						break;
					}
					else if (this.status != "idle") {
						break;
					}
					else {
						this.started = true;
						this.sendTheCode("G1 X", -10, 0);
						this.started = false;
						e.preventDefault();
						break;
					}
				case "ArrowUp":	//up
					if (String(document.activeElement) == "[object HTMLInputElement]") {
						break;
					}
					else if (this.status != "idle") {
						break;
					}
					else {
						this.started = true;
						this.sendTheCode("G1 Y", 10, 1);
						this.started = false;
						e.preventDefault();
						break;
					}
				case "ArrowRight":	//right
					if (String(document.activeElement) == "[object HTMLInputElement]") {
						break;
					}
					else if (this.status != "idle") {
						break;
					}
					else{
						this.started = true;
						this.sendTheCode("G1 X", 10, 0);
						this.started = false;
						e.preventDefault();
						break;
					}
				case "ArrowDown":	//down
					if (String(document.activeElement) == "[object HTMLInputElement]") {
						break;
					}
					else if (this.status != "idle") {
						break;
					}
					else {
						this.started = true;
						this.sendTheCode("G1 Y", -10, 1);
						this.started = false;
						e.preventDefault();
						break;
					}
				case "PageUp":	//pageup
					if (String(document.activeElement) == "[object HTMLInputElement]") {
						break;
					}
					else if (this.status != "idle") {
						break;
					}
					else {
						this.started = true;
						this.sendTheCode("G1 Z", 10, 2);
						this.started = false;
						e.preventDefault();
						break;
					}
				case "PageDown":	//pagedown
					if (String(document.activeElement) == "[object HTMLInputElement]") {
						break;
					}
					else if (this.status != "idle") {
						break;
					}
					else {
						this.started = true;
						this.sendTheCode("G1 Z", -10, 2);
						this.started = false;
						e.preventDefault();
						break;
					}
				}
			});
		this.ready = true;
	},
	watch: {	},
};

</script>
