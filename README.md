# CMCIC

## How-to use

```JavaScript
var cmcic = require('cmcic');

var tpe = new cmcic.tpe({
	CMCIC_TPE: 'tpeid',
	CMCIC_CODESOCIETE: 'societykey',
	CMCIC_CLE: '1234567890abcdef',
	CMCIC_BANK: 'CIC',
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

var trans = new cmcic.transaction(tpe, t);

// if you use expressjs

res.send(trans.form('paimentid', true));

```
