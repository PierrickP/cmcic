var crypto = require('crypto'),
_ = require('underscore');

var banks = {
  'CIC': 'https://ssl.paiement.cic-banques.fr',
  'CM': 'https://paiement.creditmutuel.fr',
  'OBC': 'https://ssl.paiement.banque-obc.fr'
};

var CMCIC = function () {};

CMCIC.calculateMAC = function (data, key) {
  var key = CMCIC.getHashKey(key);
  key = new Buffer(key, 'ascii');
  return crypto.createHmac('sha1', key).update(data).digest('hex');
};

CMCIC.getHashKey = function (key) {
  var hexStrkey = key.slice(0, 38),
  hexFinal = '' + key.slice(38) + '00',
  cca0 = hexFinal.charCodeAt(0);

  if (cca0  > 70 && cca0 < 97){
    hexStrkey += String.fromCharCode(cca0-23) + hexFinal.charAt(1);
  } else {
    if (hexFinal.charAt(1) == 'M'){
      hexStrkey += hexFinal.charAt(0) + '0';
    } else {
      hexStrkey += hexFinal.slice(0, 2);
    }
  }

  var r = '';
  for (var i = 0; i < hexStrkey.length / 2; i++) {
    var hex = hexStrkey[i*2] + hexStrkey[i*2 + 1];
    var hexPack = parseInt(hex, 16);
    r +=  String.fromCharCode(hexPack);
  }
  return r;
};

/**
* TPE method
*/

CMCIC.tpe = function (config) {
  this._tpe = {};
  this.RETURN_OK = 'version=2\ncdr=0\n';
  this.RETURN_NOTOK = 'version=2\ncdr=1\n';

  this.init(config);
};

CMCIC.tpe.prototype.init = function (config) {
  this._tpe = {
    CMCIC_TPE: '',
    CMCIC_CODESOCIETE: '',
    CMCIC_CLE: '',
    CMCIC_BANK: 'CIC',
    CMCIC_VERSION: '3.0',
    CMCIC_LNG: 'FR',
    CMCIC_CURRENCY: 'EUR',
    CMCIC_SERVEUR: 'https://ssl.paiement.cic-banques.fr',
    CMCIC_URL_RETOUR: "",
    CMCIC_URLOK: "",
    CMCIC_URLKO: "",
    test: false
  };
  this._postOptions = {
    host:'',
    path: '',
    method: 'POST'
  };
  if (config) {
    _.extend(this._tpe, config);
  }
  this._setServer(this._tpe.CMCIC_BANK);
};

CMCIC.tpe.prototype.configure = function (cmcic) {
  if (cmcic) {
    _.extend(this._tpe, cmcic);
  }
  this._setServer(this._tpe.CMCIC_BANK);
};

CMCIC.tpe.prototype._setServer = function (bankName) {
  var server = banks[bankName];
  this._postOptions.host = server.replace('https://', '');
  if (this._tpe.test) {
    server += '/test';
    this._postOptions.path = '/test/paiement.cgi';
  }
  if (!this._tpe.test) {
    this._postOptions.path = '/paiement.cgi';
  }
  server += '/paiement.cgi';
  this._tpe.CMCIC_SERVEUR = server;
};

CMCIC.tpe.prototype.checkTransactionReturn = function (transactionData) {
  if (!transactionData.motifrefus) {
    transactionData.motifrefus = '';
  }
  var data =  transactionData.TPE +
    '*' + transactionData.date +
    '*' + transactionData.montant +
    '*' + transactionData.reference +
    '*' + transactionData['texte-libre'] +
    '*' + this._tpe.CMCIC_VERSION +
    '*' + transactionData['code-retour'] +
    '*' + transactionData.cvx +
    '*' + transactionData.vld +
    '*' + transactionData.brand +
    '*' + transactionData.status3ds +
    '*' + (transactionData.numauto || '') +
    '*' + transactionData.motifrefus +
    '*' + transactionData.originecb +
    '*' + transactionData.bincb +
    '*' + transactionData.hpancb +
    '*' + transactionData.ipclient +
    '*' + transactionData.originetr +
    '*' + transactionData.veres +
    '*' + transactionData.pares +
    '*';
  var mac = CMCIC.calculateMAC(data, this._tpe.CMCIC_CLE);
  var isSealValidated = mac.toUpperCase() === transactionData.MAC.toUpperCase();
  if (transactionData['code-retour'] === 'paiement' ||  transactionData['code-retour'] === 'payetest') {
    return {
      'status': true,
      'isSealValidated': isSealValidated,
      'date': transactionData.date,
      'TPE' : transactionData.TPE,
      'montant': transactionData.montant,
      'reference': transactionData.reference,
      'texte-libre': JSON.parse(new Buffer(transactionData['texte-libre'], 'base64').toString('ascii')),
      'code-retour': transactionData['code-retour'],
      'cvx': transactionData.cvx,
      'vld': transactionData.vld,
      'brand': transactionData.brand,
      'status3ds': transactionData.status3ds,
      'numauto': transactionData.numauto,
      'originecb': transactionData.originecb,
      'bincb': transactionData.bincb,
      'hpancb': transactionData.hpancb,
      'ipclient': transactionData.ipclient,
      'oririnetr': transactionData.originetr,
      'veres': transactionData.veres,
      'pares': transactionData.pares,
      'montantech': transactionData.montantech,
      'cbenregistree': transactionData.cbenregistree,
      'cbmasquee': transactionData.cbmasquee
    };
  } else {
    return {
      'status': false,
      'isSealValidated': isSealValidated,
      'date': transactionData.date,
      'TPE' : transactionData.TPE,
      'montant': transactionData.montant,
      'reference': transactionData.reference,
      'texte-libre': JSON.parse(new Buffer(transactionData['texte-libre'], 'base64').toString('ascii')),
      'code-retour': transactionData['code-retour'],
      'cvx': transactionData.cvx,
      'vld': transactionData.vld,
      'brand': transactionData.brand,
      'status3ds': transactionData.status3ds,
      'numauto': transactionData.numauto,
      'motifrefus': transactionData.motifrefus,
      'originecb': transactionData.originecb,
      'bincb': transactionData.bincb,
      'hpancb': transactionData.hpancb,
      'ipclient': transactionData.ipclient,
      'oririnetr': transactionData.originetr,
      'veres': transactionData.veres,
      'pares': transactionData.pares,
      'montantech': transactionData.montantech,
      'filtragecause': transactionData.filtragecause,
      'filtragevaleur': transactionData.filtragevaleur,
      'cbenregistree': transactionData.cbenregistree,
      'cbmasquee': transactionData.cbmasquee
    };
  }
};

