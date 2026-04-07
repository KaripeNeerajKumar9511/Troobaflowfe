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
"[project]/src/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            outline: "text-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
const Badge = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, variant, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/badge.tsx",
        lineNumber: 27,
        columnNumber: 12
    }, ("TURBOPACK compile-time value", void 0));
});
_c1 = Badge;
Badge.displayName = "Badge";
;
var _c, _c1;
__turbopack_context__.k.register(_c, "Badge$React.forwardRef");
__turbopack_context__.k.register(_c1, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/popover.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Popover",
    ()=>Popover,
    "PopoverContent",
    ()=>PopoverContent,
    "PopoverTrigger",
    ()=>PopoverTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-popover/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const Popover = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const PopoverTrigger = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"];
const PopoverContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, align = "center", sideOffset = 4, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            ref: ref,
            align: align,
            sideOffset: sideOffset,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/src/components/ui/popover.tsx",
            lineNumber: 15,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/popover.tsx",
        lineNumber: 14,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = PopoverContent;
PopoverContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$popover$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
;
var _c, _c1;
__turbopack_context__.k.register(_c, "PopoverContent$React.forwardRef");
__turbopack_context__.k.register(_c1, "PopoverContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/UserLevelChip.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserLevelChip",
    ()=>UserLevelChip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useUserLevel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useUserLevel.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/popover.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
const LEVEL_CONFIG = {
    novice: {
        label: 'Novice',
        className: 'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer',
        description: 'Simplified interface — core features only'
    },
    standard: {
        label: 'Standard',
        className: 'bg-primary/15 text-primary hover:bg-primary/25 cursor-pointer',
        description: 'Most features including advanced parameters'
    },
    advanced: {
        label: 'Advanced',
        className: 'bg-accent text-accent-foreground hover:bg-accent/80 cursor-pointer',
        description: 'All features including optimization tools'
    }
};
function UserLevelChip() {
    _s();
    const { userLevel, setUserLevel } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useUserLevel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserLevelStore"])();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const config = LEVEL_CONFIG[userLevel];
    const handleChange = async (level)=>{
        await setUserLevel(level);
        setOpen(false);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Switched to ${LEVEL_CONFIG[level].label} mode`);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popover"], {
        open: open,
        onOpenChange: setOpen,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PopoverTrigger"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                    className: `text-[10px] px-2 py-0.5 border-0 shrink-0 transition-colors ${config.className}`,
                    children: config.label
                }, void 0, false, {
                    fileName: "[project]/src/components/UserLevelChip.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/UserLevelChip.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PopoverContent"], {
                className: "w-56 p-1.5",
                align: "end",
                sideOffset: 6,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5",
                        children: "User Level"
                    }, void 0, false, {
                        fileName: "[project]/src/components/UserLevelChip.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    Object.entries(LEVEL_CONFIG).map(([level, cfg])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>handleChange(level),
                            className: `w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${level === userLevel ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent/50 text-foreground'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: cfg.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/UserLevelChip.tsx",
                                    lineNumber: 57,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[10px] text-muted-foreground leading-tight mt-0.5",
                                    children: cfg.description
                                }, void 0, false, {
                                    fileName: "[project]/src/components/UserLevelChip.tsx",
                                    lineNumber: 58,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, level, true, {
                            fileName: "[project]/src/components/UserLevelChip.tsx",
                            lineNumber: 48,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/UserLevelChip.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/UserLevelChip.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(UserLevelChip, "MxEV99boDZ3GrW0RR/0giQKdRlc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useUserLevel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserLevelStore"]
    ];
});
_c = UserLevelChip;
var _c;
__turbopack_context__.k.register(_c, "UserLevelChip");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/usePageTitle.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePageTitle",
    ()=>usePageTitle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function usePageTitle(title) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePageTitle.useEffect": ()=>{
            document.title = title ? `RapidMCT — ${title}` : 'RapidMCT';
            return ({
                "usePageTitle.useEffect": ()=>{
                    document.title = 'RapidMCT';
                }
            })["usePageTitle.useEffect"];
        }
    }["usePageTitle.useEffect"], [
        title
    ]);
}
_s(usePageTitle, "OD7bBpZva5O2jO+Puf00hKivP7c=");
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
"[project]/src/components/ui/Select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Select",
    ()=>Select,
    "SelectContent",
    ()=>SelectContent,
    "SelectGroup",
    ()=>SelectGroup,
    "SelectItem",
    ()=>SelectItem,
    "SelectLabel",
    ()=>SelectLabel,
    "SelectScrollDownButton",
    ()=>SelectScrollDownButton,
    "SelectScrollUpButton",
    ()=>SelectScrollUpButton,
    "SelectSeparator",
    ()=>SelectSeparator,
    "SelectTrigger",
    ()=>SelectTrigger,
    "SelectValue",
    ()=>SelectValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-select/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const Select = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"];
