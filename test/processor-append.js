"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const chai_1 = require("chai");
const processor_1 = require("../processor");
var wavParser = require('wav-fmt-validator').parser;
require('source-map-support').install();
describe('encode', () => {
    it('should append iXML chunk to audio data.', (cb) => {
        const wavFile = './test/sample-wav.wav';
        const outFile = './test/sample-wav-out.wav';
        const trackName = 'dummy-track';
        const processor = new processor_1.default();
        processor
            .append(wavFile, trackName, outFile)
            .then((out) => {
            chai_1.assert.ok(out);
            fs.readFile(out, 'binary', (err, content) => {
                if (err) {
                    return cb(err);
                }
                let buffer = Buffer.from(content, 'binary');
                const result = wavParser(buffer);
                chai_1.assert.ok(result);
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
        const processor = new processor_1.default();
        return processor.append(wavFile, trackName, outFile).then((out) => {
            chai_1.assert.equal(out, null);
            return out;
        });
    });
});
