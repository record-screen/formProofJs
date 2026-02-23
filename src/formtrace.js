function parseBoolean(value) {
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return Boolean(value);
}

// Reading query params
const formtraceScriptElement = document.getElementById("formproofScript");
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
let baseApi_formtrace = 'base_api_value'
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


if (formtraceScriptElement) {
    const scriptSrc = formtraceScriptElement.getAttribute("src");
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

// Flag para evitar doble procesamiento
let _formtraceProcessing = false;
let _pendingPostBack = null;

// Internal handler function for form submissions
async function handleFormTraceSubmit(event, fromDoPostBack = false) {
    // Evitar procesamiento duplicado
    if (_formtraceProcessing) {
        if (debug_formtrace) {
            console.log('formTrace#skipping duplicate processing');
        }
        return;
    }

    const hiddenFormTrace = document.getElementById(redirectId_formtrace);
    const termsText = document.getElementById(privacityInputId_formtrace);

    if (debug_formtrace && debug_formtrace === true) {
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

        if (fromDoPostBack || !event || !(event.target instanceof HTMLFormElement)) {
            alertMessage += ` | __doPostBack mode`;
        }

        alertMessage += ` | edp=${epd_formtrace} esp=${esp_formtrace}`;

        alert(alertMessage);
        console.log("Form submission handled:", event?.target || 'via __doPostBack');
    }

    // Modo organico para ASP.NET: fire-and-forget sin bloquear el flujo
    // Solo bloquear si hay TFA o BlackList activos
    const needsBlocking = (tfaTwilio_formtrace === true && blackList_formtrace === false) ||
                          (blackList_formtrace === true);

    if (needsBlocking) {
        // Modo que requiere interaccion del usuario - bloquear el flujo
        if (event) {
            event.preventDefault();
            if (esp_formtrace) {
                event.stopPropagation();
            }
        }

        _formtraceProcessing = true;

        if (tfaTwilio_formtrace === true && blackList_formtrace === false) {
            await tfaValidation(tfaTwilio_formtrace, phoneInputId_formtrace, sendTfaCodeApi, validateTfCodeApi, saveOnSubmit_formtrace, event);
        } else if (blackList_formtrace === true) {
            await blackListPhone(tfaTwilio_formtrace, blackList_formtrace, phoneInputId_formtrace, validateBlackListApi, saveOnSubmit_formtrace, event);
        }

        _formtraceProcessing = false;
    } else {
        // Modo organico: guardar sin bloquear usando keepalive
        // El formulario continua su flujo normal mientras los datos se envian en background
        if (epd_formtrace === true && event) {
            // Si epd esta activo, bloquear, guardar, y luego reanudar
            event.preventDefault();

            _formtraceProcessing = true;
            await saveRecording(saveOnSubmit_formtrace, event, true);
            _formtraceProcessing = false;

            // Reanudar el submit del formulario
            if (event && event.target instanceof HTMLFormElement) {
                resumeFormSubmit(event.target, fromDoPostBack);
            }
        } else {
            // Fire and forget - no bloquear el flujo, usar keepalive
            saveRecordingFireAndForget(event);
        }
    }
}

// Guardar sin esperar respuesta (fire and forget)
function saveRecordingFireAndForget(event) {
    if (!saveOnSubmit_formtrace) return;

    if (debug_formtrace) {
        console.log('formTrace#fire-and-forget mode');
    }

    let formElement;
    if (event && event.target instanceof HTMLFormElement) {
        formElement = event.target;
    } else {
        formElement = document.getElementById("formproofScript")?.closest('form') || document.querySelector('form');
    }

    if (!formElement || !(formElement instanceof HTMLFormElement)) {
        console.error("formTrace#no form found");
        return;
    }

    const formData = new FormData(formElement);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Guardar de forma asincrona sin bloquear
    formTraceSaveRecordFireAndForget(data);
}

// Reanudar el submit del formulario despues de guardar
function resumeFormSubmit(formElement, wasFromDoPostBack) {
    if (debug_formtrace) {
        console.log('formTrace#resuming form submit');
    }

    _formtraceProcessing = true; // Evitar re-captura

    if (wasFromDoPostBack && _pendingPostBack) {
        // Reanudar __doPostBack
        const { eventTarget, eventArgument, originalFunc } = _pendingPostBack;
        _pendingPostBack = null;
        if (originalFunc) {
            originalFunc.call(window, eventTarget, eventArgument);
        }
    } else {
        // Submit normal
        formElement.submit();
    }

    // Reset despues de un pequeno delay
    setTimeout(() => {
        _formtraceProcessing = false;
    }, 100);
}

// Guardar grabacion sin esperar respuesta (fire and forget con keepalive)
async function formTraceSaveRecordFireAndForget(data) {
    record_formtrace = false;
    const termsText = document.getElementById(privacityInputId_formtrace);
    if (termsText) {
        data['terms'] = termsText.innerText;
    }

    let formTraceIdValue;
    if (recordingIdFromBrowser) {
        formTraceIdValue = recordingIdFromBrowser;
    } else {
        formTraceIdValue = generateUUID();
    }

    const searchForm = document.getElementById("formproofScript")?.closest('form') || document.querySelector('form');
    if (formTraceIdValue && searchForm) {
        // Agregar hidden input si no existe
        let existingInput = searchForm.querySelector('input[name="formTraceId"]');
        if (!existingInput) {
            searchForm.appendChild(createHiddenInput('formTraceId', formTraceIdValue));
        }
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
        // Obtener IP de forma asincrona pero no bloquear si falla
        let clientIp = '';
        try {
            const responseIp = await fetch("https://api.ipify.org/?format=json");
            const ipJson = await responseIp.json();
            clientIp = ipJson?.ip || '';
        } catch (ipError) {
            if (debug_formtrace) {
                console.log('formTrace#could not get IP, continuing anyway');
            }
        }

        const eventsToSubmit = events_formtrace;
        const status = !recordingIdFromBrowser && guide_formtrace ? "partial" :
            redirectId_formtrace && !guide_formtrace ? "partial-followMe" : "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            token: token_formtrace || '',
            status: status
        };

        if (!recordingIdFromBrowser && (guide_formtrace || redirectId_formtrace)) {
            dataSubmit.provider = guide_formtrace;
            dataSubmit.formTraceId = formTraceIdValue;
        }

        if (formTraceIdValue) {
            dataSubmit.formTraceId = formTraceIdValue;
        }

        // Usar keepalive para que la peticion continue aunque la pagina cambie
        await saveRecordings(dataSubmit, true);

        if (debug_formtrace) {
            console.log('formTrace#fire-and-forget save initiated:', formTraceIdValue);
        }
    } catch (error) {
        console.error("formTrace#error in fire-and-forget save:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Standard submit event listener
    document.addEventListener("submit", async (event) => {
        await handleFormTraceSubmit(event);
    }, true);

    // ASP.NET __doPostBack interception
    // Modo organico: NO bloquear el flujo, usar fire-and-forget
    if (typeof window.__doPostBack === 'function') {
        const originalDoPostBack = window.__doPostBack;
        window.__doPostBack = function(eventTarget, eventArgument) {
            if (debug_formtrace) {
                console.log('formTrace#intercepted __doPostBack:', eventTarget);
            }

            // Evitar doble procesamiento
            if (_formtraceProcessing) {
                return originalDoPostBack.call(this, eventTarget, eventArgument);
            }

            // Modo organico: guardar en background y continuar inmediatamente
            const needsBlocking = (tfaTwilio_formtrace === true && blackList_formtrace === false) ||
                                  (blackList_formtrace === true);

            if (needsBlocking || epd_formtrace === true) {
                // Guardar referencia para reanudar despues
                _pendingPostBack = {
                    eventTarget,
                    eventArgument,
                    originalFunc: originalDoPostBack
                };

                // Llamar al handler que manejara el flujo
                handleFormTraceSubmit(null, true);
                return; // No ejecutar postback todavia
            }

            // Fire and forget: guardar datos sin bloquear
            saveRecordingFireAndForget(null);

            // Continuar con el postback normal inmediatamente
            return originalDoPostBack.call(this, eventTarget, eventArgument);
        };

        if (debug_formtrace) {
            console.log('formTrace#__doPostBack hook installed (organic mode)');
        }
    }

    // Hook tardio para __doPostBack si se define despues
    if (typeof window.__doPostBack === 'undefined') {
        let _doPostBackValue;
        let _hooked = false;

        Object.defineProperty(window, '__doPostBack', {
            get: function() {
                return _doPostBackValue;
            },
            set: function(newValue) {
                if (!_hooked && typeof newValue === 'function') {
                    _hooked = true;
                    const originalFunc = newValue;
                    _doPostBackValue = function(eventTarget, eventArgument) {
                        if (debug_formtrace) {
                            console.log('formTrace#intercepted __doPostBack (late hook):', eventTarget);
                        }

                        // Evitar doble procesamiento
                        if (_formtraceProcessing) {
                            return originalFunc.call(this, eventTarget, eventArgument);
                        }

                        const needsBlocking = (tfaTwilio_formtrace === true && blackList_formtrace === false) ||
                                              (blackList_formtrace === true);

                        if (needsBlocking || epd_formtrace === true) {
                            _pendingPostBack = {
                                eventTarget,
                                eventArgument,
                                originalFunc: originalFunc
                            };
                            handleFormTraceSubmit(null, true);
                            return;
                        }

                        // Fire and forget
                        saveRecordingFireAndForget(null);
                        return originalFunc.call(this, eventTarget, eventArgument);
                    };

                    if (debug_formtrace) {
                        console.log('formTrace#__doPostBack late hook installed (organic mode)');
                    }
                } else {
                    _doPostBackValue = newValue;
                }
            },
            configurable: true
        });
    }
});

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

async function formTraceSaveRecordWithOnsubmitEvent(data, useKeepalive = false) {
    savingLoading_formtrace = true;
    record_formtrace = false;
    const termsText = document.getElementById(privacityInputId_formtrace);
    if (termsText) {
        data['terms'] = termsText.innerText;
    }

    let formTraceIdValue;

    if (recordingIdFromBrowser) {
        formTraceIdValue = recordingIdFromBrowser;
    } else if (guide_formtrace || redirectId_formtrace) {
        formTraceIdValue = generateUUID();
    } else {
        formTraceIdValue = generateUUID();
    }

    const searchForm = document.getElementById("formproofScript")?.closest('form') || document.querySelector('form');

    if (formTraceIdValue && searchForm) {
        // Verificar si el input ya existe para evitar duplicados
        let existingInput = searchForm.querySelector('input[name="formTraceId"]');
        if (!existingInput) {
            searchForm.appendChild(createHiddenInput('formTraceId', formTraceIdValue));
        }
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
        let clientIp = '';
        try {
            const responseIp = await fetch("https://api.ipify.org/?format=json");
            const ipJson = await responseIp.json();
            clientIp = ipJson?.ip || '';
        } catch (ipError) {
            if (debug_formtrace) {
                console.log('formTrace#could not get IP, continuing anyway');
            }
        }
        const eventsToSubmit = events_formtrace
        const status = !recordingIdFromBrowser && guide_formtrace ? "partial" :
            redirectId_formtrace && !guide_formtrace ? "partial-followMe" :
                "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            token: token_formtrace || '',
            status: status
        };

        if (!recordingIdFromBrowser && (guide_formtrace || redirectId_formtrace)) {
            dataSubmit.provider = guide_formtrace
            dataSubmit.formTraceId = formTraceIdValue;
        }

        if (formTraceIdValue) {
            dataSubmit.formTraceId = formTraceIdValue;
        }

        const response = await saveRecordings(dataSubmit, useKeepalive);
        const responseAsJson2 = await response.json();

        if (redirectValue_formtrace !== "") {
            const redirectUrl = new URL(redirectValue_formtrace);
            redirectUrl.searchParams.set('formTraceId', formTraceIdValue);
            window.location.href = redirectUrl.toString();
        }

        if (callback_formtrace) {
            test({ form: data, formProofResponse: responseAsJson2 });
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
            token: token_formtrace || '',
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
            test({ form: data, formProofResponse: responseAsJson2 });
        }
        return responseAsJson2;
    } catch (error) {
        console.error("Error al guardar la grabación:", error);
    } finally {
        savingLoading_formtrace = false;
    }
}

window.formTraceSaveRecord = formTraceSaveRecord;


