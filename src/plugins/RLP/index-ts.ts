'use strict'

import { registerRoute } from '@/routes'

import RLP from './RLP.vue'

// Register a route via Plugins -> Input Shaping
registerRoute(RLP, {
	Plugins: {
		RLP: {
			icon: 'mdi-transition',
			caption: 'RLP',
			translated: true,
			path: '/RLP'
		}
	}
});
