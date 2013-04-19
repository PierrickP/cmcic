var cmcic = require('../lib/cmcic'),
vows = require('vows'),
assert = require('assert');

vows.describe('Simple test').addBatch({
	'create tpe': {
		topic: new cmcic.tpe({
			CMCIC_TPE: '1234567',
			CMCIC_CODESOCIETE: 'societykey',
			CMCIC_CLE: '1234567890abcdef',
			CMCIC_BANK: 'CIC',
			CMCIC_VERSION: '3.0',
			CMCIC_LNG: 'FR',
			CMCIC_CURRENCY: 'EUR',
			CMCIC_URL_RETOUR: '/url/return',
			CMCIC_URLOK: '/url/ok',
			CMCIC_URLKO: '/url/ko'
		}),
		'tpe': function (tpe) {
			assert.equal(tpe._tpe.CMCIC_TPE, '1234567');
		},
		'urlok': function (tpe) {
			assert.equal(tpe._tpe.CMCIC_URLOK, '/url/ok');
		},
		'set url': function (tpe) {
			tpe.set('CMCIC_URLOK', '/url/newok');
			assert.equal(tpe._tpe.CMCIC_URLOK, '/url/newok');
		},
		'get url': function (tpe) {
			var get = tpe.get('CMCIC_URLKO');
			assert.equal(get, '/url/ko');
		}
	},
	'create transaction': {
		topic: function () {
			var tpe = new cmcic.tpe({
				CMCIC_TPE: '1234567',
				CMCIC_CODESOCIETE: 'societykey',
				CMCIC_CLE: '1234567890abcdef',
				CMCIC_BANK: 'CIC',
				CMCIC_VERSION: '3.0',
				CMCIC_LNG: 'FR',
				CMCIC_CURRENCY: 'EUR',
				CMCIC_URL_RETOUR: '/url/return',
				CMCIC_URLOK: '/url/ok',
				CMCIC_URLKO: '/url/ko'
			});
			var t = {
				email: 'exemple@exemple.fr',
				amount: 300,
				reference: 'qwerty'
			};
			return new cmcic.transaction(tpe, t);
		},
		'amount': function (trans) {
			assert.equal(trans._data.amount, 300);
		}
	},
	'form transaction': {
		topic: function () {
			var tpe = new cmcic.tpe({
				CMCIC_TPE: '1234567',
				CMCIC_CODESOCIETE: 'societykey',
				CMCIC_CLE: '1234567890abcdef',
				CMCIC_BANK: 'CIC',
				CMCIC_VERSION: '3.0',
				CMCIC_LNG: 'FR',
				CMCIC_CURRENCY: 'EUR',
				CMCIC_URL_RETOUR: '/url/return',
				CMCIC_URLOK: '/url/ok',
				CMCIC_URLKO: '/url/ko'
			});
			var trans = new cmcic.transaction(tpe, {
				email: 'exemple@exemple.fr',
				amount: 300,
				reference: 'qwerty'
			});
			return trans.form('IDISH', false);
		},
		'id': function (form) {
			var id = form.match(/<form method="post" id="(\w*)"/);
			assert.equal(id[1], 'IDISH');
		},
		'amount': function (form) {
			var amount = form.match(/<input type="hidden" name="montant" value="(\w*)">/);
			assert.equal(amount[1], '300EUR');
		}
	}
}).run();
