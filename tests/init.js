var cmcic = require('../lib/cmcic');

var tpe = new cmcic.tpe({
	CMCIC_TPE			: '1234567', // 7
	CMCIC_CODESOCIETE	: 'societykey', // 20
	CMCIC_CLE			: '1234567890abcdef',
	CMCIC_BANK			: 'CIC',
	CMCIC_VERSION		: '3.0',
	CMCIC_LNG			: 'FR',
	CMCIC_CURRENCY		: 'EUR',
	CMCIC_URL_RETOUR	: "/url/return",
	CMCIC_URLOK			: "/url/ok",
	CMCIC_URLKO			: "/url/ko"
});

var tpe2 = new cmcic.tpe({
	CMCIC_TPE: '7654321', // 7
	CMCIC_CODESOCIETE: 'societykey', // 20
	CMCIC_CLE: '1234567890abcdef',
	CMCIC_BANK: 'CIC',
	CMCIC_VERSION: '3.0',
	CMCIC_LNG: 'FR',
	CMCIC_CURRENCY: 'EUR',
	CMCIC_URL_RETOUR: "/url/return",
	CMCIC_URLOK: "/url/ok",
	CMCIC_URLKO: "/url/ko"
});

//console.log(tpe2);
//console.log(tpe);

var t = {
	date: "12/12/12",
	amount: "300EUR",
	reference: "qwerty"
};

var trans = new cmcic.transaction(tpe, t);

console.log(trans.form('MON_ID'));
