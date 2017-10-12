module.exports = {
    entry: "./s-app/client.ts",
    output: {
        filename: "./public/s-app/bundle.js"
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
