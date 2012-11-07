var path = require('path'),
crypto = require('crypto'),
_ = require('underscore');

var banks = {
	"CIC": "https://ssl.paiement.cic-banques.fr",
	"CM" : "https://paiement.creditmutuel.fr",
	"OBC": "https://ssl.paiement.banque-obc.fr"
};

var CMCIC = function() {};

/**
* TPE method
*/

CMCIC.prototype.tpe = function(config) {
	var tpe = {};
	this.init(config);
};

CMCIC.prototype.tpe.prototype.init = function(config) {
	this.tpe = {
		CMCIC_TPE			: '',
		CMCIC_CODESOCIETE	: '',
		CMCIC_CLE			: '',
		CMCIC_BANK			: 'CIC',
		CMCIC_VERSION		: '3.0',
		CMCIC_LNG			: 'FR',
		CMCIC_CURRENCY		: 'EUR',
		CMCIC_SERVEUR		: 'https://ssl.paiement.cic-banques.fr',
		CMCIC_URL_RETOUR	: "",
		CMCIC_URLOK			: "",
		CMCIC_URLKO			: "",
		test				: false
	};
	if (config) {
		_.extend(this.tpe, config);
	}
	this.setServer(this.tpe.CMCIC_BANK);
};

CMCIC.prototype.tpe.prototype.configure = function(cmcic) {
	if (cmcic) {
		_.extend(this.tpe, cmcic);
	}
	this.setServer(this.tpe.CMCIC_BANK);
};

CMCIC.prototype.tpe.prototype.setServer = function(bankName) {
	var server = banks[bankName];

	if (this.tpe.test) {
		server += "/test";
	}
	server += "/paiement.cgi";
	this.tpe.CMCIC_SERVEUR = server;
};

/**
* Transation method
*/

CMCIC.prototype.transaction = function (tpe, transactionData) {
	this.tpe = tpe;
	this.data = {};

	this.init(transactionData);
};

CMCIC.prototype.transaction.prototype.init = function (transactionData) {
	this.data = {
		date				: "",
		amount				: "",
		reference			: "",
		texteLibre			: {},
		email				: "",
		NbrEch				: "",
		DateEcheance1		: "",
		MontantEcheance1	: "",
		DateEcheance2		: "",
		MontantEcheance2	: "",
		DateEcheance3		: "",
		MontantEcheance3	: "",
		DateEcheance4		: "",
		MontantEcheance4	: "",
		options				: ""
	};
	_.extend(this.data, transactionData);
};

CMCIC.prototype.transaction.prototype.calculateMAC = function(data) {
	return crypto.createHmac('sha1', this.getHashKey()).update(data).digest('hex');
};

CMCIC.prototype.transaction.prototype.dataToSend = function(data) {
	if (!data) {
		data = this.data;
	}
	return this.tpe.tpe.CMCIC_TPE+
		'*' + data.date+
		'*' + data.amount + this.tpe.tpe.CMCIC_CURRENCY+
		'*' + data.reference+
		'*' + data.texteLibre+
		'*' + this.tpe.tpe.CMCIC_VERSION+
		'*' + this.tpe.tpe.CMCIC_LNG+
		'*' + this.tpe.tpe.CMCIC_CODESOCIETE+
		'*' + data.email+
		'*' + data.NbrEch+
		'*' + data.DateEcheance1+
		'*' + data.MontantEcheance1+
		'*' + data.DateEcheance2+
		'*' + data.MontantEcheance2+
		'*' + data.DateEcheance3+
		'*' + data.MontantEcheance3+
		'*' + data.DateEcheance4+
		'*' + data.MontantEcheance4+
		'*' + data.options;
};

CMCIC.prototype.transaction.prototype.getHashKey = function() {
	var data = this.tpe.tpe,
	hexStrkey = data.CMCIC_CLE.slice(0, 38),
	hexFinal = '' + data.CMCIC_CLE.slice(38) + '00',
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
	
	var r = "";
	for (var i = 0; i < hexStrkey.length / 2; i++) {
		var hex = hexStrkey[i*2] + hexStrkey[i*2 + 1];
		hexPack = parseInt(hex, 16);
		r +=  String.fromCharCode(hexPack);
	}
	return r;
};


CMCIC.prototype.transaction.prototype.stringifyTexteLibre = function() {
	var result = '',
	i = 0;
	for (var key in this.data.texteLibre) {
		var s = key+'='+this.data.texteLibre[key];
		if (i !== 0) {
			s = '&'+s;
		}
		if (result.length + s.length > 3200) {
			break;
		}
		result += s;
		i++;
	}
	if (result != '') {
		this.data.texteLibre = result;
	}
}

CMCIC.prototype.transaction.prototype.form = function(id, autosubmit) {
	this.stringifyTexteLibre();
	var mac = this.calculateMAC(this.dataToSend());
	result = '<form method="post" id="'+id+'" action='+this.tpe.tpe.CMCIC_SERVEUR+'>'+
		'<input type="hidden" name="version" value="'+this.tpe.tpe.CMCIC_VERSION+'">'+
		'<input type="hidden" name="TPE" value="'+this.tpe.tpe.CMCIC_TPE+'">'+
		'<input type="hidden" name="MAC" value="'+mac+'">'+
		'<input type="hidden" name="url_retour" value="'+this.tpe.tpe.CMCIC_URL_RETOUR+'">'+
		'<input type="hidden" name="url_retour_ok" value="'+this.tpe.tpe.CMCIC_URLOK+'">'+
		'<input type="hidden" name="url_retour_err" value="'+this.tpe.tpe.CMCIC_URLKO+'">'+
		'<input type="hidden" name="lgue" value="'+this.tpe.tpe.CMCIC_LNG+'">'+
		'<input type="hidden" name="societe" value="'+this.tpe.tpe.CMCIC_CODESOCIETE+'">'+
		'<input type="hidden" name="date" value="'+this.data.date+'">'+
		'<input type="hidden" name="montant" value="'+this.data.amount+this.tpe.tpe.CMCIC_CURRENCY+'">'+
		'<input type="hidden" name="reference" value="'+this.data.reference+'">'+
		'<input type="hidden" name="mail" value="'+this.data.email+'">'+
		'<input type="hidden" name="texte-libre" value="'+this.data.texteLibre+'">'+
		'<div class="submit">'+
		'<input type="submit" name="bouton" value="">'+
		'</div></form>';
	if (autosubmit === true) {
		result += '<script type="text/javascript">(function(){document.getElementById(\''+id+'\').submit();})();</script>';
	}
	return result;
};

module.exports = new CMCIC();
