var path  = require('path')
  , crypto    = require('crypto')
  , _     = require('underscore');

var CMCIC = function() {
	this.options = {
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
		date				: "",
		amount				: "",
		reference			: "",
		textlabel			: "",
		text				: "",
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
		test				: false,
		params				: ""
	};
	this.banks = {
		"CIC": "https://ssl.paiement.cic-banques.fr",
		"CM" : "https://paiement.creditmutuel.fr",
		"OBC": "https://ssl.paiement.banque-obc.fr"
	};
}

CMCIC.prototype.configure = function(options) {
		if (options) {
			_.extend(this.options, options);
		}
		this.options.CMCIC_SERVEUR = this.getServer();
		return true;
};

CMCIC.prototype.set = function(key, value) {
		if (key) {
			this.options[key] = value;
			return true;
		}
		return false;
}

CMCIC.prototype.getServer = function() {
	var server = '';
	if (this.banks[this.options.CMCIC_BANK]) {
		server = this.banks[this.options.CMCIC_BANK];
		if (this.options.test) {
			server += "/test";
		}
		server += "/paiement.cgi";
	}
	return server;
};

CMCIC.prototype.setBank = function(bankName, bankUrl) {
	if (bankName && bankUrl) {
		this.banks[bankName] = bankUrl;
		return true;
	}
	return false;
};

CMCIC.prototype.calculateMAC = function(data){
	var sha1Hash = crypto.createHmac('sha1', this.getHashKey()).update(data).digest('hex');
	return sha1Hash;
};

CMCIC.prototype.getDataFirstStep = function(params){
	if (!params) {
		params = this.options;
	}
	return  params.CMCIC_TPE
	+ '*' + params.date
	+ '*' + params.amount + params.CMCIC_CURRENCY
	+ '*' + params.reference
	+ '*' + params.textlabel
	+ '*' + params.CMCIC_VERSION
	+ '*' + params.CMCIC_LNG
	+ '*' + params.CMCIC_CODESOCIETE
	+ '*' + params.email
	+ '*' + params.NbrEch
	+ '*' + params.DateEcheance1
	+ '*' + params.MontantEcheance1
	+ '*' + params.DateEcheance2
	+ '*' + params.MontantEcheance2
	+ '*' + params.DateEcheance3
	+ '*' + params.MontantEcheance3
	+ '*' + params.DateEcheance4
	+ '*' + params.MontantEcheance4
	+ '*' + params.params
	;
};

CMCIC.prototype.getDataSecondStep = function(params){
	if (!params) {
		params = this.options;
	}
	return params.TPE
	+ '*' + params.date
	+ '*' + params.montant
	+ '*' + params.reference
	+ '*' + params.texteLibre
	+ '*' + params.version
	+ '*' + params.codeRetour
	+ '*' + params.cvx
	+ '*' + params.vld
	+ '*' + params.brand
	+ '*' + params.status3ds
	+ '*' + params.numauto
	+ '*' + params.motifrefus
	+ '*' + params.originecb
	+ '*' + params.bincb
	+ '*' + params.hpancb
	+ '*' + params.ipclient
	+ '*' + params.originetr
	+ '*' + params.veres
	+ '*' + params.pares
	+ '*'
	;
};

CMCIC.prototype.getHashKey = function(options) {
	if (!options) {
		options = this.options;
	}		
	var hexStrkey = options.CMCIC_CLE.slice(0, 38);
	var hexFinal = '' + options.CMCIC_CLE.slice(38) + '00';
	
	var cca0 = hexFinal.charCodeAt(0);
	
	if(cca0  > 70 && cca0 < 97){
		hexStrkey += String.fromCharCode(cca0-23) + hexFinal.charAt(1);
	}else{
		if(hexFinal.charAt(1) == 'M'){
			hexStrkey += hexFinal.charAt(0) + '0';
		}else{
			hexStrkey += hexFinal.slice(0, 2);
		}
	}
	
	var r = "";
	for(var i = 0; i < hexStrkey.length / 2; i++) {
		var hex = hexStrkey[i*2] + hexStrkey[i*2 + 1];
		hexPack = parseInt(hex, 16);
		r +=  String.fromCharCode(hexPack);
	}
	
	return r;
};

CMCIC.prototype.form = function(id) {
	var mac = this.calculateMAC(this.getDataFirstStep());
	var result = '<form method="post" id="'+id+'" action='+this.options.CMCIC_SERVEUR+'>'
		+'<input type="hidden" name="version" value="'+this.options.CMCIC_VERSION+'">'
		+'<input type="hidden" name="TPE" value="'+this.options.CMCIC_TPE+'">'
		+'<input type="hidden" name="MAC" value="'+mac+'">'
		+'<input type="hidden" name="url_retour" value="'+this.options.CMCIC_URL_RETOUR+'">'
		+'<input type="hidden" name="url_retour_ok" value="'+this.options.CMCIC_URLOK+'">'
		+'<input type="hidden" name="url_retour_err" value="'+this.options.CMCIC_URLKO+'">'
		+'<input type="hidden" name="lgue" value="'+this.options.CMCIC_LNG+'">'
		+'<input type="hidden" name="societe" value="'+this.options.CMCIC_CODESOCIETE+'">'
		+'<input type="hidden" name="date" value="'+this.options.date+'">'
		+'<input type="hidden" name="montant" value="'+this.options.amount+this.options.CMCIC_CURRENCY+'">'
		+'<input type="hidden" name="reference" value="'+this.options.reference+'">'
		+'<input type="hidden" name="mail" value="'+this.options.email+'">'
		+'<input type="hidden" name="texte-libre" value="'+this.options.text+'">'
		+'<div class="submit">'
		+'<input type="submit" name="bouton" value="">'
		+'</div>'
		+'</form>'; 
	if (this.options.autoSubmit) {
		result += '<script type="text/javascript">'
			+'(function(){'
			+'document.getElementById(\''+id+'\').submit();'
			+'})();'
			+'</script>';
	}
	return result;
};

module.exports = new CMCIC();