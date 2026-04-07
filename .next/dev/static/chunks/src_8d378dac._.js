(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/hooks/useSortableTable.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSortableTable",
    ()=>useSortableTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useSortableTable(data, defaultSortKey, defaultSortDir = 'desc') {
    _s();
    const [sort, setSort] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        key: '',
        dir: 'default'
    });
    const handleSort = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSortableTable.useCallback[handleSort]": (key)=>{
            setSort({
                "useSortableTable.useCallback[handleSort]": (prev)=>{
                    if (prev.key !== key) return {
                        key,
                        dir: 'asc'
                    };
                    if (prev.dir === 'asc') return {
                        key,
                        dir: 'desc'
                    };
                    if (prev.dir === 'desc') return {
                        key: '',
                        dir: 'default'
                    };
                    return {
                        key,
                        dir: 'asc'
                    };
                }
            }["useSortableTable.useCallback[handleSort]"]);
        }
    }["useSortableTable.useCallback[handleSort]"], []);
    const sorted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useSortableTable.useMemo[sorted]": ()=>{
            const arr = [
                ...data
            ];
            const activeKey = sort.dir === 'default' ? defaultSortKey : sort.key;
            const activeDir = sort.dir === 'default' ? defaultSortDir : sort.dir;
            if (!activeKey) return arr;
            return arr.sort({
                "useSortableTable.useMemo[sorted]": (a, b)=>{
                    const va = a[activeKey];
                    const vb = b[activeKey];
                    if (typeof va === 'string' && typeof vb === 'string') {
                        return activeDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
                    }
                    const na = Number(va) || 0;
                    const nb = Number(vb) || 0;
                    return activeDir === 'asc' ? na - nb : nb - na;
                }
            }["useSortableTable.useMemo[sorted]"]);
        }
    }["useSortableTable.useMemo[sorted]"], [
        data,
        sort,
        defaultSortKey,
        defaultSortDir
    ]);
    const reset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSortableTable.useCallback[reset]": ()=>setSort({
                key: '',
                dir: 'default'
            })
    }["useSortableTable.useCallback[reset]"], []);
    return {
        sorted,
        sort,
        handleSort,
        reset
    };
}
_s(useSortableTable, "2h0Fq/BoKn0gwjPYFXS5Zxy+B5g=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useRunCalculation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getRunLog",
    ()=>getRunLog,
    "useRunCalculation",
    ()=>useRunCalculation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/modelStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/scenarioStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$resultsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/resultsStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$calculationEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/calculationEngine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
// Module-level run log so it persists across hook instances
let _runLog = [];
let _runLogListeners = new Set();
function notifyRunLog() {
    _runLogListeners.forEach((fn)=>fn());
}
function subscribeRunLog(cb) {
    _runLogListeners.add(cb);
    return ()=>{
        _runLogListeners.delete(cb);
    };
}
function getRunLogSnapshot() {
    return _runLog;
}
// Module-level isRunning so it's shared across hook instances
let _isRunning = false;
let _isRunningListeners = new Set();
function notifyIsRunning() {
    _isRunningListeners.forEach((fn)=>fn());
}
function subscribeIsRunning(cb) {
    _isRunningListeners.add(cb);
    return ()=>{
        _isRunningListeners.delete(cb);
    };
}
function getIsRunningSnapshot() {
    return _isRunning;
}
function setGlobalIsRunning(v) {
    _isRunning = v;
    notifyIsRunning();
}
function useRunCalculation() {
    _s();
    const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "useRunCalculation.useModelStore[model]": (s)=>s.getActiveModel()
    }["useRunCalculation.useModelStore[model]"]);
    const setRunStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "useRunCalculation.useModelStore[setRunStatus]": (s)=>s.setRunStatus
    }["useRunCalculation.useModelStore[setRunStatus]"]);
    const allScenarios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"])({
        "useRunCalculation.useScenarioStore[allScenarios]": (s)=>s.scenarios
    }["useRunCalculation.useScenarioStore[allScenarios]"]);
    const activeScenario = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"])({
        "useRunCalculation.useScenarioStore[activeScenario]": (s)=>s.getActiveScenario()
    }["useRunCalculation.useScenarioStore[activeScenario]"]);
    const markCalculated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"])({
        "useRunCalculation.useScenarioStore[markCalculated]": (s)=>s.markCalculated
    }["useRunCalculation.useScenarioStore[markCalculated]"]);
    const { setResults } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$resultsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useResultsStore"])();
    const selectedRunScenarioId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$resultsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useResultsStore"])({
        "useRunCalculation.useResultsStore[selectedRunScenarioId]": (s)=>s.selectedRunScenarioId
    }["useRunCalculation.useResultsStore[selectedRunScenarioId]"]);
    // Determine which scenario to run for — dropdown selection overrides activeScenario
    const runScenario = selectedRunScenarioId && selectedRunScenarioId !== 'basecase' ? allScenarios.find((s)=>s.id === selectedRunScenarioId) || activeScenario : activeScenario;
    const [verifyMessages, setVerifyMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Subscribe to shared state (getServerSnapshot required for SSR/prerender)
    const runLog = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribeRunLog, getRunLogSnapshot, {
        "useRunCalculation.useSyncExternalStore[runLog]": ()=>[]
    }["useRunCalculation.useSyncExternalStore[runLog]"]);
    const isRunning = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(subscribeIsRunning, getIsRunningSnapshot, {
        "useRunCalculation.useSyncExternalStore[isRunning]": ()=>false
    }["useRunCalculation.useSyncExternalStore[isRunning]"]);
    const handleRun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useRunCalculation.useCallback[handleRun]": async (mode)=>{
            if (!model || _isRunning) return;
            // Verify-only mode
            if (mode === 'verify') {
                const startTime = Date.now();
                const msgs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$calculationEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["verifyData"])(model);
                setVerifyMessages(msgs);
                const entry = {
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    mode: 'verify',
                    scenarioName: runScenario?.name || 'Basecase',
                    durationMs: Date.now() - startTime,
                    status: msgs.errors.length > 0 ? 'error' : msgs.warnings.length > 0 ? 'warning' : 'success'
                };
                _runLog = [
                    entry,
                    ..._runLog
                ].slice(0, 5);
                notifyRunLog();
                if (msgs.errors.length === 0 && msgs.warnings.length === 0) {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Data verification complete — no issues found');
                } else {
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].warning(`Found ${msgs.errors.length} error(s) and ${msgs.warnings.length} warning(s)`);
                }
                return;
            }
            // Validation
            const validationErrors = [];
            if (model.general.conv1 <= 0) validationErrors.push('Time Conversion 1 must be greater than 0');
            if (model.general.conv2 <= 0) validationErrors.push('Time Conversion 2 must be greater than 0');
            model.products.forEach({
                "useRunCalculation.useCallback[handleRun]": (p)=>{
                    if (p.lot_size < 1) validationErrors.push(`Product "${p.name}": Lot Size must be ≥ 1`);
                    if (p.demand < 0) validationErrors.push(`Product "${p.name}": Demand cannot be negative`);
                }
            }["useRunCalculation.useCallback[handleRun]"]);
            model.equipment.forEach({
                "useRunCalculation.useCallback[handleRun]": (e)=>{
                    if (e.equip_type === 'standard' && e.count < 1) validationErrors.push(`Equipment "${e.name}": Count must be ≥ 1`);
                }
            }["useRunCalculation.useCallback[handleRun]"]);
            model.labor.forEach({
                "useRunCalculation.useCallback[handleRun]": (l)=>{
                    if (l.count < 1) validationErrors.push(`Labor "${l.name}": Count must be ≥ 1`);
                }
            }["useRunCalculation.useCallback[handleRun]"]);
            if (validationErrors.length > 0) {
                setVerifyMessages({
                    errors: validationErrors,
                    warnings: []
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(`${validationErrors.length} validation error(s) — fix before calculating`, {
                    description: validationErrors.slice(0, 3).join('; ') + (validationErrors.length > 3 ? '…' : '')
                });
                return;
            }
            setGlobalIsRunning(true);
            const startTime = Date.now();
            const resultKey = runScenario ? runScenario.id : 'basecase';
            return new Promise({
                "useRunCalculation.useCallback[handleRun]": (resolve, reject)=>{
                    const runCalculation = {
                        "useRunCalculation.useCallback[handleRun].runCalculation": async ()=>{
                            try {
                                let calcResults;
                                if (mode === 'full') {
                                    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/api/simulations/full-calculate', {
                                        model,
                                        scenario: runScenario ?? null
                                    });
                                    calcResults = data.results;
                                } else {
                                    calcResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$calculationEngine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculate"])(model, runScenario || undefined);
                                }
                                setResults(resultKey, calcResults);
                                setRunStatus(model.id, 'current');
                                if (runScenario) markCalculated(runScenario.id);
                                setGlobalIsRunning(false);
                                setVerifyMessages(null);
                                const durationMs = Date.now() - startTime;
                                const hasErrors = calcResults.errors.length > 0;
                                const hasWarnings = calcResults.overLimitResources.length > 0;
                                const entry = {
                                    id: crypto.randomUUID(),
                                    timestamp: new Date().toISOString(),
                                    mode,
                                    scenarioName: runScenario?.name || 'Basecase',
                                    durationMs,
                                    status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success'
                                };
                                _runLog = [
                                    entry,
                                    ..._runLog
                                ].slice(0, 5);
                                notifyRunLog();
                                // Persist to Supabase
                                const { scenarioDb } = await __turbopack_context__.A("[project]/src/lib/scenarioDb.ts [app-client] (ecmascript, async loader)");
                                if (runScenario) {
                                    scenarioDb.saveResults(runScenario.id, calcResults);
                                } else {
                                    scenarioDb.saveBasecaseResults(model.id, calcResults);
                                }
                                const { db } = await __turbopack_context__.A("[project]/src/lib/supabaseData.ts [app-client] (ecmascript, async loader)");
                                db.updateModel(model.id, {
                                    run_status: 'current',
                                    last_run_at: new Date().toISOString()
                                });
                                if (hasErrors) {
                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(calcResults.errors[0]);
                                } else if (hasWarnings) {
                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].warning(`${calcResults.overLimitResources.length} resource(s) exceed utilization limit`);
                                } else {
                                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(mode === 'full' ? 'Full calculation complete — all production targets achievable' : 'Utilization calculation complete');
                                }
                                resolve();
                            } catch (err) {
                                setGlobalIsRunning(false);
                                const message = err && typeof err === 'object' && 'response' in err ? err.response?.data?.error : err instanceof Error ? err.message : 'Full calculate failed';
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(String(message));
                                reject(err);
                            }
                        }
                    }["useRunCalculation.useCallback[handleRun].runCalculation"];
                    setTimeout({
                        "useRunCalculation.useCallback[handleRun]": ()=>runCalculation()
                    }["useRunCalculation.useCallback[handleRun]"], 100);
                }
            }["useRunCalculation.useCallback[handleRun]"]);
        }
    }["useRunCalculation.useCallback[handleRun]"], [
        model,
        runScenario,
        setResults,
        setRunStatus,
        markCalculated
    ]);
    return {
        isRunning,
        runLog,
        verifyMessages,
        handleRun,
        clearVerifyMessages: ()=>setVerifyMessages(null)
    };
}
_s(useRunCalculation, "L0FsnfwgIFt/WZ1rj2zkXKq/jmQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$resultsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useResultsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$resultsStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useResultsStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
function getRunLog() {
    return _runLog;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useUserLevel.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "canAccess",
    ()=>canAccess,
    "isVisible",
    ()=>isVisible,
    "useUserLevelStore",
    ()=>useUserLevelStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
/**
 * Complete gating table — true means visible at that level.
 * Standard-gated: hidden for novice, visible for standard+advanced.
 * Advanced-gated: hidden for novice+standard, visible for advanced only.
 */ const GATING_TABLE = {
    // Standard-gated (novice: hidden, standard+advanced: visible)
    all_operations: {
        novice: false,
        standard: true,
        advanced: true
    },
    advanced_parameters: {
        novice: false,
        standard: true,
        advanced: true
    },
    calculate_util_only: {
        novice: false,
        standard: true,
        advanced: true
    },
    formula_builder: {
        novice: false,
        standard: true,
        advanced: true
    },
    oper_details: {
        novice: false,
        standard: true,
        advanced: true
    },
    parameter_names: {
        novice: false,
        standard: true,
        advanced: true
    },
    // Advanced-gated (novice+standard: hidden, advanced only)
    aggregate_products: {
        novice: false,
        standard: false,
        advanced: true
    },
    allow_edit_whatif: {
        novice: false,
        standard: false,
        advanced: true
    },
    whatif_families: {
        novice: false,
        standard: false,
        advanced: true
    },
    max_throughput: {
        novice: false,
        standard: false,
        advanced: true
    },
    lot_size_range: {
        novice: false,
        standard: false,
        advanced: true
    },
    optimise_lot_sizes: {
        novice: false,
        standard: false,
        advanced: true
    },
    product_inclusion: {
        novice: false,
        standard: false,
        advanced: true
    }
};
function isVisible(feature, level) {
    return GATING_TABLE[feature]?.[level] ?? false;
}
function canAccess(level, feature) {
    // Map old keys to new keys for backward compat during migration
    const keyMap = {
        'all-operations': 'all_operations',
        'advanced-params': 'advanced_parameters',
        'util-only-mode': 'calculate_util_only',
        'formula-builder': 'formula_builder',
        'oper-details': 'oper_details',
        'param-names': 'parameter_names',
        'inline-change-edit': 'allow_edit_whatif',
        'whatif-families': 'whatif_families',
        'product-inclusion': 'product_inclusion',
        'max-throughput': 'max_throughput',
        'optimize-lots': 'optimise_lot_sizes'
    };
    const mapped = keyMap[feature] || feature;
    return isVisible(mapped, level);
}
const useUserLevelStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        userLevel: 'standard',
        loading: true,
        fetchUserLevel: async ()=>{
            set({
                userLevel: 'standard',
                loading: false
            });
        },
        setUserLevel: async (level)=>{
            set({
                userLevel: level
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/resultsStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useResultsStore",
    ()=>useResultsStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
;
const useResultsStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/scenarioColors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Canonical scenario colours — used in the What-if list AND all Output charts.
 * Order matters: the i-th What-if (by creation order) gets SCENARIO_COLORS[i % length].
 */ __turbopack_context__.s([
    "SCENARIO_COLORS",
    ()=>SCENARIO_COLORS,
    "getScenarioColor",
    ()=>getScenarioColor
]);
const SCENARIO_COLORS = [
    '#3B82F6',
    '#22C55E',
    '#A855F7',
    '#F97316',
    '#14B8A6',
    '#F43F5E',
    '#6366F1',
    '#F59E0B'
];
function getScenarioColor(index) {
    return SCENARIO_COLORS[index % SCENARIO_COLORS.length];
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/calculationEngine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * RMT Calculation Engine
 * Implements Rapid Modeling Technology queuing theory formulas for
 * equipment/labor utilization, MCT, WIP, and queue times.
 */ __turbopack_context__.s([
    "calculate",
    ()=>calculate,
    "calculateGoodMade",
    ()=>calculateGoodMade,
    "calculateGoodShipped",
    ()=>calculateGoodShipped,
    "calculateScrap",
    ()=>calculateScrap,
    "calculateStarted",
    ()=>calculateStarted,
    "calculateUtilization",
    ()=>calculateUtilization,
    "calculateWip",
    ()=>calculateWip,
    "verifyData",
    ()=>verifyData
]);
function calculateStarted(demand, totalScrapRate) {
    // In this engine, `demand` is the effective demand into the routing
    // (after IBOM propagation). We invert the scrap relation so that:
    //   GoodMade = demand
    //   GoodMade = Started × (1 − totalScrapRate)
    // ⇒ Started = demand / (1 − totalScrapRate)
    if (totalScrapRate <= 0) return Math.round(demand);
    const safeRate = Math.min(totalScrapRate, 0.99);
    return Math.round(demand / (1 - safeRate));
}
function calculateGoodMade(started, totalScrapRate) {
    const safeRate = Math.min(Math.max(totalScrapRate, 0), 0.99);
    return Math.round(started * (1 - safeRate));
}
function calculateScrap(started, goodMade) {
    return Math.max(0, Math.round(started - goodMade));
}
function calculateGoodShipped(goodMade, demand) {
    return Math.round(Math.min(goodMade, demand));
}
function calculateWip(started, shipped, scrap) {
    return Math.max(0, Math.round(started - shipped - scrap));
}
function calculateUtilization(demand, cycleTime, machines, availableTime) {
    const load = demand * cycleTime;
    const capacity = machines * availableTime;
    if (capacity <= 0) return 0;
    return load / capacity;
}
// ── Scenario + Engine Helpers ──
/** Apply What-If scenario changes on top of basecase model, returning a virtual model snapshot */ function applyScenario(model, scenario) {
    if (!scenario || scenario.changes.length === 0) return model;
    // Deep clone relevant arrays
    const m = {
        ...model,
        labor: model.labor.map((l)=>({
                ...l
            })),
        equipment: model.equipment.map((e)=>({
                ...e
            })),
        products: model.products.map((p)=>({
                ...p
            })),
        operations: model.operations.map((o)=>({
                ...o
            })),
        routing: model.routing.map((r)=>({
                ...r
            }))
    };
    scenario.changes.forEach((c)=>{
        if (c.dataType === 'Labor') {
            const item = m.labor.find((l)=>l.id === c.entityId);
            if (item) item[c.field] = c.whatIfValue;
        } else if (c.dataType === 'Equipment') {
            const item = m.equipment.find((e)=>e.id === c.entityId);
            if (item) item[c.field] = c.whatIfValue;
        } else if (c.dataType === 'Product') {
            if (c.field === 'included' && String(c.whatIfValue) === 'false') {
                // Product exclusion: zero out demand
                const prod = m.products.find((p)=>p.id === c.entityId);
                if (prod) prod.demand = 0;
            } else {
                const item = m.products.find((p)=>p.id === c.entityId);
                if (item) item[c.field] = c.whatIfValue;
            }
        } else if (c.dataType === 'Routing') {
            const item = m.routing.find((r)=>r.id === c.entityId);
            if (item) item[c.field] = Number(c.whatIfValue);
        } else if (c.dataType === 'Product Inclusion') {
            // Legacy support: exclude products marked as 'No'
            if (c.whatIfValue === 'No') {
                const prod = m.products.find((p)=>p.id === c.entityId);
                if (prod) prod.demand = 0;
            }
        }
    });
    return m;
}
/** Compute IBOM-driven demand: total demand for each product including component demand from parents */ function computeEffectiveDemand(products, ibom, conv2) {
    // Build adjacency: parent → [{componentId, unitsPerAssy}]
    const children = new Map();
    ibom.forEach((entry)=>{
        const list = children.get(entry.parent_product_id) || [];
        list.push({
            componentId: entry.component_product_id,
            unitsPerAssy: entry.units_per_assy
        });
        children.set(entry.parent_product_id, list);
    });
    // Start with end demand × demand_factor for each product
    const demand = new Map();
    products.forEach((p)=>{
        const d = p.demand * p.demand_factor;
        demand.set(p.id, d);
    });
    // Topological propagation: parents push demand down to components
    // Simple iterative approach (works for DAGs without circular refs)
    const visited = new Set();
    const order = [];
    function visit(id) {
        if (visited.has(id)) return;
        visited.add(id);
        const kids = children.get(id) || [];
        kids.forEach((k)=>visit(k.componentId));
        order.push(id);
    }
    products.forEach((p)=>visit(p.id));
    order.reverse(); // parents first
    order.forEach((parentId)=>{
        const parentDemand = demand.get(parentId) || 0;
        const kids = children.get(parentId) || [];
        kids.forEach((k)=>{
            const prev = demand.get(k.componentId) || 0;
            demand.set(k.componentId, prev + parentDemand * k.unitsPerAssy);
        });
    });
    return demand;
}
function calculate(model, scenario = null) {
    const m = applyScenario(model, scenario);
    const g = m.general;
    const warnings = [];
    const errors = [];
    // Time conversions — guard against division by zero
    const conv1 = Math.max(g.conv1, 0.001); // ops time units per MCT time unit (e.g. 480 min/day)
    const conv2 = Math.max(g.conv2, 0.001); // MCT time units per prod period (e.g. 210 days/year)
    const opsPerPeriod = conv1 * conv2; // total ops time units per production period
    // Effective demand per product (units per production period, including IBOM propagation)
    const effectiveDemand = computeEffectiveDemand(m.products, m.ibom, conv2);
    // ── Equipment utilization ──
    const equipResults = [];
    const equipUtilMap = new Map(); // equipId → total utilization fraction (0-1)
    m.equipment.forEach((eq)=>{
        const isDelay = eq.equip_type === 'delay';
        const count = isDelay ? 1 : eq.count;
        if (count <= 0 && !isDelay) {
            equipResults.push({
                id: eq.id,
                name: eq.name,
                count: eq.count,
                setupUtil: 0,
                runUtil: 0,
                repairUtil: 0,
                waitLaborUtil: 0,
                totalUtil: 0,
                idle: 100,
                laborGroup: ''
            });
            equipUtilMap.set(eq.id, 0);
            return;
        }
        const overtimeFactor = 1 + eq.overtime_pct / 100;
        const unavailFactor = 1 - (eq.unavail_pct || 0) / 100;
        const availTime = count * overtimeFactor * unavailFactor * opsPerPeriod;
        // Repair utilization
        let repairFraction = 0;
        if (eq.mttf > 0 && eq.mttr > 0) {
            repairFraction = eq.mttr / (eq.mttf + eq.mttr);
        }
        const effectiveAvailTime = availTime * (1 - repairFraction);
        // Sum setup and run demands from all operations assigned to this equipment
        let totalSetupTime = 0;
        let totalRunTime = 0;
        m.operations.forEach((op)=>{
            if (op.equip_id !== eq.id) return;
            const product = m.products.find((p)=>p.id === op.product_id);
            if (!product) return;
            const demand = effectiveDemand.get(product.id) || 0;
            if (demand <= 0) return;
            const lotSize = Math.max(1, product.lot_size * product.lot_factor);
            const tbatchSize = product.tbatch_size === -1 ? lotSize : Math.max(1, product.tbatch_size);
            const numTbatches = Math.ceil(lotSize / tbatchSize);
            const assignFraction = op.pct_assigned / 100;
            const numLots = demand / lotSize * assignFraction;
            // Full setup time per lot = setup_lot + setup_piece * lotSize + setup_tbatch * numTbatches
            // Apply both equipment setup_factor AND product setup_factor
            const prodSetupFactor = product.setup_factor || 1;
            const setupPerLot = (op.equip_setup_lot + op.equip_setup_piece * lotSize + op.equip_setup_tbatch * numTbatches) * eq.setup_factor * prodSetupFactor;
            // Full run time per lot = run_piece * lotSize + run_lot + run_tbatch * numTbatches
            const runPerLot = (op.equip_run_piece * lotSize + op.equip_run_lot + op.equip_run_tbatch * numTbatches) * eq.run_factor;
            totalSetupTime += numLots * setupPerLot;
            totalRunTime += numLots * runPerLot;
        });
        const setupUtil = effectiveAvailTime > 0 ? totalSetupTime / effectiveAvailTime * 100 : 0;
        const runUtil = effectiveAvailTime > 0 ? totalRunTime / effectiveAvailTime * 100 : 0;
        const repairUtil = repairFraction * 100;
        // Wait-for-labor is computed after labor utilization
        const baseTotal = setupUtil + runUtil + repairUtil;
        equipUtilMap.set(eq.id, baseTotal / 100);
        const labor = m.labor.find((l)=>l.id === eq.labor_group_id);
        equipResults.push({
            id: eq.id,
            name: eq.name,
            count: eq.count,
            setupUtil: Math.round(setupUtil * 10) / 10,
            runUtil: Math.round(runUtil * 10) / 10,
            repairUtil: Math.round(repairUtil * 10) / 10,
            waitLaborUtil: 0,
            totalUtil: 0,
            idle: 0,
            laborGroup: labor?.name || ''
        });
    });
    // ── Labor utilization ──
    const laborResults = [];
    const laborUtilMap = new Map();
    m.labor.forEach((lab)=>{
        if (lab.count <= 0) {
            laborResults.push({
                id: lab.id,
                name: lab.name,
                count: lab.count,
                setupUtil: 0,
                runUtil: 0,
                unavailPct: lab.unavail_pct,
                totalUtil: lab.unavail_pct,
                idle: 100 - lab.unavail_pct
            });
            laborUtilMap.set(lab.id, 0);
            return;
        }
        const overtimeFactor = 1 + lab.overtime_pct / 100;
        const unavailFactor = 1 - lab.unavail_pct / 100;
        const availTime = lab.count * overtimeFactor * unavailFactor * opsPerPeriod;
        let totalSetupTime = 0;
        let totalRunTime = 0;
        m.operations.forEach((op)=>{
            const eq = m.equipment.find((e)=>e.id === op.equip_id);
            if (!eq || eq.labor_group_id !== lab.id) return;
            const product = m.products.find((p)=>p.id === op.product_id);
            if (!product) return;
            const demand = effectiveDemand.get(product.id) || 0;
            if (demand <= 0) return;
            const lotSize = Math.max(1, product.lot_size * product.lot_factor);
            const tbatchSize = product.tbatch_size === -1 ? lotSize : Math.max(1, product.tbatch_size);
            const numTbatches = Math.ceil(lotSize / tbatchSize);
            const assignFraction = op.pct_assigned / 100;
            const numLots = demand / lotSize * assignFraction;
            const prodSetupFactor = product.setup_factor || 1;
            const setupPerLot = (op.labor_setup_lot + op.labor_setup_piece * lotSize + op.labor_setup_tbatch * numTbatches) * lab.setup_factor * prodSetupFactor;
            const runPerLot = (op.labor_run_piece * lotSize + op.labor_run_lot + op.labor_run_tbatch * numTbatches) * lab.run_factor;
            totalSetupTime += numLots * setupPerLot;
            totalRunTime += numLots * runPerLot;
        });
        const setupUtil = availTime > 0 ? totalSetupTime / availTime * 100 : 0;
        const runUtil = availTime > 0 ? totalRunTime / availTime * 100 : 0;
        const workUtil = setupUtil + runUtil;
        laborUtilMap.set(lab.id, workUtil / 100);
        laborResults.push({
            id: lab.id,
            name: lab.name,
            count: lab.count,
            setupUtil: Math.round(setupUtil * 10) / 10,
            runUtil: Math.round(runUtil * 10) / 10,
            unavailPct: lab.unavail_pct,
            totalUtil: Math.round((workUtil + lab.unavail_pct) * 10) / 10,
            idle: Math.round((100 - workUtil - lab.unavail_pct) * 10) / 10
        });
    });
    // ── Wait-for-labor on equipment ──
    equipResults.forEach((er)=>{
        const eq = m.equipment.find((e)=>e.id === er.id);
        if (!eq || !eq.labor_group_id) return;
        const laborUtil = laborUtilMap.get(eq.labor_group_id) || 0;
        // Wait-for-labor approximation: proportional to labor utilization squared
        // WFL ≈ U_labor^2 / (1 - U_labor) × scaling, capped
        const safeLU = Math.min(laborUtil, 0.98);
        const wfl = safeLU > 0 ? safeLU * safeLU / (1 - safeLU) * (er.setupUtil + er.runUtil) / 100 * 15 : 0;
        er.waitLaborUtil = Math.round(Math.min(wfl, 30) * 10) / 10;
        er.totalUtil = Math.round((er.setupUtil + er.runUtil + er.repairUtil + er.waitLaborUtil) * 10) / 10;
        er.idle = Math.round(Math.max(0, 100 - er.totalUtil) * 10) / 10;
        // Update utilMap
        equipUtilMap.set(er.id, er.totalUtil / 100);
    });
    // ── Product MCT ──
    const productResults = [];
    const variabilityEq = g.var_equip / 100;
    const variabilityLab = g.var_labor / 100;
    const variabilityProd = g.var_prod / 100;
    m.products.forEach((product)=>{
        const demand = effectiveDemand.get(product.id) || 0;
        const lotSize = Math.max(1, product.lot_size * product.lot_factor);
        const tbatchSize = product.tbatch_size === -1 ? lotSize : Math.max(1, product.tbatch_size);
        // Get operations for this product
        const ops = m.operations.filter((o)=>o.product_id === product.id);
        if (ops.length === 0 || demand <= 0) {
            // No operations or no demand — product has minimal MCT
            productResults.push({
                id: product.id,
                name: product.name,
                demand,
                lotSize,
                goodMade: Math.round(demand),
                goodShipped: Math.round(product.demand * product.demand_factor),
                started: Math.round(demand),
                scrap: 0,
                wip: 0,
                mct: 0,
                mctLotWait: 0,
                mctQueue: 0,
                mctWaitLabor: 0,
                mctSetup: 0,
                mctRun: 0
            });
            return;
        }
        let totalSetupMCT = 0;
        let totalRunMCT = 0;
        let totalQueueMCT = 0;
        let totalLotWaitMCT = 0;
        let totalWaitLaborMCT = 0;
        let totalScrapFraction = 0;
        // Process each operation
        ops.forEach((op)=>{
            const eq = m.equipment.find((e)=>e.id === op.equip_id);
            if (!eq) return;
            const assignFrac = op.pct_assigned / 100;
            if (assignFrac <= 0) return;
            const numTbatches = Math.ceil(lotSize / tbatchSize);
            // Full setup/run time per lot including all components
            const prodSetupFactor = product.setup_factor || 1;
            const setupPerLot = (op.equip_setup_lot + op.equip_setup_piece * lotSize + op.equip_setup_tbatch * numTbatches) * eq.setup_factor * prodSetupFactor;
            const runPerLot = (op.equip_run_piece * lotSize + op.equip_run_lot + op.equip_run_tbatch * numTbatches) * eq.run_factor;
            // Per-piece equivalents for MCT
            const setupTime = setupPerLot / lotSize;
            const runTime = runPerLot / lotSize;
            // Convert to MCT time units
            const setupMCT = setupTime / conv1 * assignFrac;
            const runMCT = runTime / conv1 * assignFrac;
            totalSetupMCT += setupMCT;
            totalRunMCT += runMCT;
            // Lot waiting: (lotSize - tbatchSize) / lotSize * runTime per piece * lotSize / conv1
            if (product.gather_tbatches && tbatchSize < lotSize) {
                const lotWait = (lotSize - tbatchSize) * runTime / conv1 * assignFrac;
                totalLotWaitMCT += lotWait;
            }
            // Queue time — Kingman's formula
            const equipUtil = equipUtilMap.get(eq.id) || 0;
            const safeUtil = Math.min(equipUtil, 0.99);
            if (safeUtil > 0 && eq.equip_type !== 'delay') {
                const Ca2 = variabilityProd * variabilityProd * product.var_factor * product.var_factor;
                const Cs2 = variabilityEq * variabilityEq * eq.var_factor * eq.var_factor;
                const meanService = (setupTime + runTime) / conv1;
                const queueTime = (Ca2 + Cs2) / 2 * (safeUtil / (1 - safeUtil)) * meanService * assignFrac;
                totalQueueMCT += Math.max(0, queueTime);
            }
            // Wait-for-labor contribution
            if (eq.labor_group_id) {
                const laborUtil = laborUtilMap.get(eq.labor_group_id) || 0;
                const safeLU = Math.min(laborUtil, 0.98);
                if (safeLU > 0) {
                    const laborWait = safeLU * safeLU / (1 - safeLU) * (runTime / conv1) * 0.5 * assignFrac;
                    totalWaitLaborMCT += Math.max(0, laborWait);
                }
            }
        });
        // Routing-based scrap: look for routes to SCRAP
        const routesForProduct = m.routing.filter((r)=>r.product_id === product.id);
        routesForProduct.forEach((r)=>{
            if (r.to_op_name === 'SCRAP') {
                totalScrapFraction += r.pct_routed / 100;
            }
        });
        // Approximate: scrap is fraction of started pieces
        const scrapRate = Math.min(totalScrapFraction, 0.5);
        const totalMCT = totalSetupMCT + totalRunMCT + totalQueueMCT + totalLotWaitMCT + totalWaitLaborMCT;
        // Apply explicit product formulas:
        //   GoodMade = Started × (1 − ScrapRate)
        //   Scrap    = Started − GoodMade
        //   GoodShipped = min(GoodMade, EndDemand)
        //   WIP      = Started − GoodShipped − Scrap
        const started = calculateStarted(demand, scrapRate);
        const goodMade = calculateGoodMade(started, scrapRate);
        const scrap = calculateScrap(started, goodMade);
        const demandEnd = product.demand * product.demand_factor;
        const goodShipped = calculateGoodShipped(goodMade, demandEnd);
        const wip = calculateWip(started, goodShipped, scrap);
        productResults.push({
            id: product.id,
            name: product.name,
            demand,
            lotSize,
            goodMade,
            goodShipped,
            started,
            scrap,
            wip,
            mct: Math.round(totalMCT * 10000) / 10000,
            mctLotWait: Math.round(totalLotWaitMCT * 10000) / 10000,
            mctQueue: Math.round(totalQueueMCT * 10000) / 10000,
            mctWaitLabor: Math.round(totalWaitLaborMCT * 10000) / 10000,
            mctSetup: Math.round(totalSetupMCT * 10000) / 10000,
            mctRun: Math.round(totalRunMCT * 10000) / 10000
        });
    });
    // ── Over-limit warnings ──
    const overLimitResources = [];
    equipResults.forEach((er)=>{
        if (er.totalUtil > g.util_limit) {
            overLimitResources.push(`Equipment: ${er.name} (${er.totalUtil}%)`);
            warnings.push(`Equipment group "${er.name}" utilization (${er.totalUtil}%) exceeds limit (${g.util_limit}%)`);
        }
    });
    laborResults.forEach((lr)=>{
        if (lr.totalUtil > g.util_limit) {
            overLimitResources.push(`Labor: ${lr.name} (${lr.totalUtil}%)`);
            warnings.push(`Labor group "${lr.name}" utilization (${lr.totalUtil}%) exceeds limit (${g.util_limit}%)`);
        }
    });
    // Validation errors
    if (m.operations.length === 0) {
        errors.push('No operations defined. Add operations to products before running calculations.');
    }
    // Detect routing loops
    m.products.forEach((product)=>{
        const routes = m.routing.filter((r)=>r.product_id === product.id);
        const visited = new Set();
        const detectLoop = (opName, path)=>{
            if (visited.has(opName)) {
                warnings.push(`Product "${product.name}": routing loop detected (${[
                    ...path,
                    opName
                ].join(' → ')})`);
                return true;
            }
            visited.add(opName);
            const outgoing = routes.filter((r)=>r.from_op_name === opName);
            for (const r of outgoing){
                if (r.to_op_name !== 'STOCK' && r.to_op_name !== 'SCRAP') {
                    if (detectLoop(r.to_op_name, [
                        ...path,
                        opName
                    ])) return true;
                }
            }
            visited.delete(opName);
            return false;
        };
        detectLoop('DOCK', []);
    });
    // Sanitize all numeric results (prevent NaN/Infinity from reaching UI)
    const sanitize = (v)=>isFinite(v) && !isNaN(v) ? v : 0;
    equipResults.forEach((e)=>{
        e.setupUtil = sanitize(e.setupUtil);
        e.runUtil = sanitize(e.runUtil);
        e.repairUtil = sanitize(e.repairUtil);
        e.waitLaborUtil = sanitize(e.waitLaborUtil);
        e.totalUtil = sanitize(e.totalUtil);
        e.idle = sanitize(e.idle);
    });
    laborResults.forEach((l)=>{
        l.setupUtil = sanitize(l.setupUtil);
        l.runUtil = sanitize(l.runUtil);
        l.totalUtil = sanitize(l.totalUtil);
        l.idle = sanitize(l.idle);
    });
    productResults.forEach((p)=>{
        p.wip = sanitize(p.wip);
        p.mct = sanitize(p.mct);
        p.mctLotWait = sanitize(p.mctLotWait);
        p.mctQueue = sanitize(p.mctQueue);
        p.mctWaitLabor = sanitize(p.mctWaitLabor);
        p.mctSetup = sanitize(p.mctSetup);
        p.mctRun = sanitize(p.mctRun);
    });
    return {
        equipment: equipResults,
        labor: laborResults,
        products: productResults,
        warnings,
        errors,
        overLimitResources,
        calculatedAt: new Date().toISOString()
    };
}
function verifyData(model) {
    const errors = [];
    const warnings = [];
    if (model.labor.length === 0) warnings.push('No labor groups defined.');
    if (model.equipment.length === 0) warnings.push('No equipment groups defined.');
    if (model.products.length === 0) errors.push('No products defined.');
    if (model.operations.length === 0) errors.push('No operations defined for any product.');
    // Check equipment references valid labor
    model.equipment.forEach((eq)=>{
        if (eq.labor_group_id && !model.labor.find((l)=>l.id === eq.labor_group_id)) {
            errors.push(`Equipment "${eq.name}" references non-existent labor group.`);
        }
    });
    // Check operations reference valid equipment
    model.operations.forEach((op)=>{
        if (op.equip_id && !model.equipment.find((e)=>e.id === op.equip_id)) {
            errors.push(`Operation "${op.op_name}" references non-existent equipment.`);
        }
    });
    // Check products with demand but no operations
    model.products.forEach((p)=>{
        if (p.demand > 0 && !model.operations.find((o)=>o.product_id === p.id)) {
            warnings.push(`Product "${p.name}" has demand but no operations.`);
        }
    });
    // Check routing percentages sum to 100
    const productIds = [
        ...new Set(model.routing.map((r)=>r.product_id))
    ];
    productIds.forEach((pid)=>{
        const routes = model.routing.filter((r)=>r.product_id === pid);
        const fromOps = [
            ...new Set(routes.map((r)=>r.from_op_name))
        ];
        fromOps.forEach((fromOp)=>{
            const outgoing = routes.filter((r)=>r.from_op_name === fromOp);
            const total = outgoing.reduce((s, r)=>s + r.pct_routed, 0);
            if (Math.abs(total - 100) > 0.1) {
                const product = model.products.find((p)=>p.id === pid);
                warnings.push(`Product "${product?.name}": routing from "${fromOp}" sums to ${total}%, not 100%.`);
            }
        });
    });
    return {
        errors,
        warnings
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_8d378dac._.js.map