function parseBoolean(value) {
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return Boolean(value);
}

// Reading query params
const scriptElement = document.getElementById("formproofScript");
let token_formtrace = ''
let automaticRecord_formtrace = true;
let saveOnSubmit_formtrace = true;
let keepVideo_formtrace = false;
let tfaTwilio_formtrace = false;
let blackList_formtrace = false;
let phoneInputId_formtrace = ''
let privacityInputId_formtrace = ''
let guide_formtrace = ''
let callback_formtrace = ''
let formTraceId = ''
let debug_formtrace = false;
let baseApi_formtrace = 'https://inspired-src-stvyv.ampt.app/api'
let regex = /^(\+1)?[ ()-]*((?!(\d)\3{9})\d{3}[ ()-]?\d{3}[ ()-]?\d{4})$/
let epd_formtrace = '';
let esp_formtrace = '';
let redirectId_formtrace = '';
const urlParamsBrowser = new URLSearchParams(window.location.search);
const recordingIdFromBrowser = urlParamsBrowser.get("formTraceId");
let redirectValue_formtrace = '';


const hiddenFormTraceInputId = document.getElementById("redirectId");
if (hiddenFormTraceInputId) {
    hiddenFormTraceInputId.value = recordingIdFromBrowser;
}


if (scriptElement) {
    const scriptSrc = scriptElement.getAttribute("src");
    const urlParams = new URLSearchParams(scriptSrc.split("?")[1]);
    token_formtrace = urlParams.get("token");
    phoneInputId_formtrace = urlParams.get("phoneInputId");
    callback_formtrace = urlParams.get("callback");
    guide_formtrace = urlParams.get("guide")
    formTraceId = recordingIdFromBrowser;
    debug_formtrace = parseBoolean(urlParams.get("debug"));
    epd_formtrace = parseBoolean(urlParams.get("epd"))
    esp_formtrace = parseBoolean(urlParams.get("esp"))
    tfaTwilio_formtrace = parseBoolean(urlParams.get("tfaTwilio"));
    keepVideo_formtrace = urlParams.get("keepVideo") ? urlParams.get("keepVideo") : false;
    blackList_formtrace = parseBoolean(urlParams.get("blackList"));
    privacityInputId_formtrace = urlParams.get("privacityId");
    redirectId_formtrace = urlParams.get("redirectId");
    saveOnSubmit_formtrace = urlParams.get("saveOnSubmit") ? urlParams.get("saveOnSubmit") : true;
} else {
    console.error("You need add id='formproofScript' to script")
}
const events_formtrace = [];
const formTraceApiSave = `${baseApi_formtrace}/recordings`;
let savingLoading_formtrace = false;
let record_formtrace = true;
const sendTfaCodeApi = `${baseApi_formtrace}/tfa/sendCode`;
const validateTfCodeApi = `${baseApi_formtrace}/tfa/validate`;
const validateBlackListApi = `${baseApi_formtrace}/blacklist`;

if (automaticRecord_formtrace) {
    console.log('formTrace v.__VERSION__ initialized');
    const hiddenFormTrace = document.getElementById(redirectId_formtrace);
    if (hiddenFormTrace?.value) {
        redirectValue_formtrace = hiddenFormTrace.value || '';
    }
    if (debug_formtrace && guide_formtrace) {
        alert("Formtrace loaded coreg");
    } else if (debug_formtrace && debug_formtrace === true) {
        let alertMessage = "Formtrace loaded normal";
        alertMessage += redirectValue_formtrace ? ` | redirect: ${redirectValue_formtrace}` : ` | no redirect`;
        const termsText = document.getElementById(privacityInputId_formtrace);
        if (termsText) {
            alertMessage += ` | terms detected @ ${privacityInputId_formtrace}`;
        } else {
            alertMessage += ` | no terms detected`;
        }
        alert(alertMessage);
    }
    formTraceStartRecord();
}

function formTraceStartRecord() {
    rrweb.record({
        emit(event) {
            if (record_formtrace) {
                events_formtrace.push(event);
            }
        },
        recordCanvas: true,
        packFn: rrweb.packFn,
    });
}

