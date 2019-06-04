import * as fs from 'fs';
import {assert} from 'chai';
import Processor from '../processor';
var wavParser = require('wav-fmt-validator').parser;

require('source-map-support').install();

// encode
describe('encode', () => {
  it('should append iXML chunk to audio data.', (cb) => {
    const wavFile = './test/sample-wav.wav';
    const outFile = './test/sample-wav-out.wav';
    const trackName = 'dummy-track';

    const processor = new Processor();
    processor
      .append(wavFile, trackName, outFile)
      .then((out: string) => {
        assert.ok(out);

        // validate wav file
        fs.readFile(out, 'binary', (err, content) => {
          if (err) {
            return cb(err);
          }
          let buffer = Buffer.from(content, 'binary');
          const result = wavParser(buffer);
          //console.log(result);
          assert.ok(result);
          cb();
        });
      })
      .catch((err) => {
        cb(err);
      });
  });

  it('should not append iXML chunk to audio data having iXML chunk.', () => {
    const wavFile = './test/with-ixml-left.wav';
    const outFile = './test/with-ixml-left-out.wav';
    const trackName = 'dummy-track';

    const processor = new Processor();
    return processor.append(wavFile, trackName, outFile).then((out: string) => {
      assert.equal(out, null);
      return out;
    });
  });

  it('should append iXML chunk to mixdown audio data.', (cb) => {
    const wavFile = './test/mixdown-wav.wav';
    const outFile = './test/mixdown-wav-out.wav';
    const trackName = 'dummy-track';

    const processor = new Processor();
    processor
      .append(wavFile, trackName, outFile)
      .then((out: string) => {
        assert.ok(out);

        // validate wav file
        fs.readFile(out, 'binary', (err, content) => {
          if (err) {
            return cb(err);
          }
          let buffer = Buffer.from(content, 'binary');
          const result = wavParser(buffer);
          //console.log(result);
          assert.ok(result);
          cb();
        });
      })
      .catch((err) => {
        cb(err);
      });
  });

  // TODO
  //it('should not append iXML chunk to illegal audio data.', () => {
  //  const wavFile = './test/invalid-wav.wav';
  //  const outFile = './test/invalid-wav-out.wav';
  //  const trackName = 'dummy-track';
  //
  //  const processor = new Processor();
  //  return processor.encode(wavFile, trackName, outFile)
  //  .then((out: string) => {
  //    assert.equal(out, null);
  //    return out;
  //  })
  //  .catch((err) => {
  //    console.error(err);
  //  });
  //});
});
