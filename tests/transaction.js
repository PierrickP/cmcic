var cmcic = require('../lib/cmcic'),
should = require('should');

describe('transaction', function () {

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

  describe('create', function () {
    var trans;

    beforeEach(function () {
      trans = new cmcic.transaction(tpe, {
        email: 'exemple@exemple.fr',
        amount: 300,
        reference: 'qwerty'
      });
    });

    it('should be defined', function () {
      should.exist(trans);
    });

    it('transaction should contain tpe', function () {
      trans._tpe.should.equal(tpe);
    });

    it('email should be exemple@exemple.fr', function () {
      trans._data.email.should.equal('exemple@exemple.fr');
    });
  });

  describe('dataToSend', function () {
    var trans = new cmcic.transaction(tpe, {
      email: 'exemple@exemple.fr',
      amount: 300,
      reference: 'qwerty'
    });
    var dts = trans.dataToSend(trans._data);

    it('should be data join by *', function () {
      dts.should.equal('1234567**300EUR*qwerty*[object Object]*3.0*FR*societykey*exemple@exemple.fr**********');
    });
  });

  describe('form', function () {
    var trans = new cmcic.transaction(tpe, {
      email: 'exemple@exemple.fr',
      amount: 300,
      reference: 'qwerty',
      'texteLibre': {
        plop: 42
      }
    });

    var d = new Date();
    var day = (d.getDate() < 10) ? '0' + d.getDate() : d.getDate();
    var month = ( (d.getMonth() + 1) < 10) ? '0'+(d.getMonth()+1) : d.getMonth()+1;
    var year = d.getFullYear();
    var hour = (d.getHours() < 10) ? '0' + d.getHours() : d.getHours();
    var minute = (d.getMinutes() < 10) ? '0' + d.getMinutes() : d.getMinutes();
    var second = (d.getSeconds() < 10) ? '0' + d.getSeconds() : d.getSeconds();
    var date = day + "/" + month + "/" + year + ":" + hour + ":" + minute + ":" + second;
    var form = trans.form('IDISH', false);

    it('id should be IDISH', function () {
      form.match(/<form method="post" id="(\w*)"/)[1].should.equal('IDISH');
    });

    it('amount should be 300EUR', function () {
      form.match(/<input type="hidden" name="montant" value="(\w*)">/)[1].should.equal('300EUR');
    });

    it('date should be formated', function () {
      form.match(/<input type="hidden" name="date" value="(\d{2}\/\d{2}\/\d{4}:\d{2}:\d{2}:\d{2})">/)[1].should.equal(date);
    });

    it('texte-libre should be right', function () {
      form.indexOf('<input type="hidden" name="texte-libre" value="eyJwbG9wIjo0Mn0=">').should.above(-1);
    });
  });

  describe('form autosubmit', function () {
    var trans = new cmcic.transaction(tpe, {
      email: 'exemple@exemple.fr',
      amount: 300,
      reference: 'qwerty'
    });
    var form = trans.form('IDISH', true);
    it('autosubmit script should be present', function () {
      form.indexOf("(function(){document.getElementById('IDISH').submit();})();").should.above(-1);
    });
  });

  describe('form static date', function () {
    var trans = new cmcic.transaction(tpe, {
      email: 'exemple@exemple.fr',
      amount: 300,
      reference: 'qwerty',
      date: '24/12/2042 23:42:42'
    });
    var form = trans.form('IDISH', false);

    it('MAC should be right', function () {
      form.match(/<input type="hidden" name="MAC" value="(\w*)">/)[1].should.equal('62b9e94e3ed4ab72bb66b3b5f7a9b2c6fed78bd1');
    });
  });
});
