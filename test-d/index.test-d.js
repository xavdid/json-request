"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsd_1 = require("tsd");
const index_1 = require("../src/index");
const response = await (0, index_1.get)('asdf');
(0, tsd_1.expectType)(response);