// document.addEventListener("DOMContentLoaded", () => {
//     document.addEventListener("submit", async (event) => {
//
//         if (epd_formtrace && epd_formtrace === true) {
//             event.preventDefault();
//         }
//
//         if (esp_formtrace && esp_formtrace === true) {
//             event.stopPropagation();
//         }
//
//         const hiddenFormTrace = document.getElementById(redirectId_formtrace);
//         const termsText = document.getElementById(privacityInputId_formtrace);
//
//         if (debug_formtrace && debug_formtrace === true) {
//             let alertMessage = "Formtrace Submit Intercepted";
//
//             if (hiddenFormTrace?.value) {
//                 alertMessage += ` | redirect: ${hiddenFormTrace.value}`;
//             } else {
//                 alertMessage += ` | no redirect`;
//             }
//
//             if (termsText) {
//                 alertMessage += ` | terms detected @ ${privacityInputId_formtrace}`;
//             } else {
//                 alertMessage += ` | no terms detected`;
//             }
//
//             alert(alertMessage);
//             console.log("Form submission blocked:", event.target);
//         }
//
//         if (esp_formtrace === false) {
//             if (tfaTwilio_formtrace && tfaTwilio_formtrace === true && blackList_formtrace === false) {
//                 await tfaValidation(tfaTwilio_formtrace, phoneInputId_formtrace, sendTfaCodeApi, validateTfCodeApi, saveOnSubmit_formtrace, event);
//             }
//             else if (blackList_formtrace && blackList_formtrace === true) {
//                 await blackListPhone(tfaTwilio_formtrace, blackList_formtrace, phoneInputId_formtrace, validateBlackListApi, saveOnSubmit_formtrace, event);
//             }
//             else {
//                 await saveRecording(saveOnSubmit_formtrace, event);
//             }
//         }
//     }, true);
// });


let _ft_allowSubmit_once = false;

async function _ft_runAsyncPipeline(evt) {
    // mirror your existing branching
    if (esp_formtrace === false) {
        if (tfaTwilio_formtrace && tfaTwilio_formtrace === true && blackList_formtrace === false) {
            await tfaValidation(tfaTwilio_formtrace, phoneInputId_formtrace, sendTfaCodeApi, validateTfCodeApi, saveOnSubmit_formtrace, evt);
        } else if (blackList_formtrace && blackList_formtrace === true) {
            await blackListPhone(tfaTwilio_formtrace, blackList_formtrace, phoneInputId_formtrace, validateBlackListApi, saveOnSubmit_formtrace, evt);
        } else {
            await saveRecording(saveOnSubmit_formtrace, evt); // alias added below
        }
    }
}

function _ft_resumeSubmit(eOrForm, submitter) {
    console.log('_ft_resumeSubmit');
    const form = eOrForm?.target || eOrForm;
    const btn = submitter ?? eOrForm?.submitter;

    _ft_allowSubmit_once = true;

    if (btn && typeof form.requestSubmit === 'function') {
        // replays a real submit with the same button context (keeps validation & server OnClick)
        form.requestSubmit(btn);
        return;
    }

    // Fallbacks
    const evTarget = document.getElementById('__EVENTTARGET')?.value || null;
    const evArg = document.getElementById('__EVENTARGUMENT')?.value || '';
    if (evTarget && typeof window.__doPostBack === 'function') {
        window.__doPostBack(evTarget, evArg);
    } else if (btn?.name) {
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = btn.name;
        hidden.value = btn.value || '1';
        form.appendChild(hidden);
        form.submit();
    } else {
        form.submit();
    }
}



document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("submit", async (event) => {
        console.log('init submit')
        // let the resumed/native submit through once (prevents loops)
        if (_ft_allowSubmit_once) return;

        if (epd_formtrace && epd_formtrace === true) event.preventDefault();
        if (esp_formtrace && esp_formtrace === true) event.stopPropagation();

        if (debug_formtrace && debug_formtrace === true) {
            const hiddenFormTrace = document.getElementById(redirectId_formtrace);
            const termsText = document.getElementById(privacityInputId_formtrace);

            let alertMessage = "Formtrace Submit Intercepted";

            if (hiddenFormTrace?.value) {
                alertMessage += ` | redirect: ${hiddenFormTrace.value}`;
            } else {
                alertMessage += ` | no redirect`;
            }
            if (termsText) {
                alertMessage += ` | terms detected @ ${privacityInputId_formtrace}`;
            } else {
                alertMessage += ` | no terms detected`;
            }

            alert(alertMessage);
            console.log("Form submission blocked:", event.target);
        }

        // run your async pipeline (TFA / blacklist / save)
        console.log('run your async pipeline');
        await _ft_runAsyncPipeline(event);

        // if you didn't redirect inside your save, resume the submit so server OnClick fires
        if (epd_formtrace && epd_formtrace === true) {
            _ft_resumeSubmit(event, event.submitter);
        }
    }, true);
});


(() => {
    const wrap = (name) => {
        const orig = window[name];
        if (typeof orig !== 'function') return;
        window[name] = function (...args) {
            if (_ft_allowSubmit_once) return orig.apply(this, args);
            (async () => {
                try {
                    await _ft_runAsyncPipeline(); // no event object on this path
                } finally {
                    _ft_allowSubmit_once = true;
                    orig.apply(this, args); // proceed with the original postback
                }
            })();
        };
    };
    wrap('WebForm_DoPostBackWithOptions');
    wrap('__doPostBack');
})();

function generateUUID() {
    return crypto.randomUUID();
}

function createHiddenInput(id, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.id = id;
    input.name = id;
    input.value = value;
    return input;
}

