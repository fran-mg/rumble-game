const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Force Metro to recognize and correctly link WebAssembly binary files
// Add wasm to both sourceExts and assetExts to ensure compatibility
config.resolver.sourceExts.push("wasm");
config.resolver.assetExts.push("wasm");

module.exports = withNativeWind(config, { input: "./app/global.css" });
