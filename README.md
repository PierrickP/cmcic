# CMCIC

[![Build Status](https://travis-ci.org/PierrickP/cmcic.png?branch=master)](https://travis-ci.org/PierrickP/cmcic)
[![Coverage Status](https://coveralls.io/repos/PierrickP/cmcic/badge.png)](https://coveralls.io/r/PierrickP/cmcic)
[![Dependency Status](https://david-dm.org/PierrickP/cmcic.png)](https://david-dm.org/PierrickP/cmcic)
[![NPM version](https://badge.fury.io/js/cmcic.png)](http://badge.fury.io/js/cmcic)

[![NPM](https://nodei.co/npm/cmcic.png?downloads=true&stars=true)](https://npmjs.org/package/cmcic)

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

On your return url (still with expressjs)

```JavaScript
var ret = tpe.checkTransactionReturn((req.method == 'POST')? req.body : req.query);

if (!ret.isSealValidated) {
  console.log('MAC seal is invalid')
  return res.send(tpe.RETURN_NOTOK);
}

if (ret.status) {
  console.error('Payment is ok');
  res.send(tpe.RETURN_OK);
} else {
  console.error('Payment is fail : ', ret.motifrefus );
  res.send(tpe.RETURN_OK);
}
```

# Official documentation

[https://www.monetico-paiement.fr/fr/info/documentations/Monetico_Paiement_documentation_technique_v1_0c.pdf](https://www.monetico-paiement.fr/fr/info/documentations/Monetico_Paiement_documentation_technique_v1_0c.pdf)

# Tips

For handle different kind of payment with the same TPE, you can use the 'texte-libre' field !
You can use 'texte-libre' field like an object, it ll be *stringified*/*parsed* for you.

# Coding Style

* tabulation (4 width)
* JsHint


# TODO

https://github.com/PierrickP/cmcic/issues?labels=new-feature&page=1&state=open

# License

Under [MIT license](LICENSE.md), feel free to contribuate with fork and PR !
