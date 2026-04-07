module.exports = [
"[project]/src/stores/resultsStore.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useResultsStore",
    ()=>useResultsStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-ssr] (ecmascript)");
;
const useResultsStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        results: {},
        selectedRunScenarioId: 'basecase',
        setSelectedRunScenarioId: (id)=>set({
                selectedRunScenarioId: id
            }),
        setResults: (key, results)=>set((s)=>({
                    results: {
                        ...s.results,
                        [key]: results
                    }
                })),
        getResults: (key)=>get().results[key],
        clearResults: (key)=>set((s)=>{
                const { [key]: _, ...rest } = s.results;
                return {
                    results: rest
                };
            }),
        clearAllForModel: ()=>set({
                results: {}
            })
    }));
}),
];

//# sourceMappingURL=src_stores_resultsStore_ts_10cbb429._.js.map