async function formTraceSaveRecordWithOnsubmitEvent(data) {
  console.log("🔍 INICIO - Datos recibidos:", data);
  console.log("🔍 Token disponible:", token_formtrace);
    savingLoading_formtrace = true;
    record_formtrace = false;
    const termsText = document.getElementById(privacityInputId_formtrace);
    if (termsText) {
        data['terms'] = termsText.innerText;
    }

    let formTraceIdValue;

    if (recordingIdFromBrowser) {
        formTraceIdValue = recordingIdFromBrowser;
    console.log("🔄 Usando ID existente:", formTraceIdValue);
    } else if (guide_formtrace || redirectId_formtrace) {
        formTraceIdValue = generateUUID();
    console.log("�� Generando nuevo ID:", formTraceIdValue);
    } else {
        formTraceIdValue = generateUUID();
    console.log("🆔 Generando ID por defecto:", formTraceIdValue);
    }

    const searchForm = document.getElementById("formproofScript")?.closest('form') || document.querySelector('form');

    if (formTraceIdValue && searchForm) {
        searchForm.appendChild(createHiddenInput('formTraceId', formTraceIdValue));
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
    console.log("🌐 Obteniendo IP del cliente...");
        const responseIp = await fetch("https://api.ipify.org/?format=json");
        const responseAsJson = await responseIp.json();
        const clientIp = responseAsJson?.ip;
        const eventsToSubmit = events_formtrace
    console.log("🎬 Eventos grabados:", eventsToSubmit.length);
        const status = !recordingIdFromBrowser && guide_formtrace ? "partial" :
            redirectId_formtrace && !guide_formtrace ? "partial-followMe" :
                "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            clientToken: token_formtrace || '',
            status: status
        };

        if (!recordingIdFromBrowser && (guide_formtrace || redirectId_formtrace)) {
            dataSubmit.provider = guide_formtrace
            dataSubmit.formTraceId = formTraceIdValue;
        }

        if (formTraceIdValue) {
            dataSubmit.formTraceId = formTraceIdValue;
        }
    console.log("📤 Datos a enviar a la API:", dataSubmit);
    console.log("🎯 URL de destino:", formTraceApiSave);

        const response = await saveRecordings(dataSubmit);
    console.log("✅ Respuesta de la API:", response);
        const responseAsJson2 = await response.json();
    console.log("�� Datos de respuesta:", responseAsJson2);

        if (redirectValue_formtrace !== "") {
            const redirectUrl = new URL(redirectValue_formtrace);
            redirectUrl.searchParams.set('formTraceId', formTraceIdValue);
            window.location.href = redirectUrl.toString();
        }

        if (callback_formtrace) {
            test({form: data, formProofResponse: responseAsJson2});
        }
        return responseAsJson2;
    } catch (error) {
        console.error("Error al guardar la grabación:", error);
    } finally {
        savingLoading_formtrace = false;
    }
}


async function formTraceSaveRecord(data = {}) {
    savingLoading_formtrace = true;
    record_formtrace = false;
    const termsText = document.getElementById(privacityInputId_formtrace);
    if (termsText) {
        data['terms'] = termsText.innerText;
    }

    let formTraceIdValue = recordingIdFromBrowser || ((guide_formtrace || redirectId_formtrace) && generateUUID());
    const searchForm = document.getElementById("formproofScript")?.closest('form') || document.querySelector('form');

    if (formTraceIdValue && searchForm) {
        searchForm.appendChild(createHiddenInput('formTraceId', formTraceIdValue));
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
        const responseIp = await fetch("https://api.ipify.org/?format=json");
        const responseAsJson = await responseIp.json();
        const clientIp = responseAsJson?.ip;
        const eventsToSubmit = events_formtrace
        const status = !recordingIdFromBrowser && guide_formtrace ? "partial" : "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            clientToken: token_formtrace || '',
            status: status
        };

        if (!recordingIdFromBrowser && (guide_formtrace || redirectId_formtrace)) {
            dataSubmit.provider = guide_formtrace
            dataSubmit.formTraceId = formTraceIdValue;
        }

        const response = await saveRecordings(dataSubmit);
        const responseAsJson2 = await response.json();

        const hiddenFormTraceInput = document.getElementById(redirectId_formtrace);
        if (hiddenFormTraceInput?.value) {
            const redirectUrl = new URL(hiddenFormTraceInput.value);
            redirectUrl.searchParams.set('formTraceId', formTraceIdValue);
            window.location.href = redirectUrl.toString();
        }

        if (callback_formtrace) {
            test({form: data, formProofResponse: responseAsJson2});
        }
        return responseAsJson2;
    } catch (error) {
        console.error("Error al guardar la grabación:", error);
    } finally {
        savingLoading_formtrace = false;
    }
}

window.formTraceSaveRecord = formTraceSaveRecord;


