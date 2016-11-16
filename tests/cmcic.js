var cmcic = require('../lib/cmcic');
var should = require('should');

describe('CMCIC', function () {
  var key = '3858F62230AC3C915F300C664312C63F';

  describe('get hash key', function () {
    it('should always return the same value', function () {
      var hashKey = cmcic.getHashKey(key);
      hashKey.should.equal('8Xö"0¬<_0\ffC\u0012Æ?\u0000');
    });
  });

  describe('calculate MAC value', function () {
    var data = [
      'bar',
      '25/07/2016_a_17:01:37',
      '200EUR',
      'myreference',
      'dummy_text',
      '3.0',
      'payetest',
      'oui',
      '4242',
      'VI',
      '-1',
      '000000',
      '',
      'FRA',
      '000001',
      'test',
      '127.0.0.1',
      'FRA',
      '',
      ''
    ].join('*') + '*';

    it('should always return the same value', function () {
      var hashKey = cmcic.getHashKey(key);
      var MAC = cmcic.calculateMAC(data, key);
      MAC.should.equal('89b737eebe41200b32cd5f374310a0b509c73e47');
    });
  });
});
