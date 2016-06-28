var cmcic = require('../lib/cmcic'),
should = require('should');

describe('TPE', function () {

  var data = {
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
  };

  describe('create tpe', function () {
    var tpe;

    beforeEach(function () {
      tpe = new cmcic.tpe(data);
    });

    it('should be defined', function () {
      should.exist(tpe);
    });

    it('TPE should be 1234567', function () {
      tpe._tpe.CMCIC_TPE.should.equal('1234567');
    });

    it('CMCIC_URLOK should be /url/ok', function () {
      tpe._tpe.CMCIC_URLOK.should.equal('/url/ok');
    });
  });

  describe('configure tpe', function () {
    var tpe;

    beforeEach(function () {
      tpe = new cmcic.tpe(data);
      tpe.configure({
        CMCIC_TPE: '7654321'
      });
    });

    it('CMCIC_TPE should be 7654321', function () {
      tpe.get('CMCIC_TPE').should.equal('7654321');
    });
  });

  describe('set tpe', function () {
    var tpe;

    beforeEach(function () {
      tpe = new cmcic.tpe(data);
      tpe.set('CMCIC_URLOK', '/url/newok');
    });

    it('CMCIC_URLOK should be /url/newok', function () {
      tpe._tpe.CMCIC_URLOK.should.equal('/url/newok');
    });
  });

  describe('get tpe', function () {
    var tpe;

    beforeEach(function () {
      tpe = new cmcic.tpe(data);
      tpe.set('CMCIC_CODESOCIETE', '424242');
    });

    it('CMCIC_CODESOCIETE should be 424242', function () {
      tpe.get('CMCIC_CODESOCIETE').should.equal('424242');
    });
  });

  describe('setServer', function () {
    var tpe;

    beforeEach(function () {
      tpe = new cmcic.tpe(data);
      tpe.set('CMCIC_BANK', 'OBC');
    });

    it('CMCIC_BANK should be OBC', function () {
      tpe.get('CMCIC_BANK').should.equal('OBC');
    });

    it('CMCIC_SERVEUR should be OBC', function () {
      tpe.get('CMCIC_SERVEUR').should.equal('https://ssl.paiement.banque-obc.fr/paiement.cgi');
    });
  });

  describe('test mode', function () {
    var tpe;

    beforeEach(function () {
      tpe = new cmcic.tpe(data);
      tpe.configure({test: true});
    });

    it('CMCIC_SERVEUR should be https://ssl.paiement.cic-banques.fr/test/paiement.cgi', function () {
      tpe.get('CMCIC_SERVEUR').should.equal('https://ssl.paiement.cic-banques.fr/test/paiement.cgi');
    });

    it('test should be true', function () {
      tpe.get('test').should.true;
    });
  });
});
