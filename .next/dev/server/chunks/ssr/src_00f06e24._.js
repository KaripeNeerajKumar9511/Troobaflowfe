module.exports = [
"[project]/src/stores/modelStore.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/src/stores/modelStore.ts [app-ssr] (ecmascript)");
    });
});
}),
"[project]/src/lib/scenarioDb.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_lib_scenarioDb_ts_ceb8800b._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/scenarioDb.ts [app-ssr] (ecmascript)");
    });
});
}),
"[project]/src/stores/resultsStore.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/src_stores_resultsStore_ts_10cbb429._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/stores/resultsStore.ts [app-ssr] (ecmascript)");
    });
});
}),
];