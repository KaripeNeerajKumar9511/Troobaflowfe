(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/csrf.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCSRFToken",
    ()=>clearCSRFToken,
    "getCSRFToken",
    ()=>getCSRFToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
function getCSRFToken() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("csrftoken");
}
function clearCSRFToken() {
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove("csrftoken");
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "ensureCsrfCookie",
    ()=>ensureCsrfCookie
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$csrf$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/csrf.ts [app-client] (ecmascript)");
;
;
const baseURL = ("TURBOPACK compile-time truthy", 1) ? ("TURBOPACK compile-time value", "http://localhost:8000") || "http://localhost:8000" : "TURBOPACK unreachable";
const api = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL,
    withCredentials: true,
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken"
});
api.interceptors.request.use((config)=>{
    const method = (config.method ?? "").toLowerCase();
    if ([
        "post",
        "put",
        "patch",
        "delete"
    ].includes(method)) {
        const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$csrf$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCSRFToken"])();
        if (token) config.headers.set("X-CSRFToken", token);
    }
    return config;
});
// Redirect to login when API returns 401 (session invalid/expired or not sent)
api.interceptors.response.use((res)=>res, (err)=>{
    if (err?.response?.status === 401 && ("TURBOPACK compile-time value", "object") !== "undefined") {
        const path = window.location.pathname;
        if (!path.startsWith("/login") && !path.startsWith("/signup")) {
            window.location.href = "/login";
        }
    }
    return Promise.reject(err);
});
async function ensureCsrfCookie() {
    await api.get("/api/csrf/");
}
const __TURBOPACK__default__export__ = api;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/frontendOnly.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * When true, dashboard uses only in-memory / demo data and does not call the backend API.
 * All dashboard/* pages work without a running backend (no 500s, no network calls).
 *
 * To use the backend when it's ready: set NEXT_PUBLIC_USE_FRONTEND_ONLY=false in .env.local
 */ __turbopack_context__.s([
    "USE_FRONTEND_ONLY",
    ()=>USE_FRONTEND_ONLY
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const USE_FRONTEND_ONLY = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] !== 'undefined' && ("TURBOPACK compile-time value", "false") !== 'false';
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/backendClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createVersion",
    ()=>createVersion,
    "db",
    ()=>db,
    "deleteVersion",
    ()=>deleteVersion,
    "ensureBasecaseScenario",
    ()=>ensureBasecaseScenario,
    "fetchAllModels",
    ()=>fetchAllModels,
    "getModel",
    ()=>getModel,
    "getParamNames",
    ()=>getParamNames,
    "getParamNamesAsync",
    ()=>getParamNamesAsync,
    "getVersionSnapshot",
    ()=>getVersionSnapshot,
    "getVersions",
    ()=>getVersions,
    "loadBasecaseResults",
    ()=>loadBasecaseResults,
    "loadScenariosForModel",
    ()=>loadScenariosForModel,
    "restoreVersionToModel",
    ()=>restoreVersionToModel,
    "saveFullModelToDB",
    ()=>saveFullModelToDB,
    "scenarioDb",
    ()=>scenarioDb,
    "seedDemoModelToDB",
    ()=>seedDemoModelToDB,
    "updateVersionLabel",
    ()=>updateVersionLabel
]);
/**
 * Backend data layer — all CRUD and data access via Django backend API.
 * When USE_FRONTEND_ONLY is true, no API calls are made; dashboard uses in-memory state only.
 * See docs/BACKEND_API.md.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/frontendOnly.ts [app-client] (ecmascript)");
;
;
const BASE = '/api';
async function fetchAllModels() {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return [];
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE}/models/`);
    return Array.isArray(data) ? data : [];
}
async function getModel(id) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return null;
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE}/models/${id}/`);
    return data ?? null;
}
async function saveFullModelToDB(model) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
    const existing = await getModel(model.id);
    if (existing) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put(`${BASE}/models/${model.id}/save/`, model);
    } else {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/`, model);
    }
}
async function seedDemoModelToDB() {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
    const { createDemoModel } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
    const demo = createDemoModel();
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/seed-demo/`, demo);
}
function getParamNames(modelId) {
    return null;
}
async function getParamNamesAsync(modelId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return null;
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE}/models/${modelId}/param-names/`);
    return data ?? null;
}
async function getVersions(modelId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return [];
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE}/models/${modelId}/versions/`);
    return Array.isArray(data) ? data : [];
}
async function createVersion(modelId, label, snapshot) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return crypto.randomUUID();
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/versions/create/`, {
        label,
        snapshot
    });
    return data.id;
}
async function getVersionSnapshot(versionId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return null;
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE}/versions/${versionId}/`);
    return data ?? null;
}
async function updateVersionLabel(versionId, label) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/versions/${versionId}/patch/`, {
        label
    });
}
async function deleteVersion(versionId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/versions/${versionId}/delete/`);
}
async function restoreVersionToModel(versionId, modelId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return null;
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/versions/${versionId}/restore/`);
    return data ?? null;
}
const db = {
    async updateModel (id, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/models/${id}/patch/`, data);
    },
    async deleteModel (id) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/models/${id}/delete/`);
    },
    async upsertParamNames (modelId, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put(`${BASE}/models/${modelId}/param-names/upsert/`, data);
    },
    async updateGeneral (modelId, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/models/${modelId}/general/`, data);
    },
    async insertLabor (modelId, l) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/labor/`, l);
    },
    async updateLabor (id, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        // Backend needs modelId; we don't have it from labor id. Caller must pass modelId in store. Use PATCH with labor id.
        // Backend URL is PATCH /api/models/:modelId/labor/:laborId/ - we need modelId. So db.updateLabor is called with just id.
        // In modelStore, updateLabor is called with (modelId, laborId, data). So we need modelId in db object. Check usage.
        // backendClient db is used from modelStore which has modelId in scope. So we need to change db to accept modelId for updateLabor.
        // Looking at BACKEND_API: PATCH /api/models/:id/labor/:laborId. So we need modelId. The current signature is updateLabor(id, data) where id is labor id.
        // So the store must pass modelId. Let me check modelStore updateLabor usage.
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/models/${modelId}/labor/${id}/`, data);
    },
    async deleteLabor (id) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/models/${modelId}/labor/${id}/delete/`);
    },
    async insertEquipment (modelId, e) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/equipment/`, e);
    },
    async updateEquipment (id, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/models/${modelId}/equipment/${id}/`, data);
    },
    async deleteEquipment (id) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/models/${modelId}/equipment/${id}/delete/`);
    },
    async insertProduct (modelId, p) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/products/`, p);
    },
    async updateProduct (id, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/models/${modelId}/products/${id}/`, data);
    },
    async deleteProduct (modelId, productId) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/models/${modelId}/products/${productId}/delete/`);
    },
    async insertOperation (modelId, o) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/operations/`, o);
    },
    async updateOperation (id, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/models/${modelId}/operations/${id}/`, data);
    },
    async deleteOperation (modelId, opId, _opName, productId) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/models/${modelId}/operations/${opId}/delete/`);
    },
    async insertRouting (modelId, r, _operations) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/routing/`, r);
    },
    async updateRouting (id, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/models/${modelId}/routing/${id}/`, data);
    },
    async deleteRouting (id) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/models/${modelId}/routing/${id}/delete/`);
    },
    async setRouting (modelId, productId, entries, _operations) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put(`${BASE}/models/${modelId}/routing/set/`, {
            productId,
            entries
        });
    },
    async insertIBOM (modelId, entry) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/ibom/`, entry);
    },
    async updateIBOM (id, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/models/${modelId}/ibom/entry/${id}/`, data);
    },
    async deleteIBOM (id) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        const { useModelStore } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
        const modelId = useModelStore.getState().activeModelId;
        if (modelId) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/models/${modelId}/ibom/entry/${id}/delete/`);
    },
    async setIBOMForParent (modelId, parentId, entries) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put(`${BASE}/models/${modelId}/ibom/${parentId}/`, entries);
    },
    async clearProductOperationsAndRouting (modelId, productId) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/models/${modelId}/products/${productId}/operations-and-routing/`);
    }
};
async function loadScenariosForModel(modelId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return {
        scenarios: [],
        results: {}
    };
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE}/models/${modelId}/scenarios/`);
    return {
        scenarios: data?.scenarios ?? [],
        results: data?.results ?? {}
    };
}
async function loadBasecaseResults(modelId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return null;
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE}/models/${modelId}/scenarios/basecase/results/`);
    return data ?? null;
}
async function ensureBasecaseScenario(modelId) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return crypto.randomUUID();
    const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/scenarios/basecase/`);
    return data.id;
}
const scenarioDb = {
    async create (modelId, name, description) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return crypto.randomUUID();
        const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${BASE}/models/${modelId}/scenarios/`, {
            name,
            description
        });
        return data?.id ?? null;
    },
    async update (id, data) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE}/scenarios/${id}/`, data);
    },
    async delete (id) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/scenarios/${id}/delete/`);
    },
    async upsertChange (scenarioId, change) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put(`${BASE}/scenarios/${scenarioId}/changes/`, {
            id: change.id,
            dataType: change.dataType,
            entityId: change.entityId,
            entityName: change.entityName,
            field: change.field,
            fieldLabel: change.fieldLabel,
            basecaseValue: change.basecaseValue,
            whatIfValue: change.whatIfValue
        });
    },
    async removeChange (scenarioId, changeId) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE}/scenarios/${scenarioId}/changes/${changeId}/delete/`);
    },
    async saveResults (scenarioId, results) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put(`${BASE}/scenarios/${scenarioId}/results/`, results);
    },
    async saveBasecaseResults (modelId, results) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put(`${BASE}/models/${modelId}/scenarios/basecase/results/`, results);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabaseData.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * Models & versions data layer.
 * Implemented in backendClient.ts (in-memory by default).
 * To use your backend: replace the implementation in src/lib/backendClient.ts
 * with your API calls. See docs/BACKEND_API.md.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/backendClient.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/modelStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createDemoModel",
    ()=>createDemoModel,
    "defaultParamNames",
    ()=>defaultParamNames,
    "useModelStore",
    ()=>useModelStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/supabaseData.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/backendClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/frontendOnly.ts [app-client] (ecmascript)");
;
;
;
const uid = ()=>crypto.randomUUID();
const ACTIVE_MODEL_STORAGE_KEY = 'rmct_active_model_id';
const defaultOpTimes = {
    equip_setup_piece: 0,
    equip_setup_tbatch: 0,
    equip_run_lot: 0,
    equip_run_tbatch: 0,
    labor_setup_piece: 0,
    labor_setup_tbatch: 0,
    labor_run_lot: 0,
    labor_run_tbatch: 0,
    oper1: 0,
    oper2: 0,
    oper3: 0,
    oper4: 0
};
const defaultParamNames = {
    gen1_name: 'Gen1',
    gen2_name: 'Gen2',
    gen3_name: 'Gen3',
    gen4_name: 'Gen4',
    lab1_name: 'Lab1',
    lab2_name: 'Lab2',
    lab3_name: 'Lab3',
    lab4_name: 'Lab4',
    eq1_name: 'Eq1',
    eq2_name: 'Eq2',
    eq3_name: 'Eq3',
    eq4_name: 'Eq4',
    prod1_name: 'Prod1',
    prod2_name: 'Prod2',
    prod3_name: 'Prod3',
    prod4_name: 'Prod4',
    oper1_name: 'Oper1',
    oper2_name: 'Oper2',
    oper3_name: 'Oper3',
    oper4_name: 'Oper4'
};
const defaultParamVals = {
    lab1: 0,
    lab2: 0,
    lab3: 0,
    lab4: 0
};
const defaultEqParams = {
    eq1: 0,
    eq2: 0,
    eq3: 0,
    eq4: 0
};
const defaultProdParams = {
    prod1: 0,
    prod2: 0,
    prod3: 0,
    prod4: 0
};
// ─── Hub routing helper ─────────────────────────────────────────────
function createHubRouting(productId) {
    return [
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'DOCK',
            to_op_name: 'BENCH',
            pct_routed: 100
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'BENCH',
            to_op_name: 'RFTURN',
            pct_routed: 100
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'RFTURN',
            to_op_name: 'DEBURR',
            pct_routed: 100
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'DEBURR',
            to_op_name: 'FNTURN',
            pct_routed: 100
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'FNTURN',
            to_op_name: 'INSPECT',
            pct_routed: 100
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'INSPECT',
            to_op_name: 'SLOT',
            pct_routed: 85
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'INSPECT',
            to_op_name: 'REWORK',
            pct_routed: 10
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'INSPECT',
            to_op_name: 'SCRAP',
            pct_routed: 5
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'REWORK',
            to_op_name: 'INSPECT',
            pct_routed: 80
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'REWORK',
            to_op_name: 'SCRAP',
            pct_routed: 20
        },
        {
            id: uid(),
            product_id: productId,
            from_op_name: 'SLOT',
            to_op_name: 'STOCK',
            pct_routed: 100
        }
    ];
}
function createDemoModel() {
    const laborIds = {
        PREP: uid(),
        MACHINST: uid(),
        INSPECTR: uid(),
        REPAIR: uid()
    };
    const equipIds = {
        BENCH: uid(),
        VT_LATHE: uid(),
        DEBURR: uid(),
        INSPECT: uid(),
        REWORK: uid(),
        MILL: uid(),
        DRILL: uid()
    };
    const prodIds = {
        HUB1: uid(),
        HUB2: uid(),
        HUB3: uid(),
        HUB4: uid(),
        SLEEVE: uid(),
        MOUNT: uid(),
        BRACKET: uid(),
        BOLT: uid()
    };
    return {
        id: uid(),
        name: 'Hub Manufacturing Cell — Demo',
        description: 'Classic MPX tutorial example. A hub manufacturing cell with 4 hub products, sleeves, mounts, brackets, and bolts.',
        tags: [
            'Demo',
            'Tutorial'
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_run_at: null,
        run_status: 'never_run',
        is_archived: false,
        is_demo: true,
        is_starred: true,
        general: {
            model_title: 'Hub Manufacturing Cell',
            ops_time_unit: 'MIN',
            mct_time_unit: 'DAY',
            prod_period_unit: 'YEAR',
            conv1: 480,
            conv2: 210,
            util_limit: 95,
            var_equip: 30,
            var_labor: 30,
            var_prod: 30,
            gen1: 0,
            gen2: 0,
            gen3: 0,
            gen4: 0,
            author: 'RapidMCT Demo',
            comments: 'Based on the Hub Manufacturing Cell example from the MPX manual.'
        },
        param_names: {
            ...defaultParamNames
        },
        labor: [
            {
                id: laborIds.PREP,
                name: 'PREP',
                count: 4,
                overtime_pct: 0,
                unavail_pct: 5,
                dept_code: '',
                prioritize_use: false,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultParamVals,
                comments: 'Preparation workers'
            },
            {
                id: laborIds.MACHINST,
                name: 'MACHINST',
                count: 12,
                overtime_pct: 0,
                unavail_pct: 5,
                dept_code: '',
                prioritize_use: false,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultParamVals,
                comments: 'Machinists'
            },
            {
                id: laborIds.INSPECTR,
                name: 'INSPECTR',
                count: 3,
                overtime_pct: 0,
                unavail_pct: 5,
                dept_code: '',
                prioritize_use: false,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultParamVals,
                comments: 'Inspectors'
            },
            {
                id: laborIds.REPAIR,
                name: 'REPAIR',
                count: 3,
                overtime_pct: 0,
                unavail_pct: 10,
                dept_code: '',
                prioritize_use: false,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultParamVals,
                comments: 'Repair workers'
            }
        ],
        equipment: [
            {
                id: equipIds.BENCH,
                name: 'BENCH',
                equip_type: 'standard',
                count: 4,
                mttf: 0,
                mttr: 0,
                overtime_pct: 0,
                labor_group_id: laborIds.PREP,
                dept_code: '',
                out_of_area: false,
                unavail_pct: 0,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultEqParams,
                comments: 'Prep bench'
            },
            {
                id: equipIds.VT_LATHE,
                name: 'VT_LATHE',
                equip_type: 'standard',
                count: 7,
                mttf: 600,
                mttr: 60,
                overtime_pct: 0,
                labor_group_id: laborIds.MACHINST,
                dept_code: '',
                out_of_area: false,
                unavail_pct: 0,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultEqParams,
                comments: 'Vertical lathes'
            },
            {
                id: equipIds.DEBURR,
                name: 'DEBURR',
                equip_type: 'standard',
                count: 3,
                mttf: 0,
                mttr: 0,
                overtime_pct: 0,
                labor_group_id: laborIds.REPAIR,
                dept_code: '',
                out_of_area: false,
                unavail_pct: 0,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultEqParams,
                comments: 'Deburr stations'
            },
            {
                id: equipIds.INSPECT,
                name: 'INSPECT',
                equip_type: 'standard',
                count: 3,
                mttf: 0,
                mttr: 0,
                overtime_pct: 0,
                labor_group_id: laborIds.INSPECTR,
                dept_code: '',
                out_of_area: false,
                unavail_pct: 0,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultEqParams,
                comments: 'Inspection stations'
            },
            {
                id: equipIds.REWORK,
                name: 'REWORK',
                equip_type: 'standard',
                count: 2,
                mttf: 0,
                mttr: 0,
                overtime_pct: 0,
                labor_group_id: laborIds.REPAIR,
                dept_code: '',
                out_of_area: false,
                unavail_pct: 0,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultEqParams,
                comments: 'Rework area'
            },
            {
                id: equipIds.MILL,
                name: 'MILL',
                equip_type: 'standard',
                count: 3,
                mttf: 480,
                mttr: 30,
                overtime_pct: 0,
                labor_group_id: laborIds.MACHINST,
                dept_code: '',
                out_of_area: false,
                unavail_pct: 0,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultEqParams,
                comments: 'Milling machines'
            },
            {
                id: equipIds.DRILL,
                name: 'DRILL',
                equip_type: 'standard',
                count: 8,
                mttf: 0,
                mttr: 0,
                overtime_pct: 0,
                labor_group_id: laborIds.MACHINST,
                dept_code: '',
                out_of_area: false,
                unavail_pct: 0,
                setup_factor: 1,
                run_factor: 1,
                var_factor: 1,
                ...defaultEqParams,
                comments: 'Drill presses'
            }
        ],
        products: [
            {
                id: prodIds.HUB1,
                name: 'HUB1',
                demand: 5000,
                lot_size: 40,
                tbatch_size: -1,
                demand_factor: 1,
                lot_factor: 1,
                var_factor: 1,
                setup_factor: 1,
                make_to_stock: false,
                gather_tbatches: true,
                dept_code: 'Hubs',
                ...defaultProdParams,
                comments: 'Hub variant 1'
            },
            {
                id: prodIds.HUB2,
                name: 'HUB2',
                demand: 4000,
                lot_size: 40,
                tbatch_size: -1,
                demand_factor: 1,
                lot_factor: 1,
                var_factor: 1,
                setup_factor: 1,
                make_to_stock: false,
                gather_tbatches: true,
                dept_code: 'Hubs',
                ...defaultProdParams,
                comments: 'Hub variant 2'
            },
            {
                id: prodIds.HUB3,
                name: 'HUB3',
                demand: 3000,
                lot_size: 40,
                tbatch_size: -1,
                demand_factor: 1,
                lot_factor: 1,
                var_factor: 1,
                setup_factor: 1,
                make_to_stock: false,
                gather_tbatches: true,
                dept_code: 'Hubs',
                ...defaultProdParams,
                comments: 'Hub variant 3'
            },
            {
                id: prodIds.HUB4,
                name: 'HUB4',
                demand: 2500,
                lot_size: 40,
                tbatch_size: -1,
                demand_factor: 1,
                lot_factor: 1,
                var_factor: 1,
                setup_factor: 1,
                make_to_stock: false,
                gather_tbatches: true,
                dept_code: 'Hubs',
                ...defaultProdParams,
                comments: 'Hub variant 4'
            },
            {
                id: prodIds.SLEEVE,
                name: 'SLEEVE',
                demand: 0,
                lot_size: 40,
                tbatch_size: -1,
                demand_factor: 1,
                lot_factor: 1,
                var_factor: 1,
                setup_factor: 1,
                make_to_stock: false,
                gather_tbatches: true,
                dept_code: 'Components',
                ...defaultProdParams,
                comments: 'Sleeve component'
            },
            {
                id: prodIds.MOUNT,
                name: 'MOUNT',
                demand: 0,
                lot_size: 80,
                tbatch_size: -1,
                demand_factor: 1,
                lot_factor: 1,
                var_factor: 1,
                setup_factor: 1,
                make_to_stock: false,
                gather_tbatches: true,
                dept_code: 'Components',
                ...defaultProdParams,
                comments: 'Mount assembly'
            },
            {
                id: prodIds.BRACKET,
                name: 'BRACKET',
                demand: 0,
                lot_size: 1000,
                tbatch_size: -1,
                demand_factor: 1,
                lot_factor: 1,
                var_factor: 1,
                setup_factor: 1,
                make_to_stock: false,
                gather_tbatches: true,
                dept_code: 'Components',
                ...defaultProdParams,
                comments: 'Bracket component'
            },
            {
                id: prodIds.BOLT,
                name: 'BOLT',
                demand: 0,
                lot_size: 1000,
                tbatch_size: -1,
                demand_factor: 1,
                lot_factor: 1,
                var_factor: 1,
                setup_factor: 1,
                make_to_stock: false,
                gather_tbatches: true,
                dept_code: 'Components',
                ...defaultProdParams,
                comments: 'Bolt component'
            }
        ],
        operations: [
            // HUB1
            {
                id: uid(),
                product_id: prodIds.HUB1,
                op_name: 'DOCK',
                op_number: 10,
                equip_id: '',
                pct_assigned: 100,
                equip_setup_lot: 0,
                equip_run_piece: 0,
                labor_setup_lot: 0,
                labor_run_piece: 0,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB1,
                op_name: 'BENCH',
                op_number: 20,
                equip_id: equipIds.BENCH,
                pct_assigned: 100,
                equip_setup_lot: 30,
                equip_run_piece: 5,
                labor_setup_lot: 30,
                labor_run_piece: 5,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB1,
                op_name: 'RFTURN',
                op_number: 30,
                equip_id: equipIds.VT_LATHE,
                pct_assigned: 100,
                equip_setup_lot: 45,
                equip_run_piece: 8,
                labor_setup_lot: 45,
                labor_run_piece: 8,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB1,
                op_name: 'DEBURR',
                op_number: 40,
                equip_id: equipIds.DEBURR,
                pct_assigned: 100,
                equip_setup_lot: 10,
                equip_run_piece: 3,
                labor_setup_lot: 10,
                labor_run_piece: 3,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB1,
                op_name: 'FNTURN',
                op_number: 50,
                equip_id: equipIds.VT_LATHE,
                pct_assigned: 100,
                equip_setup_lot: 45,
                equip_run_piece: 12,
                labor_setup_lot: 45,
                labor_run_piece: 12,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB1,
                op_name: 'INSPECT',
                op_number: 60,
                equip_id: equipIds.INSPECT,
                pct_assigned: 100,
                equip_setup_lot: 15,
                equip_run_piece: 4,
                labor_setup_lot: 15,
                labor_run_piece: 4,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB1,
                op_name: 'REWORK',
                op_number: 70,
                equip_id: equipIds.REWORK,
                pct_assigned: 100,
                equip_setup_lot: 20,
                equip_run_piece: 6,
                labor_setup_lot: 20,
                labor_run_piece: 6,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB1,
                op_name: 'SLOT',
                op_number: 80,
                equip_id: equipIds.MILL,
                pct_assigned: 100,
                equip_setup_lot: 30,
                equip_run_piece: 7,
                labor_setup_lot: 30,
                labor_run_piece: 7,
                ...defaultOpTimes
            },
            // HUB2
            {
                id: uid(),
                product_id: prodIds.HUB2,
                op_name: 'DOCK',
                op_number: 10,
                equip_id: '',
                pct_assigned: 100,
                equip_setup_lot: 0,
                equip_run_piece: 0,
                labor_setup_lot: 0,
                labor_run_piece: 0,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB2,
                op_name: 'BENCH',
                op_number: 20,
                equip_id: equipIds.BENCH,
                pct_assigned: 100,
                equip_setup_lot: 30,
                equip_run_piece: 5,
                labor_setup_lot: 30,
                labor_run_piece: 5,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB2,
                op_name: 'RFTURN',
                op_number: 30,
                equip_id: equipIds.VT_LATHE,
                pct_assigned: 100,
                equip_setup_lot: 45,
                equip_run_piece: 8,
                labor_setup_lot: 45,
                labor_run_piece: 8,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB2,
                op_name: 'DEBURR',
                op_number: 40,
                equip_id: equipIds.DEBURR,
                pct_assigned: 100,
                equip_setup_lot: 10,
                equip_run_piece: 3,
                labor_setup_lot: 10,
                labor_run_piece: 3,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB2,
                op_name: 'FNTURN',
                op_number: 50,
                equip_id: equipIds.VT_LATHE,
                pct_assigned: 100,
                equip_setup_lot: 45,
                equip_run_piece: 12,
                labor_setup_lot: 45,
                labor_run_piece: 12,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB2,
                op_name: 'INSPECT',
                op_number: 60,
                equip_id: equipIds.INSPECT,
                pct_assigned: 100,
                equip_setup_lot: 15,
                equip_run_piece: 4,
                labor_setup_lot: 15,
                labor_run_piece: 4,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB2,
                op_name: 'REWORK',
                op_number: 70,
                equip_id: equipIds.REWORK,
                pct_assigned: 100,
                equip_setup_lot: 20,
                equip_run_piece: 6,
                labor_setup_lot: 20,
                labor_run_piece: 6,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB2,
                op_name: 'SLOT',
                op_number: 80,
                equip_id: equipIds.MILL,
                pct_assigned: 100,
                equip_setup_lot: 30,
                equip_run_piece: 7,
                labor_setup_lot: 30,
                labor_run_piece: 7,
                ...defaultOpTimes
            },
            // HUB3
            {
                id: uid(),
                product_id: prodIds.HUB3,
                op_name: 'DOCK',
                op_number: 10,
                equip_id: '',
                pct_assigned: 100,
                equip_setup_lot: 0,
                equip_run_piece: 0,
                labor_setup_lot: 0,
                labor_run_piece: 0,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB3,
                op_name: 'BENCH',
                op_number: 20,
                equip_id: equipIds.BENCH,
                pct_assigned: 100,
                equip_setup_lot: 30,
                equip_run_piece: 5,
                labor_setup_lot: 30,
                labor_run_piece: 5,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB3,
                op_name: 'RFTURN',
                op_number: 30,
                equip_id: equipIds.VT_LATHE,
                pct_assigned: 100,
                equip_setup_lot: 45,
                equip_run_piece: 8,
                labor_setup_lot: 45,
                labor_run_piece: 8,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB3,
                op_name: 'DEBURR',
                op_number: 40,
                equip_id: equipIds.DEBURR,
                pct_assigned: 100,
                equip_setup_lot: 10,
                equip_run_piece: 3,
                labor_setup_lot: 10,
                labor_run_piece: 3,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB3,
                op_name: 'FNTURN',
                op_number: 50,
                equip_id: equipIds.VT_LATHE,
                pct_assigned: 100,
                equip_setup_lot: 45,
                equip_run_piece: 12,
                labor_setup_lot: 45,
                labor_run_piece: 12,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB3,
                op_name: 'INSPECT',
                op_number: 60,
                equip_id: equipIds.INSPECT,
                pct_assigned: 100,
                equip_setup_lot: 15,
                equip_run_piece: 4,
                labor_setup_lot: 15,
                labor_run_piece: 4,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB3,
                op_name: 'REWORK',
                op_number: 70,
                equip_id: equipIds.REWORK,
                pct_assigned: 100,
                equip_setup_lot: 20,
                equip_run_piece: 6,
                labor_setup_lot: 20,
                labor_run_piece: 6,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB3,
                op_name: 'SLOT',
                op_number: 80,
                equip_id: equipIds.MILL,
                pct_assigned: 100,
                equip_setup_lot: 30,
                equip_run_piece: 7,
                labor_setup_lot: 30,
                labor_run_piece: 7,
                ...defaultOpTimes
            },
            // HUB4
            {
                id: uid(),
                product_id: prodIds.HUB4,
                op_name: 'DOCK',
                op_number: 10,
                equip_id: '',
                pct_assigned: 100,
                equip_setup_lot: 0,
                equip_run_piece: 0,
                labor_setup_lot: 0,
                labor_run_piece: 0,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB4,
                op_name: 'BENCH',
                op_number: 20,
                equip_id: equipIds.BENCH,
                pct_assigned: 100,
                equip_setup_lot: 30,
                equip_run_piece: 5,
                labor_setup_lot: 30,
                labor_run_piece: 5,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB4,
                op_name: 'RFTURN',
                op_number: 30,
                equip_id: equipIds.VT_LATHE,
                pct_assigned: 100,
                equip_setup_lot: 45,
                equip_run_piece: 8,
                labor_setup_lot: 45,
                labor_run_piece: 8,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB4,
                op_name: 'DEBURR',
                op_number: 40,
                equip_id: equipIds.DEBURR,
                pct_assigned: 100,
                equip_setup_lot: 10,
                equip_run_piece: 3,
                labor_setup_lot: 10,
                labor_run_piece: 3,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB4,
                op_name: 'FNTURN',
                op_number: 50,
                equip_id: equipIds.VT_LATHE,
                pct_assigned: 100,
                equip_setup_lot: 45,
                equip_run_piece: 12,
                labor_setup_lot: 45,
                labor_run_piece: 12,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB4,
                op_name: 'INSPECT',
                op_number: 60,
                equip_id: equipIds.INSPECT,
                pct_assigned: 100,
                equip_setup_lot: 15,
                equip_run_piece: 4,
                labor_setup_lot: 15,
                labor_run_piece: 4,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB4,
                op_name: 'REWORK',
                op_number: 70,
                equip_id: equipIds.REWORK,
                pct_assigned: 100,
                equip_setup_lot: 20,
                equip_run_piece: 6,
                labor_setup_lot: 20,
                labor_run_piece: 6,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.HUB4,
                op_name: 'SLOT',
                op_number: 80,
                equip_id: equipIds.MILL,
                pct_assigned: 100,
                equip_setup_lot: 30,
                equip_run_piece: 7,
                labor_setup_lot: 30,
                labor_run_piece: 7,
                ...defaultOpTimes
            },
            // SLEEVE
            {
                id: uid(),
                product_id: prodIds.SLEEVE,
                op_name: 'DOCK',
                op_number: 10,
                equip_id: '',
                pct_assigned: 100,
                equip_setup_lot: 0,
                equip_run_piece: 0,
                labor_setup_lot: 0,
                labor_run_piece: 0,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.SLEEVE,
                op_name: 'TURN',
                op_number: 20,
                equip_id: equipIds.DRILL,
                pct_assigned: 100,
                equip_setup_lot: 20,
                equip_run_piece: 2,
                labor_setup_lot: 20,
                labor_run_piece: 2,
                ...defaultOpTimes
            },
            // MOUNT
            {
                id: uid(),
                product_id: prodIds.MOUNT,
                op_name: 'DOCK',
                op_number: 10,
                equip_id: '',
                pct_assigned: 100,
                equip_setup_lot: 0,
                equip_run_piece: 0,
                labor_setup_lot: 0,
                labor_run_piece: 0,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.MOUNT,
                op_name: 'ASSEMBLE',
                op_number: 20,
                equip_id: equipIds.BENCH,
                pct_assigned: 100,
                equip_setup_lot: 20,
                equip_run_piece: 2,
                labor_setup_lot: 20,
                labor_run_piece: 2,
                ...defaultOpTimes
            },
            // BRACKET
            {
                id: uid(),
                product_id: prodIds.BRACKET,
                op_name: 'DOCK',
                op_number: 10,
                equip_id: '',
                pct_assigned: 100,
                equip_setup_lot: 0,
                equip_run_piece: 0,
                labor_setup_lot: 0,
                labor_run_piece: 0,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.BRACKET,
                op_name: 'STAMP',
                op_number: 20,
                equip_id: equipIds.DRILL,
                pct_assigned: 100,
                equip_setup_lot: 20,
                equip_run_piece: 2,
                labor_setup_lot: 20,
                labor_run_piece: 2,
                ...defaultOpTimes
            },
            // BOLT
            {
                id: uid(),
                product_id: prodIds.BOLT,
                op_name: 'DOCK',
                op_number: 10,
                equip_id: '',
                pct_assigned: 100,
                equip_setup_lot: 0,
                equip_run_piece: 0,
                labor_setup_lot: 0,
                labor_run_piece: 0,
                ...defaultOpTimes
            },
            {
                id: uid(),
                product_id: prodIds.BOLT,
                op_name: 'FORM',
                op_number: 20,
                equip_id: equipIds.DRILL,
                pct_assigned: 100,
                equip_setup_lot: 20,
                equip_run_piece: 2,
                labor_setup_lot: 20,
                labor_run_piece: 2,
                ...defaultOpTimes
            }
        ],
        routing: [
            ...createHubRouting(prodIds.HUB1),
            ...createHubRouting(prodIds.HUB2),
            ...createHubRouting(prodIds.HUB3),
            ...createHubRouting(prodIds.HUB4),
            {
                id: uid(),
                product_id: prodIds.SLEEVE,
                from_op_name: 'DOCK',
                to_op_name: 'TURN',
                pct_routed: 100
            },
            {
                id: uid(),
                product_id: prodIds.SLEEVE,
                from_op_name: 'TURN',
                to_op_name: 'STOCK',
                pct_routed: 100
            },
            {
                id: uid(),
                product_id: prodIds.MOUNT,
                from_op_name: 'DOCK',
                to_op_name: 'ASSEMBLE',
                pct_routed: 100
            },
            {
                id: uid(),
                product_id: prodIds.MOUNT,
                from_op_name: 'ASSEMBLE',
                to_op_name: 'STOCK',
                pct_routed: 100
            },
            {
                id: uid(),
                product_id: prodIds.BRACKET,
                from_op_name: 'DOCK',
                to_op_name: 'STAMP',
                pct_routed: 100
            },
            {
                id: uid(),
                product_id: prodIds.BRACKET,
                from_op_name: 'STAMP',
                to_op_name: 'STOCK',
                pct_routed: 100
            },
            {
                id: uid(),
                product_id: prodIds.BOLT,
                from_op_name: 'DOCK',
                to_op_name: 'FORM',
                pct_routed: 100
            },
            {
                id: uid(),
                product_id: prodIds.BOLT,
                from_op_name: 'FORM',
                to_op_name: 'STOCK',
                pct_routed: 100
            }
        ],
        ibom: [
            {
                id: uid(),
                parent_product_id: prodIds.HUB1,
                component_product_id: prodIds.MOUNT,
                units_per_assy: 4
            },
            {
                id: uid(),
                parent_product_id: prodIds.HUB1,
                component_product_id: prodIds.SLEEVE,
                units_per_assy: 1
            },
            {
                id: uid(),
                parent_product_id: prodIds.HUB2,
                component_product_id: prodIds.MOUNT,
                units_per_assy: 4
            },
            {
                id: uid(),
                parent_product_id: prodIds.HUB2,
                component_product_id: prodIds.SLEEVE,
                units_per_assy: 1
            },
            {
                id: uid(),
                parent_product_id: prodIds.HUB3,
                component_product_id: prodIds.MOUNT,
                units_per_assy: 4
            },
            {
                id: uid(),
                parent_product_id: prodIds.HUB3,
                component_product_id: prodIds.SLEEVE,
                units_per_assy: 1
            },
            {
                id: uid(),
                parent_product_id: prodIds.HUB4,
                component_product_id: prodIds.MOUNT,
                units_per_assy: 4
            },
            {
                id: uid(),
                parent_product_id: prodIds.HUB4,
                component_product_id: prodIds.SLEEVE,
                units_per_assy: 1
            },
            {
                id: uid(),
                parent_product_id: prodIds.MOUNT,
                component_product_id: prodIds.BRACKET,
                units_per_assy: 2
            },
            {
                id: uid(),
                parent_product_id: prodIds.MOUNT,
                component_product_id: prodIds.BOLT,
                units_per_assy: 2
            }
        ]
    };
}
const defaultGeneral = {
    model_title: '',
    ops_time_unit: 'MIN',
    mct_time_unit: 'DAY',
    prod_period_unit: 'YEAR',
    conv1: 480,
    conv2: 210,
    util_limit: 95,
    var_equip: 30,
    var_labor: 30,
    var_prod: 30,
    gen1: 0,
    gen2: 0,
    gen3: 0,
    gen4: 0,
    author: '',
    comments: ''
};
const useModelStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        models: [],
        activeModelId: null,
        modelsLoaded: false,
        modelsLoading: false,
        loadModels: async (force = false)=>{
            if (get().modelsLoading) return;
            if (get().modelsLoaded && !force) return;
            set({
                modelsLoading: true
            });
            if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$frontendOnly$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["USE_FRONTEND_ONLY"]) {
                const demo = createDemoModel();
                set({
                    models: [
                        demo
                    ],
                    modelsLoaded: true,
                    modelsLoading: false,
                    activeModelId: demo.id
                });
                return;
            }
            try {
                const models = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAllModels"])();
                if (models.length > 0) {
                    // Try to restore the last active model from localStorage if set.
                    let restoredActiveId = null;
                    if ("TURBOPACK compile-time truthy", 1) {
                        restoredActiveId = window.localStorage.getItem(ACTIVE_MODEL_STORAGE_KEY);
                    }
                    set((state)=>{
                        const effectiveActiveId = state.activeModelId && models.some((m)=>m.id === state.activeModelId) ? state.activeModelId : restoredActiveId && models.some((m)=>m.id === restoredActiveId) ? restoredActiveId : models[0].id;
                        return {
                            models,
                            modelsLoaded: true,
                            modelsLoading: false,
                            activeModelId: effectiveActiveId
                        };
                    });
                } else {
                    const demo = createDemoModel();
                    set({
                        models: [
                            demo
                        ],
                        modelsLoaded: true,
                        modelsLoading: false,
                        activeModelId: demo.id
                    });
                }
            } catch (err) {
                console.error('loadModels error:', err);
                const demo = createDemoModel();
                set({
                    models: [
                        demo
                    ],
                    modelsLoaded: true,
                    modelsLoading: false,
                    activeModelId: demo.id
                });
            }
        },
        setActiveModel: (id)=>{
            set({
                activeModelId: id
            });
            if ("TURBOPACK compile-time truthy", 1) {
                if (id) {
                    window.localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, id);
                } else {
                    window.localStorage.removeItem(ACTIVE_MODEL_STORAGE_KEY);
                }
            }
        },
        getActiveModel: ()=>{
            const { models, activeModelId } = get();
            return models.find((m)=>m.id === activeModelId);
        },
        createModel: (name, description = '')=>{
            const id = uid();
            const model = {
                id,
                name,
                description,
                tags: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_run_at: null,
                run_status: 'never_run',
                is_archived: false,
                is_demo: false,
                is_starred: false,
                general: {
                    ...defaultGeneral,
                    model_title: name
                },
                param_names: {
                    ...defaultParamNames
                },
                labor: [],
                equipment: [],
                products: [],
                operations: [],
                routing: [],
                ibom: []
            };
            set((s)=>({
                    models: [
                        model,
                        ...s.models
                    ]
                }));
            // Write to Supabase
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveFullModelToDB"])(model).catch((err)=>console.error('createModel DB error:', err));
            return id;
        },
        duplicateModel: (id)=>{
            const source = get().models.find((m)=>m.id === id);
            if (!source) return '';
            const newId = uid();
            // Deep clone and assign new IDs to all entities
            const dup = JSON.parse(JSON.stringify(source));
            dup.id = newId;
            dup.name = `${source.name} (Copy)`;
            dup.created_at = new Date().toISOString();
            dup.updated_at = new Date().toISOString();
            dup.is_demo = false;
            dup.is_starred = false;
            // Generate new IDs for all sub-entities and update references
            const idMap = {};
            const newUid = (oldId)=>{
                const n = uid();
                idMap[oldId] = n;
                return n;
            };
            dup.labor.forEach((l)=>{
                l.id = newUid(l.id);
            });
            dup.equipment.forEach((e)=>{
                e.id = newUid(e.id);
                if (e.labor_group_id) e.labor_group_id = idMap[e.labor_group_id] || e.labor_group_id;
            });
            dup.products.forEach((p)=>{
                p.id = newUid(p.id);
            });
            dup.operations.forEach((o)=>{
                o.id = newUid(o.id);
                o.product_id = idMap[o.product_id] || o.product_id;
                if (o.equip_id) o.equip_id = idMap[o.equip_id] || o.equip_id;
            });
            dup.routing.forEach((r)=>{
                r.id = uid();
                r.product_id = idMap[r.product_id] || r.product_id;
            });
            dup.ibom.forEach((i)=>{
                i.id = uid();
                i.parent_product_id = idMap[i.parent_product_id] || i.parent_product_id;
                i.component_product_id = idMap[i.component_product_id] || i.component_product_id;
            });
            set((s)=>({
                    models: [
                        dup,
                        ...s.models
                    ]
                }));
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveFullModelToDB"])(dup).catch((err)=>console.error('duplicateModel DB error:', err));
            return newId;
        },
        deleteModel: (id)=>{
            set((s)=>{
                const remaining = s.models.filter((m)=>m.id !== id);
                let nextActive = s.activeModelId;
                if (s.activeModelId === id) {
                    nextActive = remaining[0]?.id ?? null;
                    if ("TURBOPACK compile-time truthy", 1) {
                        if (nextActive) {
                            window.localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, nextActive);
                        } else {
                            window.localStorage.removeItem(ACTIVE_MODEL_STORAGE_KEY);
                        }
                    }
                }
                return {
                    models: remaining,
                    activeModelId: nextActive
                };
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].deleteModel(id);
        },
        renameModel: (id, name)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === id ? {
                            ...m,
                            name,
                            general: {
                                ...m.general,
                                model_title: name
                            },
                            updated_at: new Date().toISOString()
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(id, {
                name
            });
        },
        toggleStar: (id)=>{
            const model = get().models.find((m)=>m.id === id);
            const newVal = !model?.is_starred;
            set((s)=>({
                    models: s.models.map((m)=>m.id === id ? {
                            ...m,
                            is_starred: newVal
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(id, {
                is_starred: newVal
            });
        },
        archiveModel: (id)=>{
            const model = get().models.find((m)=>m.id === id);
            const newVal = !model?.is_archived;
            set((s)=>({
                    models: s.models.map((m)=>m.id === id ? {
                            ...m,
                            is_archived: newVal
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(id, {
                is_archived: newVal
            });
        },
        setRunStatus: (id, status)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === id ? {
                            ...m,
                            run_status: status
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(id, {
                run_status: status
            });
        },
        updateGeneral: (modelId, data)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            general: {
                                ...m.general,
                                ...data
                            },
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateGeneral(modelId, data);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        updateParamNames: (modelId, data)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            param_names: {
                                ...m.param_names,
                                ...data
                            },
                            updated_at: new Date().toISOString()
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].upsertParamNames(modelId, data);
        },
        addLabor: (modelId, labor)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            labor: [
                                ...m.labor,
                                labor
                            ],
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].insertLabor(modelId, labor);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        updateLabor: (modelId, laborId, data)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            labor: m.labor.map((l)=>l.id === laborId ? {
                                    ...l,
                                    ...data
                                } : l),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateLabor(laborId, data);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        deleteLabor: (modelId, laborId)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            labor: m.labor.filter((l)=>l.id !== laborId),
                            equipment: m.equipment.map((e)=>e.labor_group_id === laborId ? {
                                    ...e,
                                    labor_group_id: ''
                                } : e),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].deleteLabor(laborId);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        addEquipment: (modelId, eq)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            equipment: [
                                ...m.equipment,
                                eq
                            ],
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].insertEquipment(modelId, eq);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        updateEquipment: (modelId, eqId, data)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            equipment: m.equipment.map((e)=>e.id === eqId ? {
                                    ...e,
                                    ...data
                                } : e),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateEquipment(eqId, data);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        deleteEquipment: (modelId, eqId)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            equipment: m.equipment.filter((e)=>e.id !== eqId),
                            operations: m.operations.map((o)=>o.equip_id === eqId ? {
                                    ...o,
                                    equip_id: ''
                                } : o),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].deleteEquipment(eqId);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        addProduct: (modelId, product)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            products: [
                                ...m.products,
                                product
                            ],
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].insertProduct(modelId, product);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        updateProduct: (modelId, productId, data)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            products: m.products.map((p)=>p.id === productId ? {
                                    ...p,
                                    ...data
                                } : p),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateProduct(productId, data);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        deleteProduct: (modelId, productId)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            products: m.products.filter((p)=>p.id !== productId),
                            operations: m.operations.filter((o)=>o.product_id !== productId),
                            routing: m.routing.filter((r)=>r.product_id !== productId),
                            ibom: m.ibom.filter((e)=>e.parent_product_id !== productId && e.component_product_id !== productId),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].deleteProduct(modelId, productId);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        addOperation: (modelId, op)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            operations: [
                                ...m.operations,
                                op
                            ],
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].insertOperation(modelId, op);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        updateOperation: (modelId, opId, data)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            operations: m.operations.map((o)=>o.id === opId ? {
                                    ...o,
                                    ...data
                                } : o),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateOperation(opId, data);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        deleteOperation: (modelId, opId)=>{
            const model = get().models.find((m)=>m.id === modelId);
            const op = model?.operations.find((o)=>o.id === opId);
            set((s)=>({
                    models: s.models.map((m)=>{
                        if (m.id !== modelId) return m;
                        const opObj = m.operations.find((o)=>o.id === opId);
                        const opName = opObj?.op_name || '';
                        const productId = opObj?.product_id || '';
                        return {
                            ...m,
                            operations: m.operations.filter((o)=>o.id !== opId),
                            routing: m.routing.filter((r)=>!(r.product_id === productId && (r.from_op_name === opName || r.to_op_name === opName))),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        };
                    })
                }));
            if (op) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].deleteOperation(modelId, opId, op.op_name, op.product_id);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        addRouting: (modelId, entry)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            routing: [
                                ...m.routing,
                                entry
                            ],
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            const model = get().models.find((m)=>m.id === modelId);
            if (model) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].insertRouting(modelId, entry, model.operations);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        updateRouting: (modelId, entryId, data)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            routing: m.routing.map((r)=>r.id === entryId ? {
                                    ...r,
                                    ...data
                                } : r),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateRouting(entryId, data);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        deleteRouting: (modelId, entryId)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            routing: m.routing.filter((r)=>r.id !== entryId),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].deleteRouting(entryId);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        setRouting: (modelId, productId, entries)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            routing: [
                                ...m.routing.filter((r)=>r.product_id !== productId),
                                ...entries
                            ],
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            const model = get().models.find((m)=>m.id === modelId);
            if (model) __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].setRouting(modelId, productId, entries, model.operations);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        addIBOM: (modelId, entry)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            ibom: [
                                ...m.ibom,
                                entry
                            ],
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].insertIBOM(modelId, entry);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        updateIBOM: (modelId, entryId, data)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            ibom: m.ibom.map((e)=>e.id === entryId ? {
                                    ...e,
                                    ...data
                                } : e),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateIBOM(entryId, data);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        deleteIBOM: (modelId, entryId)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            ibom: m.ibom.filter((e)=>e.id !== entryId),
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].deleteIBOM(entryId);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        },
        setIBOMForParent: (modelId, parentId, entries)=>{
            set((s)=>({
                    models: s.models.map((m)=>m.id === modelId ? {
                            ...m,
                            ibom: [
                                ...m.ibom.filter((e)=>e.parent_product_id !== parentId),
                                ...entries
                            ],
                            updated_at: new Date().toISOString(),
                            run_status: 'needs_recalc'
                        } : m)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].setIBOMForParent(modelId, parentId, entries);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"].updateModel(modelId, {
                run_status: 'needs_recalc'
            });
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/dashboard/Sidebar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardSidebar",
    ()=>DashboardSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$csrf$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/csrf.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/modelStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-dashboard.js [app-client] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings-2.js [app-client] (ecmascript) <export default as Settings2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cpu.js [app-client] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/git-branch.js [app-client] (ecmascript) <export default as GitBranch>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3X3$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.js [app-client] (ecmascript) <export default as Grid3X3>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/network.js [app-client] (ecmascript) <export default as Network>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flask-conical.js [app-client] (ecmascript) <export default as FlaskConical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-text.js [app-client] (ecmascript) <export default as FileText>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/wrench.js [app-client] (ecmascript) <export default as Wrench>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const NAV_ITEMS = [
    {
        href: "/dashboard/overview",
        label: "Overview",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"]
    },
    {
        href: "/dashboard/generaldata",
        label: "General Data",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings2$3e$__["Settings2"]
    },
    {
        href: "/dashboard/labordata",
        label: "Labor",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"]
    },
    {
        href: "/dashboard/equipmentdata",
        label: "Equipment",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__["Cpu"]
    },
    {
        href: "/dashboard/productdata",
        label: "Products",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"]
    },
    {
        href: "/dashboard/operationsrouting",
        label: "Operations",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$git$2d$branch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__GitBranch$3e$__["GitBranch"]
    },
    {
        href: "/dashboard/alloperations",
        label: "All Operations",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid3X3$3e$__["Grid3X3"]
    },
    {
        href: "/dashboard/ibomscreens",
        label: "IBOM",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$network$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Network$3e$__["Network"]
    },
    {
        href: "/dashboard/runresults",
        label: "Run & Results",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"]
    },
    {
        href: "/dashboard/whatif",
        label: "What-If Studio",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flask$2d$conical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FlaskConical$3e$__["FlaskConical"]
    },
    {
        href: "/dashboard/reports",
        label: "Reports",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$text$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileText$3e$__["FileText"]
    },
    {
        href: "/dashboard/parameternames",
        label: "Model Settings",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wrench$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Wrench$3e$__["Wrench"]
    }
];
function DashboardSidebar() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "DashboardSidebar.useModelStore[model]": (s)=>s.getActiveModel()
    }["DashboardSidebar.useModelStore[model]"]);
    const handleLogout = async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post("/api/logout/");
        } catch  {
        // no-op
        } finally{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$csrf$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearCSRFToken"])();
            router.push("/login");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "flex w-64 shrink-0 flex-col min-h-0 border-r border-slate-800 bg-[#0A1929] text-slate-100",
        "aria-label": "Main navigation",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-b border-slate-800 px-4 py-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-semibold uppercase tracking-[0.14em] text-slate-400",
                    children: "MODEL WORKSPACE"
                }, void 0, false, {
                    fileName: "[project]/src/components/dashboard/Sidebar.tsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/Sidebar.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2 py-3",
                children: NAV_ITEMS.map(({ href, label, icon: Icon })=>{
                    const isActive = pathname === href;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: href,
                        className: [
                            "flex items-center gap-3 rounded-l-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                            isActive ? "bg-slate-700/80 text-emerald-400" : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                        ].join(" "),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                className: `h-4 w-4 shrink-0 ${isActive ? "text-emerald-400" : ""}`
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/Sidebar.tsx",
                                lineNumber: 79,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "truncate",
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/Sidebar.tsx",
                                lineNumber: 80,
                                columnNumber: 15
                            }, this)
                        ]
                    }, href, true, {
                        fileName: "[project]/src/components/dashboard/Sidebar.tsx",
                        lineNumber: 69,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/Sidebar.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "shrink-0 border-t border-slate-800 p-3 space-y-1",
                children: [
                    model && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "px-3 py-1.5 text-xs text-slate-400",
                        children: [
                            model.products.length,
                            " products - ",
                            model.equipment.length,
                            " equip - ",
                            model.labor.length,
                            " labor"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dashboard/Sidebar.tsx",
                        lineNumber: 88,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleLogout,
                        className: "flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700",
                        children: "Logout"
                    }, void 0, false, {
                        fileName: "[project]/src/components/dashboard/Sidebar.tsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/dashboard/Sidebar.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/dashboard/Sidebar.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, this);
}
_s(DashboardSidebar, "hdESZqFWSvPouKu1yP0qB9laPCE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"]
    ];
});
_c = DashboardSidebar;
var _c;
__turbopack_context__.k.register(_c, "DashboardSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/scenarioDb.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
/**
 * Scenarios (What-If) data layer.
 * Implemented in backendClient.ts (in-memory by default).
 * To use your backend: replace the implementation in src/lib/backendClient.ts
 * with your API calls. See docs/BACKEND_API.md.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/backendClient.ts [app-client] (ecmascript)");
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/stores/scenarioStore.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useScenarioStore",
    ()=>useScenarioStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/modelStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scenarioDb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/scenarioDb.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/backendClient.ts [app-client] (ecmascript)");
;
;
;
const uid = ()=>crypto.randomUUID();
const useScenarioStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        scenarios: [],
        families: [],
        activeScenarioId: null,
        displayScenarioIds: [],
        loadedModelId: null,
        setActiveScenario: (id)=>set({
                activeScenarioId: id
            }),
        getActiveScenario: ()=>{
            const { scenarios, activeScenarioId } = get();
            return scenarios.find((s)=>s.id === activeScenarioId);
        },
        getScenariosForModel: (modelId)=>{
            return get().scenarios.filter((s)=>s.modelId === modelId);
        },
        loadScenariosFromDb: async (modelId)=>{
            if (get().loadedModelId === modelId) return;
            const { loadScenariosForModel } = await __turbopack_context__.A("[project]/src/lib/scenarioDb.ts [app-client] (ecmascript, async loader)");
            const { scenarios, results } = await loadScenariosForModel(modelId);
            set({
                scenarios,
                loadedModelId: modelId,
                activeScenarioId: null,
                displayScenarioIds: []
            });
            // Populate resultsStore with loaded results
            const { useResultsStore } = await __turbopack_context__.A("[project]/src/stores/resultsStore.ts [app-client] (ecmascript, async loader)");
            Object.entries(results).forEach(([scenarioId, calcResults])=>{
                useResultsStore.getState().setResults(scenarioId, calcResults);
            });
            // Load basecase results
            const { loadBasecaseResults } = await __turbopack_context__.A("[project]/src/lib/scenarioDb.ts [app-client] (ecmascript, async loader)");
            const bcResults = await loadBasecaseResults(modelId);
            if (bcResults) {
                useResultsStore.getState().setResults('basecase', bcResults);
            }
        },
        setScenarios: (scenarios)=>set({
                scenarios
            }),
        createScenario: async (modelId, name, description = '')=>{
            const dbId = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].create(modelId, name, description);
            const id = dbId || uid();
            const scenario = {
                id,
                modelId,
                name,
                description,
                familyId: null,
                status: 'needs_recalc',
                changes: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            set((s)=>({
                    scenarios: [
                        ...s.scenarios,
                        scenario
                    ]
                }));
            return id;
        },
        duplicateScenario: async (id)=>{
            const source = get().scenarios.find((s)=>s.id === id);
            if (!source) return '';
            const newName = `${source.name} (Copy)`;
            const dbId = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].create(source.modelId, newName, source.description);
            const newId = dbId || uid();
            const dup = {
                ...JSON.parse(JSON.stringify(source)),
                id: newId,
                name: newName,
                status: 'needs_recalc',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            // Re-id changes and save to DB
            dup.changes = dup.changes.map((c)=>{
                const newChange = {
                    ...c,
                    id: uid()
                };
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].upsertChange(newId, newChange);
                return newChange;
            });
            set((s)=>({
                    scenarios: [
                        ...s.scenarios,
                        dup
                    ]
                }));
            return newId;
        },
        renameScenario: (id, name)=>{
            set((s)=>({
                    scenarios: s.scenarios.map((sc)=>sc.id === id ? {
                            ...sc,
                            name,
                            updatedAt: new Date().toISOString()
                        } : sc)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].update(id, {
                name
            });
        },
        updateScenarioDescription: (id, description)=>{
            set((s)=>({
                    scenarios: s.scenarios.map((sc)=>sc.id === id ? {
                            ...sc,
                            description,
                            updatedAt: new Date().toISOString()
                        } : sc)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].update(id, {
                description
            });
        },
        deleteScenario: (id)=>{
            set((s)=>({
                    scenarios: s.scenarios.filter((sc)=>sc.id !== id),
                    activeScenarioId: s.activeScenarioId === id ? null : s.activeScenarioId,
                    displayScenarioIds: s.displayScenarioIds.filter((sid)=>sid !== id)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].delete(id);
        },
        addChange: (scenarioId, change)=>{
            const newChange = {
                ...change,
                id: uid()
            };
            set((s)=>({
                    scenarios: s.scenarios.map((sc)=>sc.id === scenarioId ? {
                            ...sc,
                            changes: [
                                ...sc.changes,
                                newChange
                            ],
                            status: 'needs_recalc',
                            updatedAt: new Date().toISOString()
                        } : sc)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].upsertChange(scenarioId, newChange);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].update(scenarioId, {
                status: 'needs_recalc'
            });
        },
        updateChange: (scenarioId, changeId, whatIfValue)=>{
            let updatedChange = null;
            set((s)=>({
                    scenarios: s.scenarios.map((sc)=>{
                        if (sc.id !== scenarioId) return sc;
                        return {
                            ...sc,
                            changes: sc.changes.map((c)=>{
                                if (c.id !== changeId) return c;
                                updatedChange = {
                                    ...c,
                                    whatIfValue
                                };
                                return updatedChange;
                            }),
                            status: 'needs_recalc',
                            updatedAt: new Date().toISOString()
                        };
                    })
                }));
            if (updatedChange) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].upsertChange(scenarioId, updatedChange);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].update(scenarioId, {
                    status: 'needs_recalc'
                });
            }
        },
        removeChange: (scenarioId, changeId)=>{
            set((s)=>({
                    scenarios: s.scenarios.map((sc)=>sc.id === scenarioId ? {
                            ...sc,
                            changes: sc.changes.filter((c)=>c.id !== changeId),
                            updatedAt: new Date().toISOString()
                        } : sc)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].removeChange(scenarioId, changeId);
        },
        applyScenarioChange: (scenarioId, dataType, entityId, entityName, field, fieldLabel, whatIfValue)=>{
            const scenario = get().scenarios.find((s)=>s.id === scenarioId);
            if (!scenario) return;
            const existing = scenario.changes.find((c)=>c.entityId === entityId && c.field === field && c.dataType === dataType);
            if (existing) {
                if (String(existing.basecaseValue) === String(whatIfValue)) {
                    get().removeChange(scenarioId, existing.id);
                } else {
                    get().updateChange(scenarioId, existing.id, whatIfValue);
                }
            } else {
                const model = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"].getState().getActiveModel();
                if (!model) return;
                let basecaseValue = '';
                if (dataType === 'Labor') {
                    const entity = model.labor.find((l)=>l.id === entityId);
                    if (entity) basecaseValue = entity[field];
                } else if (dataType === 'Equipment') {
                    const entity = model.equipment.find((e)=>e.id === entityId);
                    if (entity) basecaseValue = entity[field];
                } else if (dataType === 'Product') {
                    const entity = model.products.find((p)=>p.id === entityId);
                    if (field === 'included') {
                        basecaseValue = 'true'; // all products included by default
                    } else if (entity) {
                        basecaseValue = entity[field];
                    }
                } else if (dataType === 'General') {
                    basecaseValue = model.general[field];
                } else if (dataType === 'Routing') {
                    const entry = model.routing.find((r)=>r.id === entityId);
                    if (entry) basecaseValue = entry[field];
                } else if (dataType === 'Product Inclusion') {
                    basecaseValue = 'Yes'; // default: all products included
                }
                if (String(basecaseValue) === String(whatIfValue)) return;
                get().addChange(scenarioId, {
                    dataType,
                    entityId,
                    entityName,
                    field,
                    fieldLabel,
                    basecaseValue,
                    whatIfValue
                });
            }
        },
        toggleDisplayScenario: (id)=>set((s)=>({
                    displayScenarioIds: s.displayScenarioIds.includes(id) ? s.displayScenarioIds.filter((sid)=>sid !== id) : [
                        ...s.displayScenarioIds,
                        id
                    ]
                })),
        markNeedsRecalc: (scenarioId)=>{
            set((s)=>({
                    scenarios: s.scenarios.map((sc)=>sc.id === scenarioId ? {
                            ...sc,
                            status: 'needs_recalc'
                        } : sc)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].update(scenarioId, {
                status: 'needs_recalc'
            });
        },
        markCalculated: (scenarioId)=>{
            set((s)=>({
                    scenarios: s.scenarios.map((sc)=>sc.id === scenarioId ? {
                            ...sc,
                            status: 'calculated'
                        } : sc)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].update(scenarioId, {
                status: 'calculated'
            });
        },
        promoteToBasecase: (scenarioId)=>{
            const scenario = get().scenarios.find((s)=>s.id === scenarioId);
            if (!scenario) return;
            const modelStore = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"].getState();
            const model = modelStore.models.find((m)=>m.id === scenario.modelId);
            if (!model) return;
            scenario.changes.forEach((change)=>{
                if (change.dataType === 'Labor') {
                    modelStore.updateLabor(scenario.modelId, change.entityId, {
                        [change.field]: change.whatIfValue
                    });
                } else if (change.dataType === 'Equipment') {
                    modelStore.updateEquipment(scenario.modelId, change.entityId, {
                        [change.field]: change.whatIfValue
                    });
                } else if (change.dataType === 'Product') {
                    modelStore.updateProduct(scenario.modelId, change.entityId, {
                        [change.field]: change.whatIfValue
                    });
                } else if (change.dataType === 'Routing') {
                    modelStore.updateRouting(scenario.modelId, change.entityId, {
                        [change.field]: change.whatIfValue
                    });
                }
            });
            set((s)=>({
                    scenarios: s.scenarios.filter((sc)=>sc.id !== scenarioId).map((sc)=>sc.modelId === scenario.modelId ? {
                            ...sc,
                            status: 'needs_recalc'
                        } : sc),
                    activeScenarioId: null,
                    displayScenarioIds: s.displayScenarioIds.filter((id)=>id !== scenarioId)
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["scenarioDb"].delete(scenarioId);
        },
        // ── Family management ──
        createFamily: (modelId, name)=>{
            const id = uid();
            const family = {
                id,
                modelId,
                name
            };
            set((s)=>({
                    families: [
                        ...s.families,
                        family
                    ]
                }));
            return id;
        },
        deleteFamily: (familyId)=>{
            set((s)=>({
                    families: s.families.filter((f)=>f.id !== familyId),
                    scenarios: s.scenarios.map((sc)=>sc.familyId === familyId ? {
                            ...sc,
                            familyId: null
                        } : sc)
                }));
        },
        addToFamily: (scenarioId, familyId)=>{
            set((s)=>({
                    scenarios: s.scenarios.map((sc)=>sc.id === scenarioId ? {
                            ...sc,
                            familyId
                        } : sc)
                }));
        },
        removeFromFamily: (scenarioId)=>{
            set((s)=>({
                    scenarios: s.scenarios.map((sc)=>sc.id === scenarioId ? {
                            ...sc,
                            familyId: null
                        } : sc)
                }));
        },
        renameFamily: (familyId, name)=>{
            set((s)=>({
                    families: s.families.map((f)=>f.id === familyId ? {
                            ...f,
                            name
                        } : f)
                }));
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
const Button = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, variant, size, asChild = false, ...props }, ref)=>{
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "button";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/button.tsx",
        lineNumber: 42,
        columnNumber: 12
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Button;
Button.displayName = "Button";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Button$React.forwardRef");
__turbopack_context__.k.register(_c1, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Dialog",
    ()=>Dialog,
    "DialogClose",
    ()=>DialogClose,
    "DialogContent",
    ()=>DialogContent,
    "DialogDescription",
    ()=>DialogDescription,
    "DialogFooter",
    ()=>DialogFooter,
    "DialogHeader",
    ()=>DialogHeader,
    "DialogOverlay",
    ()=>DialogOverlay,
    "DialogPortal",
    ()=>DialogPortal,
    "DialogTitle",
    ()=>DialogTitle,
    "DialogTrigger",
    ()=>DialogTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-dialog/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const Dialog = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const DialogTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const DialogPortal = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"];
const DialogClose = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"];
const DialogOverlay = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 19,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c = DialogOverlay;
DialogOverlay.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"].displayName;
const DialogContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c1 = ({ className, children, onEscapeKeyDown, onPointerDownOutside, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogPortal, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DialogOverlay, {}, void 0, false, {
                fileName: "[project]/src/components/ui/dialog.tsx",
                lineNumber: 35,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
                ref: ref,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("fixed left-1/2 top-1/2 z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]", className),
                onEscapeKeyDown: (event)=>{
                    onEscapeKeyDown?.(event);
                    event.preventDefault();
                },
                onPointerDownOutside: (event)=>{
                    onPointerDownOutside?.(event);
                    event.preventDefault();
                },
                ...props,
                children: [
                    children,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Close"], {
                        className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "h-4 w-4 cursor-pointer"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/dialog.tsx",
                                lineNumber: 54,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0)),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/dialog.tsx",
                                lineNumber: 55,
                                columnNumber: 9
                            }, ("TURBOPACK compile-time value", void 0))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/dialog.tsx",
                        lineNumber: 53,
                        columnNumber: 7
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/dialog.tsx",
                lineNumber: 36,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 34,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c2 = DialogContent;
DialogContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
const DialogHeader = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col space-y-1.5 text-center sm:text-left", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 63,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c3 = DialogHeader;
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 68,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
_c4 = DialogFooter;
DialogFooter.displayName = "DialogFooter";
const DialogTitle = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c5 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-lg font-semibold leading-none tracking-tight", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 76,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c6 = DialogTitle;
DialogTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"].displayName;
const DialogDescription = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c7 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-sm text-muted-foreground", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dialog.tsx",
        lineNumber: 88,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c8 = DialogDescription;
DialogDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8;
__turbopack_context__.k.register(_c, "DialogOverlay");
__turbopack_context__.k.register(_c1, "DialogContent$React.forwardRef");
__turbopack_context__.k.register(_c2, "DialogContent");
__turbopack_context__.k.register(_c3, "DialogHeader");
__turbopack_context__.k.register(_c4, "DialogFooter");
__turbopack_context__.k.register(_c5, "DialogTitle$React.forwardRef");
__turbopack_context__.k.register(_c6, "DialogTitle");
__turbopack_context__.k.register(_c7, "DialogDescription$React.forwardRef");
__turbopack_context__.k.register(_c8, "DialogDescription");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/input.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Input",
    ()=>Input
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
const Input = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, type, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        type: type,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-none ring-offset-0 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60", className),
        ref: ref,
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/input.tsx",
        lineNumber: 8,
        columnNumber: 7
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Input;
Input.displayName = "Input";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Input$React.forwardRef");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/label.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Label",
    ()=>Label
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-label/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const labelVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(labelVariants(), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/label.tsx",
        lineNumber: 13,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = Label;
Label.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$label$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Label$React.forwardRef");
__turbopack_context__.k.register(_c1, "Label");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/dropdown-menu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DropdownMenu",
    ()=>DropdownMenu,
    "DropdownMenuCheckboxItem",
    ()=>DropdownMenuCheckboxItem,
    "DropdownMenuContent",
    ()=>DropdownMenuContent,
    "DropdownMenuGroup",
    ()=>DropdownMenuGroup,
    "DropdownMenuItem",
    ()=>DropdownMenuItem,
    "DropdownMenuLabel",
    ()=>DropdownMenuLabel,
    "DropdownMenuPortal",
    ()=>DropdownMenuPortal,
    "DropdownMenuRadioGroup",
    ()=>DropdownMenuRadioGroup,
    "DropdownMenuRadioItem",
    ()=>DropdownMenuRadioItem,
    "DropdownMenuSeparator",
    ()=>DropdownMenuSeparator,
    "DropdownMenuShortcut",
    ()=>DropdownMenuShortcut,
    "DropdownMenuSub",
    ()=>DropdownMenuSub,
    "DropdownMenuSubContent",
    ()=>DropdownMenuSubContent,
    "DropdownMenuSubTrigger",
    ()=>DropdownMenuSubTrigger,
    "DropdownMenuTrigger",
    ()=>DropdownMenuTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle.js [app-client] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const DropdownMenu = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const DropdownMenuTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const DropdownMenuGroup = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"];
const DropdownMenuPortal = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"];
const DropdownMenuSub = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sub"];
const DropdownMenuRadioGroup = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioGroup"];
const DropdownMenuSubTrigger = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, inset, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubTrigger"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent focus:bg-accent", inset && "pl-8", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                className: "ml-auto h-4 w-4"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                lineNumber: 35,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 25,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = DropdownMenuSubTrigger;
DropdownMenuSubTrigger.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubTrigger"].displayName;
const DropdownMenuSubContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c2 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubContent"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 44,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = DropdownMenuSubContent;
DropdownMenuSubContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SubContent"].displayName;
const DropdownMenuContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, sideOffset = 4, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            ref: ref,
            sideOffset: sideOffset,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/src/components/ui/dropdown-menu.tsx",
            lineNumber: 60,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 59,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = DropdownMenuContent;
DropdownMenuContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
const DropdownMenuItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, inset, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground", inset && "pl-8", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 79,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c7 = DropdownMenuItem;
DropdownMenuItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"].displayName;
const DropdownMenuCheckboxItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, children, checked, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckboxItem"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground", className),
        checked: checked,
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                    lineNumber: 105,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                lineNumber: 104,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 95,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c9 = DropdownMenuCheckboxItem;
DropdownMenuCheckboxItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CheckboxItem"].displayName;
const DropdownMenuRadioItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioItem"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
                        className: "h-2 w-2 fill-current"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                    lineNumber: 127,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/dropdown-menu.tsx",
                lineNumber: 126,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 118,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c11 = DropdownMenuRadioItem;
DropdownMenuRadioItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RadioItem"].displayName;
const DropdownMenuLabel = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c12 = ({ className, inset, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 142,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c13 = DropdownMenuLabel;
DropdownMenuLabel.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"].displayName;
const DropdownMenuSeparator = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c14 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("-mx-1 my-1 h-px bg-muted", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 154,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c15 = DropdownMenuSeparator;
DropdownMenuSeparator.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$dropdown$2d$menu$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"].displayName;
const DropdownMenuShortcut = ({ className, ...props })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("ml-auto text-xs tracking-widest opacity-60", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/dropdown-menu.tsx",
        lineNumber: 159,
        columnNumber: 10
    }, ("TURBOPACK compile-time value", void 0));
};
_c16 = DropdownMenuShortcut;
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11, _c12, _c13, _c14, _c15, _c16;
__turbopack_context__.k.register(_c, "DropdownMenuSubTrigger$React.forwardRef");
__turbopack_context__.k.register(_c1, "DropdownMenuSubTrigger");
__turbopack_context__.k.register(_c2, "DropdownMenuSubContent$React.forwardRef");
__turbopack_context__.k.register(_c3, "DropdownMenuSubContent");
__turbopack_context__.k.register(_c4, "DropdownMenuContent$React.forwardRef");
__turbopack_context__.k.register(_c5, "DropdownMenuContent");
__turbopack_context__.k.register(_c6, "DropdownMenuItem$React.forwardRef");
__turbopack_context__.k.register(_c7, "DropdownMenuItem");
__turbopack_context__.k.register(_c8, "DropdownMenuCheckboxItem$React.forwardRef");
__turbopack_context__.k.register(_c9, "DropdownMenuCheckboxItem");
__turbopack_context__.k.register(_c10, "DropdownMenuRadioItem$React.forwardRef");
__turbopack_context__.k.register(_c11, "DropdownMenuRadioItem");
__turbopack_context__.k.register(_c12, "DropdownMenuLabel$React.forwardRef");
__turbopack_context__.k.register(_c13, "DropdownMenuLabel");
__turbopack_context__.k.register(_c14, "DropdownMenuSeparator$React.forwardRef");
__turbopack_context__.k.register(_c15, "DropdownMenuSeparator");
__turbopack_context__.k.register(_c16, "DropdownMenuShortcut");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/dashboard/WorkspaceHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WorkspaceHeader",
    ()=>WorkspaceHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/modelStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/scenarioStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle.js [app-client] (ecmascript) <export default as Circle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file-check.js [app-client] (ecmascript) <export default as FileCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dropdown-menu.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
function WorkspaceHeader({ children }) {
    _s();
    const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "WorkspaceHeader.useModelStore[model]": (s)=>s.getActiveModel()
    }["WorkspaceHeader.useModelStore[model]"]);
    const modelTitle = model?.general?.model_title || model?.name || "No model selected";
    const activeScenarioId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"])({
        "WorkspaceHeader.useScenarioStore[activeScenarioId]": (s)=>s.activeScenarioId
    }["WorkspaceHeader.useScenarioStore[activeScenarioId]"]);
    const activeScenario = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"])({
        "WorkspaceHeader.useScenarioStore[activeScenario]": (s)=>s.scenarios.find({
                "WorkspaceHeader.useScenarioStore[activeScenario]": (sc)=>sc.id === s.activeScenarioId
            }["WorkspaceHeader.useScenarioStore[activeScenario]"])
    }["WorkspaceHeader.useScenarioStore[activeScenario]"]);
    const [showSaveDialog, setShowSaveDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const now = new Date();
    const defaultName = `Checkpoint ${now.toLocaleString()}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "flex flex-col gap-3 border-b border-slate-800 bg-[#0A1929] px-6 py-3 w-full shrink-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-4 min-w-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 min-w-0 flex-1 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/library",
                                className: "flex items-center gap-2 shrink-0 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors",
                                children: "Trooba Flow"
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                lineNumber: 42,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                className: "h-4 w-4 shrink-0 text-slate-500",
                                "aria-hidden": true
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                lineNumber: 48,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-sm font-normal text-slate-200 truncate max-w-[200px] sm:max-w-[280px]",
                                children: [
                                    modelTitle,
                                    modelTitle.length > 20 ? " — …" : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                lineNumber: 49,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center gap-1.5 rounded-md border border-emerald-400/70 bg-transparent px-2.5 py-1 text-[11px] font-medium text-emerald-400 shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
                                        className: "h-1.5 w-1.5 fill-emerald-400"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                        lineNumber: 54,
                                        columnNumber: 13
                                    }, this),
                                    "Basecase"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center rounded-md bg-[#FFC107] px-2.5 py-1 text-[11px] font-medium text-slate-900 shrink-0",
                                children: "Recalc Needed"
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                lineNumber: 57,
                                columnNumber: 11
                            }, this),
                            activeScenarioId && activeScenario ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "inline-flex items-center rounded-md bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-medium text-slate-950 shrink-0",
                                children: [
                                    "What-if: ",
                                    activeScenario.name
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                lineNumber: 61,
                                columnNumber: 13
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                        lineNumber: 41,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                type: "button",
                                variant: "ghost",
                                size: "sm",
                                className: "h-8 gap-1.5 rounded-md bg-transparent text-sm font-medium text-white hover:bg-slate-700/50 hover:text-white border-0",
                                onClick: ()=>setShowSaveDialog(true),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__FileCheck$3e$__["FileCheck"], {
                                        className: "h-4 w-4 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                        lineNumber: 76,
                                        columnNumber: 13
                                    }, this),
                                    "Checkpoint"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                                        asChild: true,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            type: "button",
                                            variant: "ghost",
                                            size: "icon",
                                            className: "h-8 w-8 rounded-md bg-transparent text-white hover:bg-slate-700/60",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                className: "h-4 w-4 shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                                lineNumber: 87,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                            lineNumber: 81,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                        lineNumber: 80,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                                        align: "end",
                                        className: "w-64 rounded-lg shadow-lg p-0",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "px-3 py-2.5 font-semibold text-sm text-slate-900 border-b border-slate-200",
                                                children: "Recent Checkpoints"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                                lineNumber: 91,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "px-3 py-4 text-sm text-slate-500 text-center",
                                                children: "No checkpoints yet"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                                lineNumber: 94,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border-t border-slate-200 px-2 py-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-cyan-600 hover:bg-cyan-50 hover:text-cyan-700 transition-colors",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                            className: "h-4 w-4 shrink-0"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                                            lineNumber: 102,
                                                            columnNumber: 19
                                                        }, this),
                                                        "View all checkpoints"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                                    lineNumber: 98,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                                lineNumber: 97,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                        lineNumber: 90,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                lineNumber: 39,
                columnNumber: 7
            }, this),
            children && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xs text-slate-400 flex items-center gap-2",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                lineNumber: 111,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
                open: showSaveDialog,
                onOpenChange: setShowSaveDialog,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                    className: "max-w-md",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                children: "Save Checkpoint"
                            }, void 0, false, {
                                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                            lineNumber: 119,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-600 mb-3",
                            children: "Save a snapshot of the current model state that you can restore later."
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                    htmlFor: "checkpoint-name",
                                    children: "Checkpoint Name"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                    lineNumber: 126,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                    id: "checkpoint-name",
                                    defaultValue: defaultName,
                                    className: "h-10"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                    lineNumber: 127,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-3 flex items-center gap-2 text-xs text-slate-500",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Circle$3e$__["Circle"], {
                                    className: "h-3 w-3"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: now.toLocaleString()
                                }, void 0, false, {
                                    fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                    lineNumber: 135,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                            className: "mt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "button",
                                    variant: "outline",
                                    onClick: ()=>setShowSaveDialog(false),
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                    lineNumber: 138,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    type: "button",
                                    className: "bg-emerald-600 hover:bg-emerald-700",
                                    onClick: ()=>setShowSaveDialog(false),
                                    children: "Save Checkpoint"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                            lineNumber: 137,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/dashboard/WorkspaceHeader.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
_s(WorkspaceHeader, "w/zIB919iNzFUQPPTR3eJtoEzR0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$scenarioStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScenarioStore"]
    ];
});
_c = WorkspaceHeader;
var _c;
__turbopack_context__.k.register(_c, "WorkspaceHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/dashboard/DashboardLayout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardLayout",
    ()=>DashboardLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/Sidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$WorkspaceHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/dashboard/WorkspaceHeader.tsx [app-client] (ecmascript)");
"use client";
;
;
;
function DashboardLayout({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-screen flex-col overflow-hidden bg-[#F9FAFB] text-slate-900",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$WorkspaceHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WorkspaceHeader"], {}, void 0, false, {
                fileName: "[project]/src/components/dashboard/DashboardLayout.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-1 min-h-0 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$dashboard$2f$Sidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DashboardSidebar"], {}, void 0, false, {
                        fileName: "[project]/src/components/dashboard/DashboardLayout.tsx",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "flex-1 min-h-0 flex flex-col overflow-y-auto overflow-x-hidden px-6 py-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mx-auto max-w-6xl w-full flex-1 min-h-0 flex flex-col",
                            children: children
                        }, void 0, false, {
                            fileName: "[project]/src/components/dashboard/DashboardLayout.tsx",
                            lineNumber: 21,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/dashboard/DashboardLayout.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/dashboard/DashboardLayout.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/dashboard/DashboardLayout.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = DashboardLayout;
var _c;
__turbopack_context__.k.register(_c, "DashboardLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/dashboard/DashboardHydration.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DashboardHydration",
    ()=>DashboardHydration
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/modelStore.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function DashboardHydration({ children }) {
    _s();
    const loadModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "DashboardHydration.useModelStore[loadModels]": (s)=>s.loadModels
    }["DashboardHydration.useModelStore[loadModels]"]);
    const modelsLoaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "DashboardHydration.useModelStore[modelsLoaded]": (s)=>s.modelsLoaded
    }["DashboardHydration.useModelStore[modelsLoaded]"]);
    const modelsLoading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "DashboardHydration.useModelStore[modelsLoading]": (s)=>s.modelsLoading
    }["DashboardHydration.useModelStore[modelsLoading]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DashboardHydration.useEffect": ()=>{
            if (!modelsLoaded && !modelsLoading) loadModels();
        }
    }["DashboardHydration.useEffect"], [
        modelsLoaded,
        modelsLoading,
        loadModels
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(DashboardHydration, "CLkrK35hJcbSjBcMte7Te1UO3yQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"]
    ];
});
_c = DashboardHydration;
var _c;
__turbopack_context__.k.register(_c, "DashboardHydration");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_8cc0ab57._.js.map