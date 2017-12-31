module.exports = {
    entry: "./src/client.ts",
    output: {
        filename: "./dist/bundle.js"
    },
    resolve: {
        // Add '.ts' and '.tsx' as a resolvable extension.
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },
    devtool: "source-map",
    module: {
        loaders: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            { 
                test: /\.tsx?$/, loader: "ts-loader" 
            }
        ]
    }
};
