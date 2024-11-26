'use strict'

import { registerRoute } from '@/routes'

import RLP from './RLP.vue'

registerRoute(RLP, {
	Control: {
		RLP: {
			icon: 'mdi-arrow-all',
			caption: 'RLP',
			path: '/RLP'
		}
	}
});