const SelectGroup = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"];
const SelectValue = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Value"];
const SelectTrigger = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex h-9 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-none ring-offset-0 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60 [&>span]:line-clamp-1", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                    className: "h-4 w-4 opacity-50"
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/Select.tsx",
                    lineNumber: 27,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Select.tsx",
                lineNumber: 26,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Select.tsx",
        lineNumber: 17,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c1 = SelectTrigger;
SelectTrigger.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"].displayName;
const SelectScrollUpButton = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollUpButton"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/Select.tsx",
            lineNumber: 42,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Select.tsx",
        lineNumber: 37,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c2 = SelectScrollUpButton;
SelectScrollUpButton.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollUpButton"].displayName;
const SelectScrollDownButton = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollDownButton"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/Select.tsx",
            lineNumber: 56,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Select.tsx",
        lineNumber: 51,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c3 = SelectScrollDownButton;
SelectScrollDownButton.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollDownButton"].displayName;
const SelectContent = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c4 = ({ className, children, position = "popper", ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            ref: ref,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white text-slate-900 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
            position: position,
            ...props,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollUpButton, {}, void 0, false, {
                    fileName: "[project]/src/components/ui/Select.tsx",
                    lineNumber: 77,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-1 max-h-96 overflow-y-auto", position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]"),
                    children: children
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/Select.tsx",
                    lineNumber: 78,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollDownButton, {}, void 0, false, {
                    fileName: "[project]/src/components/ui/Select.tsx",
                    lineNumber: 86,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ui/Select.tsx",
            lineNumber: 66,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Select.tsx",
        lineNumber: 65,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c5 = SelectContent;
SelectContent.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"].displayName;
const SelectLabel = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c6 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("py-1.5 pl-8 pr-2 text-sm font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Select.tsx",
        lineNumber: 96,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c7 = SelectLabel;
SelectLabel.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"].displayName;
const SelectItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c8 = ({ className, children, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-sky-50 data-[highlighted]:text-slate-900", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                        className: "h-4 w-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Select.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/Select.tsx",
                    lineNumber: 113,
                    columnNumber: 7
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Select.tsx",
                lineNumber: 112,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemText"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Select.tsx",
                lineNumber: 118,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Select.tsx",
        lineNumber: 104,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c9 = SelectItem;
SelectItem.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"].displayName;
const SelectSeparator = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"](_c10 = ({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("-mx-1 my-1 h-px bg-muted", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Select.tsx",
        lineNumber: 127,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0)));
_c11 = SelectSeparator;
SelectSeparator.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"].displayName;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
__turbopack_context__.k.register(_c, "SelectTrigger$React.forwardRef");
__turbopack_context__.k.register(_c1, "SelectTrigger");
__turbopack_context__.k.register(_c2, "SelectScrollUpButton");
__turbopack_context__.k.register(_c3, "SelectScrollDownButton");
__turbopack_context__.k.register(_c4, "SelectContent$React.forwardRef");
__turbopack_context__.k.register(_c5, "SelectContent");
__turbopack_context__.k.register(_c6, "SelectLabel$React.forwardRef");
__turbopack_context__.k.register(_c7, "SelectLabel");
__turbopack_context__.k.register(_c8, "SelectItem$React.forwardRef");
__turbopack_context__.k.register(_c9, "SelectItem");
__turbopack_context__.k.register(_c10, "SelectSeparator$React.forwardRef");
__turbopack_context__.k.register(_c11, "SelectSeparator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/dashboard/model/ModelLibrary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ModelLibrary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react-dom/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/stores/modelStore.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useUserLevel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useUserLevel.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$UserLevelChip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/UserLevelChip.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageTitle$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/usePageTitle.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabaseData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/supabaseData.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/backendClient.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dropdown-menu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/Select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis-vertical.js [app-client] (ecmascript) <export default as MoreVertical>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/archive.js [app-client] (ecmascript) <export default as Archive>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layout-grid.js [app-client] (ecmascript) <export default as LayoutGrid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/package.js [app-client] (ecmascript) <export default as Package>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cpu.js [app-client] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-client] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
;
;
;
;
;
;
;
;
function ModelLibrary() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageTitle$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePageTitle"])('Model Library');
    const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[models]": (s)=>s.models
    }["ModelLibrary.useModelStore[models]"]);
    const modelsLoaded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[modelsLoaded]": (s)=>s.modelsLoaded
    }["ModelLibrary.useModelStore[modelsLoaded]"]);
    const modelsLoading = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[modelsLoading]": (s)=>s.modelsLoading
    }["ModelLibrary.useModelStore[modelsLoading]"]);
    const loadModels = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[loadModels]": (s)=>s.loadModels
    }["ModelLibrary.useModelStore[loadModels]"]);
    const createModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[createModel]": (s)=>s.createModel
    }["ModelLibrary.useModelStore[createModel]"]);
    const duplicateModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[duplicateModel]": (s)=>s.duplicateModel
    }["ModelLibrary.useModelStore[duplicateModel]"]);
    const deleteModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[deleteModel]": (s)=>s.deleteModel
    }["ModelLibrary.useModelStore[deleteModel]"]);
    const renameModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[renameModel]": (s)=>s.renameModel
    }["ModelLibrary.useModelStore[renameModel]"]);
    const toggleStar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[toggleStar]": (s)=>s.toggleStar
    }["ModelLibrary.useModelStore[toggleStar]"]);
    const archiveModel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"])({
        "ModelLibrary.useModelStore[archiveModel]": (s)=>s.archiveModel
    }["ModelLibrary.useModelStore[archiveModel]"]);
    const { signOut, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const fetchUserLevel = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useUserLevel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserLevelStore"])({
        "ModelLibrary.useUserLevelStore[fetchUserLevel]": (s)=>s.fetchUserLevel
    }["ModelLibrary.useUserLevelStore[fetchUserLevel]"]);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const importRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('grid');
    const [showCreate, setShowCreate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [newName, setNewName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [newDesc, setNewDesc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [showArchived, setShowArchived] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [deleteTarget, setDeleteTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deleteConfirmName, setDeleteConfirmName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [renameTarget, setRenameTarget] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [renameValue, setRenameValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [importing, setImporting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ModelLibrary.useEffect": ()=>{
            if (!modelsLoaded && !modelsLoading) loadModels();
            fetchUserLevel();
        }
    }["ModelLibrary.useEffect"], [
        modelsLoaded,
        modelsLoading,
        loadModels,
        fetchUserLevel
    ]);
    const filtered = models.filter((m)=>{
        if (!showArchived && m.is_archived) return false;
        if (showArchived && !m.is_archived) return false;
        if (statusFilter !== 'all' && m.run_status !== statusFilter) return false;
        const q = search.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q);
    });
    const handleCreate = ()=>{
        if (!newName.trim()) return;
        const id = createModel(newName.trim(), newDesc.trim());
        setShowCreate(false);
        setNewName('');
        setNewDesc('');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flushSync"])(()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"].getState().setActiveModel(id);
        });
        router.push('/dashboard/generaldata');
    };
    const handleDelete = ()=>{
        if (!deleteTarget || deleteConfirmName !== deleteTarget.name) return;
        deleteModel(deleteTarget.id);
        setDeleteTarget(null);
        setDeleteConfirmName('');
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Model "${deleteTarget.name}" permanently deleted`);
    };
    const handleRename = ()=>{
        if (!renameTarget || !renameValue.trim()) return;
        renameModel(renameTarget.id, renameValue.trim());
        setRenameTarget(null);
        setRenameValue('');
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Model renamed');
    };
    const handleSignOut = async ()=>{
        await signOut();
        router.push('/login');
    };
    const openModel = (id)=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flushSync"])(()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"].getState().setActiveModel(id);
        });
        router.push('/dashboard/overview');
    };
    const handleExportModel = (model)=>{
        const exportData = {
            name: model.name,
            description: model.description,
            tags: model.tags,
            general: model.general,
            labor: model.labor,
            equipment: model.equipment,
            products: model.products,
            operations: model.operations,
            routing: model.routing,
            ibom: model.ibom
        };
        const blob = new Blob([
            JSON.stringify(exportData, null, 2)
        ], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `${model.name.replace(/\s+/g, '-')}-export-${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Model exported');
    };
    const handleImport = async (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        setImporting(true);
        try {
            const text = await file.text();
            const snap = JSON.parse(text);
            if (!snap.general || !snap.labor || !snap.equipment || !snap.products) {
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Invalid model file — missing required data sections');
                setImporting(false);
                return;
            }
            const { createDemoModel } = await __turbopack_context__.A("[project]/src/stores/modelStore.ts [app-client] (ecmascript, async loader)");
            const uid = ()=>crypto.randomUUID();
            const idMap = {};
            const newUid = (old)=>{
                const n = uid();
                idMap[old] = n;
                return n;
            };
            // Build imported model with new IDs
            const modelId = uid();
            const labor = (snap.labor || []).map((l)=>({
                    ...l,
                    id: newUid(l.id)
                }));
            const equipment = (snap.equipment || []).map((e)=>({
                    ...e,
                    id: newUid(e.id),
                    labor_group_id: e.labor_group_id ? idMap[e.labor_group_id] || e.labor_group_id : ''
                }));
            const products = (snap.products || []).map((p)=>({
                    ...p,
                    id: newUid(p.id)
                }));
            const operations = (snap.operations || []).map((o)=>({
                    ...o,
                    id: newUid(o.id),
                    product_id: idMap[o.product_id] || o.product_id,
                    equip_id: o.equip_id ? idMap[o.equip_id] || o.equip_id : ''
                }));
            const routing = (snap.routing || []).map((r)=>({
                    ...r,
                    id: uid(),
                    product_id: idMap[r.product_id] || r.product_id
                }));
            const ibom = (snap.ibom || []).map((i)=>({
                    ...i,
                    id: uid(),
                    parent_product_id: idMap[i.parent_product_id] || i.parent_product_id,
                    component_product_id: idMap[i.component_product_id] || i.component_product_id
                }));
            const importedModel = {
                id: modelId,
                name: `${snap.name || 'Imported Model'} (Imported)`,
                description: snap.description || '',
                tags: snap.tags || [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                last_run_at: null,
                run_status: 'never_run',
                is_archived: false,
                is_demo: false,
                is_starred: false,
                general: snap.general,
                param_names: snap.param_names || {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["defaultParamNames"]
                },
                labor,
                equipment,
                products,
                operations,
                routing,
                ibom
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$backendClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveFullModelToDB"])(importedModel);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"].setState((s)=>({
                    models: [
                        importedModel,
                        ...s.models
                    ]
                }));
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(`Model "${importedModel.name}" imported successfully`);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2d$dom$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["flushSync"])(()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"].getState().setActiveModel(modelId);
            });
            router.push('/dashboard/overview');
        } catch (err) {
            console.error('Import error:', err);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error('Failed to import model — invalid file format');
        } finally{
            setImporting(false);
            if (importRef.current) importRef.current.value = '';
        }
    };
    const statusBadge = (status)=>{
        const map = {
            never_run: {
                label: 'Never Run',
                className: 'bg-muted text-muted-foreground'
            },
            current: {
                label: 'Current',
                className: 'bg-success/15 text-success border-success/30'
            },
            needs_recalc: {
                label: 'Recalc Needed',
                className: 'bg-warning/15 text-warning border-warning/30'
            }
        };
        const c = map[status];
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
            variant: "outline",
            className: `text-xs ${c.className}`,
            children: c.label
        }, void 0, false, {
            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
            lineNumber: 197,
            columnNumber: 12
        }, this);
    };
    const timeAgo = (iso)=>{
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };
    const modelActions = (model)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenu"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuTrigger"], {
                    asChild: true,
                    onClick: (e)=>e.stopPropagation(),
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "p-1 rounded hover:bg-muted",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2d$vertical$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreVertical$3e$__["MoreVertical"], {
                            className: "h-4 w-4 text-muted-foreground"
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 212,
                            columnNumber: 56
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                        lineNumber: 212,
                        columnNumber: 9
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                    lineNumber: 211,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuContent"], {
                    align: "end",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                            onClick: (e)=>{
                                e.stopPropagation();
                                setRenameTarget(model);
                                setRenameValue(model.name);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
                                    className: "h-4 w-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 216,
                                    columnNumber: 11
                                }, this),
                                " Rename"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 215,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                            onClick: (e)=>{
                                e.stopPropagation();
                                duplicateModel(model.id);
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Model duplicated');
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                    className: "h-4 w-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 219,
                                    columnNumber: 11
                                }, this),
                                " Duplicate"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 218,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                            onClick: (e)=>{
                                e.stopPropagation();
                                handleExportModel(model);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                    className: "h-4 w-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 222,
                                    columnNumber: 11
                                }, this),
                                " Export JSON"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 221,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                            onClick: (e)=>{
                                e.stopPropagation();
                                archiveModel(model.id);
                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(model.is_archived ? 'Model restored' : 'Model archived');
                            },
                            children: [
                                model.is_archived ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                    className: "h-4 w-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 225,
                                    columnNumber: 32
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"], {
                                    className: "h-4 w-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 225,
                                    columnNumber: 73
                                }, this),
                                model.is_archived ? 'Restore' : 'Archive'
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 224,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuSeparator"], {}, void 0, false, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 228,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dropdown$2d$menu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DropdownMenuItem"], {
                            onClick: (e)=>{
                                e.stopPropagation();
                                setDeleteTarget(model);
                                setDeleteConfirmName('');
                            },
                            className: "text-destructive",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    className: "h-4 w-4 mr-2"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 230,
                                    columnNumber: 11
                                }, this),
                                " Delete"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 229,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                    lineNumber: 214,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
            lineNumber: 210,
            columnNumber: 5
        }, this);
    if (modelsLoading && !modelsLoaded) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                        lineNumber: 240,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-muted-foreground",
                        children: "Loading models…"
                    }, void 0, false, {
                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                        lineNumber: 241,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                lineNumber: 239,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
            lineNumber: 238,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-background",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                ref: importRef,
                type: "file",
                accept: ".json",
                className: "hidden",
                onChange: handleImport
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                lineNumber: 249,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "border-b bg-card",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto px-6 py-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-2xl font-bold tracking-tight",
                                            children: "RapidMCT"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 254,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-muted-foreground mt-1",
                                            children: "Manufacturing Cycle Time Analysis Platform"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 255,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 253,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            size: "sm",
                                            className: "gap-1",
                                            onClick: ()=>importRef.current?.click(),
                                            disabled: importing,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                    lineNumber: 259,
                                                    columnNumber: 17
                                                }, this),
                                                " ",
                                                importing ? 'Importing…' : 'Import'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 258,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            onClick: ()=>setShowCreate(true),
                                            className: "gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                    lineNumber: 262,
                                                    columnNumber: 17
                                                }, this),
                                                " New Model"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 261,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$UserLevelChip$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["UserLevelChip"], {}, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 264,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "ghost",
                                            size: "icon",
                                            onClick: ()=>router.push('/settings'),
                                            title: "Settings",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 266,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 265,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "ghost",
                                            size: "sm",
                                            onClick: handleSignOut,
                                            className: "gap-1 text-muted-foreground",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                    lineNumber: 269,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "hidden sm:inline",
                                                    children: user
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                    lineNumber: 270,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 268,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 257,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 252,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative flex-1 max-w-md",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                            className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 277,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            placeholder: "Search models...",
                                            value: search,
                                            onChange: (e)=>setSearch(e.target.value),
                                            className: "pl-9"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 278,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 276,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                    value: statusFilter,
                                    onValueChange: (v)=>setStatusFilter(v),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                            className: "w-40 h-9 text-xs",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {}, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 281,
                                                columnNumber: 59
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 281,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                    value: "all",
                                                    children: "All Statuses"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                    lineNumber: 283,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                    value: "never_run",
                                                    children: "Never Run"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                    lineNumber: 284,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                    value: "current",
                                                    children: "Results Current"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                    lineNumber: 285,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$Select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                    value: "needs_recalc",
                                                    children: "Recalc Needed"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                    lineNumber: 286,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 282,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 280,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: showArchived ? 'secondary' : 'ghost',
                                    size: "sm",
                                    onClick: ()=>setShowArchived(!showArchived),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"], {
                                            className: "h-4 w-4 mr-1"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 290,
                                            columnNumber: 15
                                        }, this),
                                        " ",
                                        showArchived ? 'Archived' : 'Active'
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 289,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex border rounded-md overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: viewMode === 'grid' ? 'secondary' : 'ghost',
                                            size: "icon",
                                            className: "h-8 w-8 rounded-none",
                                            onClick: ()=>setViewMode('grid'),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$grid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutGrid$3e$__["LayoutGrid"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 294,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 293,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: viewMode === 'list' ? 'secondary' : 'ghost',
                                            size: "icon",
                                            className: "h-8 w-8 rounded-none",
                                            onClick: ()=>setViewMode('list'),
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 297,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 296,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 292,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 275,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                    lineNumber: 251,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                lineNumber: 250,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-6 py-6",
                children: filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-20 text-muted-foreground",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                            className: "h-12 w-12 mx-auto mb-3 opacity-30"
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 307,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-lg font-medium",
                            children: "No models found"
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 308,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mt-1",
                            children: search ? 'Try a different search term' : 'Create a new model or import one to get started'
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 309,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 justify-center mt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: ()=>setShowCreate(true),
                                    className: "gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 311,
                                            columnNumber: 77
                                        }, this),
                                        " Create Model"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 311,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    onClick: ()=>importRef.current?.click(),
                                    className: "gap-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 312,
                                            columnNumber: 102
                                        }, this),
                                        " Import"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 312,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 310,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                    lineNumber: 306,
                    columnNumber: 11
                }, this) : viewMode === 'grid' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
                    children: filtered.map((model, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                y: 8
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            transition: {
                                delay: i * 0.04
                            },
                            className: "group bg-card border rounded-lg hover:border-primary/40 hover:shadow-md transition-all cursor-pointer",
                            onClick: ()=>openModel(model.id),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start justify-between mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 min-w-0",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "font-semibold truncate",
                                                        children: model.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                        lineNumber: 325,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-muted-foreground mt-1 line-clamp-2",
                                                        children: model.description || 'No description'
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                        lineNumber: 326,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 324,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1 ml-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: (e)=>{
                                                            e.stopPropagation();
                                                            toggleStar(model.id);
                                                        },
                                                        className: "p-1 rounded hover:bg-muted",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                            className: `h-4 w-4 ${model.is_starred ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                            lineNumber: 330,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                        lineNumber: 329,
                                                        columnNumber: 23
                                                    }, this),
                                                    modelActions(model)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 328,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                        lineNumber: 323,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-1.5 mb-3",
                                        children: [
                                            model.tags.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    variant: "secondary",
                                                    className: "text-xs",
                                                    children: t
                                                }, t, false, {
                                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                    lineNumber: 336,
                                                    columnNumber: 44
                                                }, this)),
                                            statusBadge(model.run_status)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                        lineNumber: 335,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 text-xs text-muted-foreground font-mono",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$package$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Package$3e$__["Package"], {
                                                        className: "h-3 w-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                        lineNumber: 340,
                                                        columnNumber: 63
                                                    }, this),
                                                    model.products.length
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 340,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__["Cpu"], {
                                                        className: "h-3 w-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                        lineNumber: 341,
                                                        columnNumber: 63
                                                    }, this),
                                                    model.equipment.length
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 341,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                        className: "h-3 w-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                        lineNumber: 342,
                                                        columnNumber: 63
                                                    }, this),
                                                    model.labor.length
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 342,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                        lineNumber: 339,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-muted-foreground mt-3",
                                        children: [
                                            "Updated ",
                                            timeAgo(model.updated_at)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                        lineNumber: 344,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                lineNumber: 322,
                                columnNumber: 17
                            }, this)
                        }, model.id, false, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 318,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                    lineNumber: 316,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-card border rounded-lg overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                        className: "w-full text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-b bg-muted/30",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "text-left px-4 py-2.5 font-medium text-muted-foreground",
                                            children: "Name"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 354,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "text-left px-4 py-2.5 font-medium text-muted-foreground",
                                            children: "Products"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 355,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "text-left px-4 py-2.5 font-medium text-muted-foreground",
                                            children: "Equipment"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 356,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "text-left px-4 py-2.5 font-medium text-muted-foreground",
                                            children: "Status"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 357,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "text-left px-4 py-2.5 font-medium text-muted-foreground",
                                            children: "Updated"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 358,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                            className: "w-10"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 359,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 353,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                lineNumber: 352,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                children: filtered.map((model)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-b last:border-0 hover:bg-muted/20 cursor-pointer",
                                        onClick: ()=>openModel(model.id),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 font-medium",
                                                children: model.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 365,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 font-mono text-muted-foreground",
                                                children: model.products.length
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 366,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 font-mono text-muted-foreground",
                                                children: model.equipment.length
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 367,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3",
                                                children: statusBadge(model.run_status)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 368,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-4 py-3 text-muted-foreground",
                                                children: timeAgo(model.updated_at)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 369,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                className: "px-2",
                                                children: modelActions(model)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                                lineNumber: 370,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, model.id, true, {
                                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                        lineNumber: 364,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                lineNumber: 362,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                        lineNumber: 351,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                    lineNumber: 350,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                lineNumber: 304,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
                open: showCreate,
                onOpenChange: setShowCreate,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                children: "Create New Model"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                lineNumber: 382,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 382,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-4 py-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium mb-1 block",
                                            children: "Model Name"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 385,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            value: newName,
                                            onChange: (e)=>setNewName(e.target.value),
                                            placeholder: "e.g., Q4 Production Cell",
                                            autoFocus: true,
                                            onKeyDown: (e)=>e.key === 'Enter' && handleCreate()
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 386,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 384,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium mb-1 block",
                                            children: "Description (optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 389,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            value: newDesc,
                                            onChange: (e)=>setNewDesc(e.target.value),
                                            placeholder: "Brief description of this model"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 390,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 388,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 383,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "ghost",
                                    onClick: ()=>setShowCreate(false),
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 394,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: handleCreate,
                                    disabled: !newName.trim(),
                                    children: "Create Model"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 395,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 393,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                    lineNumber: 381,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                lineNumber: 380,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
                open: !!deleteTarget,
                onOpenChange: (open)=>{
                    if (!open) {
                        setDeleteTarget(null);
                        setDeleteConfirmName('');
                    }
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                    children: "Delete Model"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 404,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                                    children: [
                                        "This will permanently delete ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            children: [
                                                '"',
                                                deleteTarget?.name,
                                                '"'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                            lineNumber: 406,
                                            columnNumber: 44
                                        }, this),
                                        " and all its data. This action cannot be undone."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 405,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 403,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "py-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-sm font-medium mb-1.5 block",
                                    children: "Type the model name to confirm:"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 410,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                    value: deleteConfirmName,
                                    onChange: (e)=>setDeleteConfirmName(e.target.value),
                                    placeholder: deleteTarget?.name,
                                    autoFocus: true
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 411,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 409,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "ghost",
                                    onClick: ()=>{
                                        setDeleteTarget(null);
                                        setDeleteConfirmName('');
                                    },
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 414,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "destructive",
                                    onClick: handleDelete,
                                    disabled: deleteConfirmName !== deleteTarget?.name,
                                    children: "Delete Permanently"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 415,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 413,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                    lineNumber: 402,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                lineNumber: 401,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
                open: !!renameTarget,
                onOpenChange: (open)=>{
                    if (!open) setRenameTarget(null);
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                children: "Rename Model"
                            }, void 0, false, {
                                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                lineNumber: 423,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 423,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-sm font-medium mb-1 block",
                                    children: "New Name"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 425,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                    value: renameValue,
                                    onChange: (e)=>setRenameValue(e.target.value),
                                    autoFocus: true,
                                    onKeyDown: (e)=>e.key === 'Enter' && handleRename()
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 426,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 424,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "ghost",
                                    onClick: ()=>setRenameTarget(null),
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 429,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: handleRename,
                                    disabled: !renameValue.trim(),
                                    children: "Rename"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                                    lineNumber: 430,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                            lineNumber: 428,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                    lineNumber: 422,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
                lineNumber: 421,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/dashboard/model/ModelLibrary.tsx",
        lineNumber: 248,
        columnNumber: 5
    }, this);
}
_s(ModelLibrary, "EeueKn7noJyoTuesf1KPHe8EU0E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageTitle$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePageTitle"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$stores$2f$modelStore$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useModelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useUserLevel$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUserLevelStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = ModelLibrary;
var _c;
__turbopack_context__.k.register(_c, "ModelLibrary");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/library/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LibraryPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$model$2f$ModelLibrary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/dashboard/model/ModelLibrary.tsx [app-client] (ecmascript)");
"use client";
;
;
function LibraryPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$dashboard$2f$model$2f$ModelLibrary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/library/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = LibraryPage;
var _c;
__turbopack_context__.k.register(_c, "LibraryPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_f280cfb6._.js.map