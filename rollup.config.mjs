import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
    input: "src/index.js",
    output: {
        dir: "bin",
        format: "cjs",
        banner: '#!/usr/bin/env node',
    },
    plugins: [json(),  commonjs()],
};