CMCIC.tpe.prototype.set = function (key, value) {
  var set = {};
  set[key] = value;
  this.configure(set);
  return this._tpe[key];
};

CMCIC.tpe.prototype.get = function (key) {
  return this._tpe[key];
};

/**
* Transation method
*/

CMCIC.transaction = function (tpe, transactionData) {
  this._tpe = tpe;
  this._data = {};
  this.init(transactionData);
};

CMCIC.transaction.prototype.init = function (transactionData) {
  this._data = {
    date: '',
    amount: '',
    reference: '',
    texteLibre: {},
    email: '',
    NbrEch: '',
    DateEcheance1: '',
    MontantEcheance1: '',
    DateEcheance2: '',
    MontantEcheance2: '',
    DateEcheance3: '',
    MontantEcheance3: '',
    DateEcheance4: '',
    MontantEcheance4: '',
    options: ''
  };
  _.extend(this._data, transactionData);
};

CMCIC.transaction.prototype.dataToSend = function (data) {
  if (!data) {
    data = this._data;
  }
  return this._tpe._tpe.CMCIC_TPE +
    '*' + data.date +
    '*' + data.amount + this._tpe._tpe.CMCIC_CURRENCY +
    '*' + data.reference +
    '*' + data.texteLibre +
    '*' + this._tpe._tpe.CMCIC_VERSION +
    '*' + this._tpe._tpe.CMCIC_LNG +
    '*' + this._tpe._tpe.CMCIC_CODESOCIETE +
    '*' + data.email +
    '*' + data.NbrEch +
    '*' + data.DateEcheance1 +
    '*' + data.MontantEcheance1 +
    '*' + data.DateEcheance2 +
    '*' + data.MontantEcheance2 +
    '*' + data.DateEcheance3 +
    '*' + data.MontantEcheance3 +
    '*' + data.DateEcheance4 +
    '*' + data.MontantEcheance4 +
    '*' + data.options;
};

CMCIC.transaction.prototype._getDate = function () {
  var d = new Date();

  var day = (d.getDate() < 10) ? '0' + d.getDate() : d.getDate();
  var month = ( (d.getMonth() + 1) < 10) ? '0'+(d.getMonth()+1) : d.getMonth()+1;
  var year = d.getFullYear();
  var hour = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
  var minute = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
  var second = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds();
  if (this._data.date === '') {
    this._data.date = day + '/' + month + '/' + year + ':' + hour + ':' + minute + ':' + second;
  }
};

CMCIC.transaction.prototype.form = function (id, autosubmit) {
  this._getDate();
  this._data.texteLibre = new Buffer(JSON.stringify(this._data.texteLibre)).toString('base64');
  var mac = CMCIC.calculateMAC(this.dataToSend(), this._tpe._tpe.CMCIC_CLE),
  result = '<form method="post" id="'  +  id  +  '" action="'  +  this._tpe._tpe.CMCIC_SERVEUR  +  '">'  +
    '<input type="hidden" name="version" value="'  +  this._tpe._tpe.CMCIC_VERSION  +  '">'  +
    '<input type="hidden" name="TPE" value="' + this._tpe._tpe.CMCIC_TPE + '">' +
    '<input type="hidden" name="MAC" value="' + mac + '">' +
    '<input type="hidden" name="url_retour" value="' + this._tpe._tpe.CMCIC_URL_RETOUR + '">' +
    '<input type="hidden" name="url_retour_ok" value="' + this._tpe._tpe.CMCIC_URLOK + '">' +
    '<input type="hidden" name="url_retour_err" value="' + this._tpe._tpe.CMCIC_URLKO + '">' +
    '<input type="hidden" name="lgue" value="' + this._tpe._tpe.CMCIC_LNG + '">' +
    '<input type="hidden" name="societe" value="' + this._tpe._tpe.CMCIC_CODESOCIETE + '">' +
    '<input type="hidden" name="date" value="' + this._data.date + '">' +
    '<input type="hidden" name="montant" value="' + this._data.amount + this._tpe._tpe.CMCIC_CURRENCY + '">' +
    '<input type="hidden" name="reference" value="' + this._data.reference + '">' +
    '<input type="hidden" name="mail" value="' + this._data.email + '">' +
    '<input type="hidden" name="texte-libre" value="' + this._data.texteLibre + '">' +
    '<div class="submit">' +
    '<input type="submit" name="bouton" value="">' +
    '</div></form>';
  if (autosubmit === true) {
    result += '<script type="text/javascript">(function(){document.getElementById(\''+id+'\').submit();})();</script>';
  }
  return result;
};

module.exports = CMCIC;
