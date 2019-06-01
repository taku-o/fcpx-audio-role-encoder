#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const processor_1 = require("../processor");
const options = require('minimist')(process.argv.slice(2));
if (options.i && options.o && options.t) {
}
else {
    console.log(`usage:
    fcpx-audio-role-append -i in.wav -o out.wav -t trackName
`);
    process.exit(0);
}
const input = options.i;
const output = options.o;
const trackName = options.t;
const processor = new processor_1.default();
processor.append(input, trackName, output).then((out) => {
    if (out) {
        console.log(`${out}`);
    }
});
