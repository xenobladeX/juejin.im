const path = require('path');
const fs = require('fs');
const webpack = require("webpack");
const glob = require("glob");
// 分离css
const extractTextPlugin = require("extract-text-webpack-plugin");
//消除冗余的css
const purifyCssWebpack = require("purifycss-webpack");
// html模板
const htmlWebpackPlugin = require("html-webpack-plugin");
//静态资源输出
const copyWebpackPlugin = require("copy-webpack-plugin");
const rules = require("./webpack.rules.conf.js");
// 获取html-webpack-plugin参数的方法
var getHtmlConfig = function (name) {
	return {
		template: `./src/pages/${name}/index.html`,
		filename: `${name}.html`,
		favicon: './src/images/favicon.ico',
		inject: true,
		hash: true, //开启hash  ?[hash]
		chunks: ['vendor', name],
		minify: process.env.NODE_ENV === "development" ? false : {
			removeComments: true, //移除HTML中的注释
			collapseWhitespace: true, //折叠空白区域 也就是压缩代码
			removeAttributeQuotes: true, //去除属性引用
		},
	};
};

var getPages = function () {
	var pagesPath = path.resolve(__dirname, "../src/pages");
	var pagesEntry = {};
	var pages = fs.readdirSync(pagesPath);

	for (var index in pages) {
		var pagename = pages[index];
		//获取当前文件的绝对路径
		var pagedir = path.join(pagesPath, pagename);
		//根据文件路径获取文件信息，返回一个fs.Stats对象
		var stats = fs.statSync(pagedir);
		if (stats.isDirectory()) {
			//是文件夹
			pagesEntry[pagename] = pagedir;
		}
	}
	return pagesEntry;
};

var getEntries = function (path) {
	var pages = getPages();
	var entires = {};
	for (var page in pages) {
		var pageDir = pages[page];
		entires[page] = getEntry(pageDir);
	}
	return entires;
};

var getEntry = function (dir) {
	var entryItems = [];
	var files = glob.sync(path.join(dir, "/**/*.js"));
	for (var i = 0; i < files.length; i++) {
		entryItems.push(files[i]);
	}
	return entryItems;
};

var entry = getEntries();

module.exports = {
	entry: entry,
	module: {
		rules: [...rules]
	},
	//将外部变量或者模块加载进来
	externals: {
		// 'jquery': 'window.jQuery'
	},
	plugins: [
		// 全局暴露统一入口
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
			'window.jQuery': 'jquery',
		}),
		//静态资源输出
		new copyWebpackPlugin([{
			from: path.resolve(__dirname, "../src/assets"),
			to: './assets',
			ignore: ['.*']
		}]),
		// 分离css插件参数为提取出去的路径
		new extractTextPlugin({
			filename: 'css/[name].[hash:8].min.css',
		}),
		// 消除冗余的css代码，由于js会操作css，所以通常不启用
		// new purifyCssWebpack({
		// 	paths: glob.sync(path.join(__dirname, "../src/pages/*/*.html"))
		// }),

	],
	// webpack4里面移除了commonChunksPulgin插件，放在了config.optimization里面,提取js， vendor名字可改
	optimization: {
		splitChunks: {
			cacheGroups: {
				vendor: {
					// test: /\.js$/,
					test: /[\\/]node_modules[\\/]/,
					chunks: "initial", //表示显示块的范围，有三个可选值：initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
					name: "vendor", //拆分出来块的名字(Chunk Names)，默认由块名和hash值自动生成；
					enforce: true,
				}
			}
		}
	},
}

//自动生成html模板
Object.keys(entry).forEach((element) => {
	module.exports.plugins.push(new htmlWebpackPlugin(getHtmlConfig(element)));
});
