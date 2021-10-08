const version = require("./package.json").version;
const path = require("path");
module.exports = {
    entry: "./lib/index.js",
    output: {
        filename: "ixo.js",
        library: "ixo",
        libraryTarget: "umd",
    },
    mode: "development",
    devtool: "source-map",
    node: false,
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        plugins: ["@babel/plugin-transform-reserved-words"],
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-transform-object-assign"]
                    },
                },
            },
        ],
    }
};
