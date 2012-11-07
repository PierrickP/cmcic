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

CMCIC.calculateMAC = function(data, key) {
	return crypto.createHmac('sha1', CMCIC.getHashKey(key)).update(data).digest('hex');
};

CMCIC.getHashKey = function(key) {
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
	
	var r = "";
	for (var i = 0; i < hexStrkey.length / 2; i++) {
		var hex = hexStrkey[i*2] + hexStrkey[i*2 + 1];
		hexPack = parseInt(hex, 16);
		r +=  String.fromCharCode(hexPack);
	}
	return r;
};

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

CMCIC.prototype.tpe.prototype.checkTransactionReturn = function(transactionData) {
	var data =  transactionData.TPE
		+ '*' + transactionData.date
		+ '*' + transactionData.montant
		+ '*' + transactionData.reference
		+ '*' + transactionData['texte-libre']
		+ '*' + transactionData.version
		+ '*' + transactionData.codeRetour
		+ '*' + transactionData.cvx
		+ '*' + transactionData.vld
		+ '*' + transactionData.brand
		+ '*' + transactionData.status3ds
		+ '*' + transactionData.numauto
		+ '*' + transactionData.motifrefus
		+ '*' + transactionData.originecb
		+ '*' + transactionData.bincb
		+ '*' + transactionData.hpancb
		+ '*' + transactionData.ipclient
		+ '*' + transactionData.originetr
		+ '*' + transactionData.veres
		+ '*' + transactionData.pares
		+ '*';
	var mac = CMCIC.calculateMAC(data, this.tpe.CMCIC_CLE);
	if (mac === transactionData.MAC && (transactionData['code-retour'] === "paiement" ||  transactionData.code_retour === "payetest")) {
		return {
			status: false,
			date: transactionData.date,
			TPE : transactionData.TPE,
			montant: transactionData.montant,
			reference:transactionData.reference,
			'texte-libre': JSON.parse(new Buffer(transactionData['texte-libre'], 'base64').toString('ascii')),
			'code-retour': transactionData['code-retour'],
			cvx: transactionData.cvx,
			vld: transactionData.vld,
			brand: transactionData.brand,
			status3ds: transactionData.status3ds,
			numauto: transactionData.numauto,
			originecb: transactionData.originecb,
			bincb: transactionData.bincb,
			hpancb: transactionData.hpancb,
			ipclient: transactionData.ipclient,
			oririnetr: transactionData.originetr,
			veres: transactionData.veres,
			pares: transactionData.pares,
			montantech: transactionData.montantech,
			cbenregistree: transactionData.cbenregistree,
			cbmasquee: transactionData.cbmasquee
		};
	} else {
		return {
			status: false,
			date: transactionData.date,
			TPE : transactionData.TPE,
			montant: transactionData.montant,
			reference: transactionData.reference,
			'texte-libre': base64_decode(transactionData['texte-libre']),
			'code-retour': transactionData['code-retour'],
			cvx: transactionData.cvx,
			vld: transactionData.vld,
			brand: transactionData.brand,
			status3ds: transactionData.status3ds,
			numauto: transactionData.numauto,
			motifrefus: transactionData.motifrefus,
			originecb: transactionData.originecb,
			bincb: transactionData.bincb,
			hpancb: transactionData.hpancb,
			ipclient: transactionData.ipclient,
			oririnetr: transactionData.originetr,
			veres: transactionData.veres,
			pares: transactionData.pares,
			montantech: transactionData.montantech,
			filtragecause: transactionData.filtragecause,
			filtragevaleur: transactionData.filtragevaleur,
			cbenregistree: transactionData.cbenregistree,
			cbmasquee: transactionData.cbmasquee
		};			
	}
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

CMCIC.prototype.transaction.prototype.getDate = function() {
	var d = new Date();

	var day = (d.getDate() < 10) ? '0' + d.getDate() : d.getDate();
	var month = ( (d.getMonth() + 1) < 10) ? '0'+(d.getMonth()+1) : d.getMonth()+1;
	var year = d.getFullYear();
	var hour = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
	var minute = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
	var second = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds();
	if (this.data.date === '') {
		this.data.date = day + "/" + month + "/" + year + ":" + hour + ":" + minute + ":" + second;
	}
};

CMCIC.prototype.transaction.prototype.form = function(id, autosubmit) {
	this.getDate();
	this.data.texteLibre = new Buffer(JSON.stringify(this.data.texteLibre)).toString('base64');
	var mac = CMCIC.calculateMAC(this.dataToSend(), this.tpe.tpe.CMCIC_CLE),
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
