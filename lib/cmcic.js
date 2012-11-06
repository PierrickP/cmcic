var path  = require('path')
  , crypto    = require('crypto')
  , _     = require('underscore');

var cmcic = function(options) {
	this.options = {
		CMCIC_TPE			: '',
		CMCIC_CODESOCIETE	: '',
		CMCIC_CLE			: '',
		CMCIC_BANK			: 'CIC',
		CMCIC_VERSION		: '3.0',
		CMCIC_LNG			: 'FR',
		CMCIC_CURRENCY		: 'EUR',
		CMCIC_SERVEUR		: 'https://ssl.paiement.cic-banques.fr/',
		CMCIC_URL_RETOUR	: "",
		CMCIC_URLOK			: "",
		CMCIC_URLKO			: "",
		date				: "",
		amount				: "",
		reference			: "",
		textlabel			: "",
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
	}
	_.extend(this.options, options);

	this.configure = function(options){
		_.extend(this.options, options);
		this.init();
		return this.options;
	};

	this.init = function() {

	};

	this.caculateMAC = function(data){
		var sha1Hash = crypto.createHmac('sha1', this.getHashKey()).update(data).digest('hex');
		return sha1Hash;
	};
	
	this.getDataFirstStep = function(params){
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
	
	this.getDataSecondStep = function(params){
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
	
	this.getHashKey = function() {
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
	}
}

module.exports = function(templateDirectory, defaults, done) {
  return new EmailTemplate(templateDirectory, defaults, done);
};
