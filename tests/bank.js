var cmcic = require('../lib/cmcic'),
should = require('should');

describe('bank validation', function () {

	describe('checkTransactionReturn', function () {
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
			amount: 30,
			reference: 'qwerty',
			date: '24/12/2042 23:42:42',
			'texteLibre': {
				plop: 42
			}
		});

		var bankData = {
			TPE: '1234567',
			date: '16/04/2013_a_17:42:40',
			montant: '30EUR',
			reference: '3a568de943f297',
			MAC: '381CD730CBB2091A2F2B9E95211C4EE68DDCBA55',
			'texte-libre': 'eyJwbG9wIjo0Mn0=',
			'code-retour': 'payetest',
			cvx: 'oui',
			vld: '1219',
			brand: 'na',
			status3ds: 3,
			numauto: '000000',
			originecb: '00x',
			bincb: '000001',
			hpancb: '7E1E17F61E7C196ACFFF18F23F1DE41DF3B76125',
			ipclient: '78.192.176.23',
			originetr: 'FRA',
			veres: '',
			pares: ''
		};

		var ctr = tpe.checkTransactionReturn(bankData);

		it('Transaction MAC return should be right', function () {
			ctr.status.should.ok;
		});

		it('texte-libre should be JSON parsed', function () {
			JSON.stringify(ctr['texte-libre']).should.equal('{"plop":42}');
		});
	});
});
