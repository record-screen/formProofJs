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

    if (debug_formtrace) {
        console.log('formTrace#handleFormTraceSubmit config:', {
            needsBlocking,
            tfaTwilio: tfaTwilio_formtrace,
            blackList: blackList_formtrace,
            epd: epd_formtrace,
            esp: esp_formtrace,
            fromDoPostBack,
            hasEvent: !!event
        });
    }

    if (needsBlocking) {
        // Modo que requiere interaccion del usuario - bloquear el flujo
        if (debug_formtrace) {
            console.log('formTrace#entering BLOCKING mode (TFA or BlackList active)');
        }

        if (event) {
            event.preventDefault();
            if (debug_formtrace) {
                console.log('formTrace#preventDefault() called');
            }
            if (esp_formtrace) {
                event.stopPropagation();
                if (debug_formtrace) {
                    console.log('formTrace#stopPropagation() called');
                }
            }
        }

        _formtraceProcessing = true;

        if (tfaTwilio_formtrace === true && blackList_formtrace === false) {
            if (debug_formtrace) {
                console.log('formTrace#starting TFA validation');
            }
            await tfaValidation(tfaTwilio_formtrace, phoneInputId_formtrace, sendTfaCodeApi, validateTfCodeApi, saveOnSubmit_formtrace, event);
        } else if (blackList_formtrace === true) {
            if (debug_formtrace) {
                console.log('formTrace#starting BlackList validation');
            }
            await blackListPhone(tfaTwilio_formtrace, blackList_formtrace, phoneInputId_formtrace, validateBlackListApi, saveOnSubmit_formtrace, event);
        }

        _formtraceProcessing = false;
        if (debug_formtrace) {
            console.log('formTrace#BLOCKING mode completed');
        }
    } else {
        // Modo organico: guardar sin bloquear usando keepalive
        // El formulario continua su flujo normal mientras los datos se envian en background
        if (epd_formtrace === true && event) {
            // Si epd esta activo, bloquear, guardar, y luego reanudar
            if (debug_formtrace) {
                console.log('formTrace#entering EPD mode (block, save, resume)');
            }
            event.preventDefault();

            _formtraceProcessing = true;
            if (debug_formtrace) {
                console.log('formTrace#saving recording with keepalive...');
            }
            await saveRecording(saveOnSubmit_formtrace, event, true);
            _formtraceProcessing = false;

            // Reanudar el submit del formulario
            if (event && event.target instanceof HTMLFormElement) {
                if (debug_formtrace) {
                    console.log('formTrace#about to resume form submit');
                }
                resumeFormSubmit(event.target, fromDoPostBack);
            }
        } else {
            // Fire and forget - no bloquear el flujo, usar keepalive
            if (debug_formtrace) {
                console.log('formTrace#entering ORGANIC mode (fire-and-forget)');
            }
            saveRecordingFireAndForget(event);
        }
    }
}

// Guardar sin esperar respuesta (fire and forget)
function saveRecordingFireAndForget(event) {
    if (!saveOnSubmit_formtrace) {
        if (debug_formtrace) {
            console.log('formTrace#fire-and-forget skipped (saveOnSubmit=false)');
        }
        return;
    }

    if (debug_formtrace) {
        console.log('formTrace#fire-and-forget starting...');
    }

    let formElement;
    if (event && event.target instanceof HTMLFormElement) {
        formElement = event.target;
        if (debug_formtrace) {
            console.log('formTrace#form obtained from event.target');
        }
    } else {
        formElement = document.getElementById("formproofScript")?.closest('form') || document.querySelector('form');
        if (debug_formtrace) {
            console.log('formTrace#form obtained from DOM search');
        }
    }

    if (!formElement || !(formElement instanceof HTMLFormElement)) {
        if (debug_formtrace) {
            console.error("formTrace#no form found - cannot save");
        }
        return;
    }

    if (debug_formtrace) {
        console.log('formTrace#form found:', formElement.id || formElement.name || 'unnamed form');
    }

    const formData = new FormData(formElement);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    if (debug_formtrace) {
        console.log('formTrace#form data collected, fields:', Object.keys(data).length);
    }

    // Guardar de forma asincrona sin bloquear
    formTraceSaveRecordFireAndForget(data);
}

// Reanudar el submit del formulario despues de guardar
function resumeFormSubmit(formElement, wasFromDoPostBack) {
    if (debug_formtrace) {
        console.log('formTrace#resumeFormSubmit called', {
            formId: formElement?.id || 'unnamed',
            wasFromDoPostBack,
            hasPendingPostBack: !!_pendingPostBack
        });
    }

    _formtraceProcessing = true; // Evitar re-captura

    if (wasFromDoPostBack && _pendingPostBack) {
        // Reanudar __doPostBack
        const { eventTarget, eventArgument, originalFunc } = _pendingPostBack;
        if (debug_formtrace) {
            console.log('formTrace#resuming via __doPostBack', { eventTarget, eventArgument });
        }
        _pendingPostBack = null;
        if (originalFunc) {
            originalFunc.call(window, eventTarget, eventArgument);
            if (debug_formtrace) {
                console.log('formTrace#__doPostBack executed successfully');
            }
        }
    } else {
        // Submit normal
        // Usar HTMLFormElement.prototype.submit.call() para evitar conflicto
        // cuando hay un elemento con name="submit" que sobrescribe el metodo nativo
        if (debug_formtrace) {
            console.log('formTrace#resuming via form.submit()');
        }
        try {
            // Intentar submit nativo primero (mas compatible)
            HTMLFormElement.prototype.submit.call(formElement);
            if (debug_formtrace) {
                console.log('formTrace#form.submit() executed via prototype');
            }
        } catch (submitError) {
            if (debug_formtrace) {
                console.log('formTrace#prototype.submit failed, trying direct submit');
            }
            // Fallback: intentar submit directo
            if (typeof formElement.submit === 'function') {
                formElement.submit();
            } else {
                // Ultimo recurso: buscar y clickear el boton submit
                const submitBtn = formElement.querySelector('input[type="submit"], button[type="submit"]');
                if (submitBtn) {
                    if (debug_formtrace) {
                        console.log('formTrace#clicking submit button as fallback');
                    }
                    submitBtn.click();
                } else {
                    console.error('formTrace#could not find a way to submit the form');
                }
            }
        }
    }

    // Reset despues de un pequeno delay
    setTimeout(() => {
        _formtraceProcessing = false;
        if (debug_formtrace) {
            console.log('formTrace#processing flag reset');
        }
    }, 100);
}

// Guardar grabacion sin esperar respuesta (fire and forget con keepalive)
async function formTraceSaveRecordFireAndForget(data) {
    if (debug_formtrace) {
        console.log('formTrace#formTraceSaveRecordFireAndForget starting...');
    }

    record_formtrace = false;
    const termsText = document.getElementById(privacityInputId_formtrace);
    if (termsText) {
        data['terms'] = termsText.innerText;
        if (debug_formtrace) {
            console.log('formTrace#terms text captured');
        }
    }

    let formTraceIdValue;
    if (recordingIdFromBrowser) {
        formTraceIdValue = recordingIdFromBrowser;
        if (debug_formtrace) {
            console.log('formTrace#using existing formTraceId from URL:', formTraceIdValue);
        }
    } else {
        formTraceIdValue = generateUUID();
        if (debug_formtrace) {
            console.log('formTrace#generated new formTraceId:', formTraceIdValue);
        }
    }

    const searchForm = document.getElementById("formproofScript")?.closest('form') || document.querySelector('form');
    if (formTraceIdValue && searchForm) {
        // Agregar hidden input si no existe
        let existingInput = searchForm.querySelector('input[name="formTraceId"]');
        if (!existingInput) {
            searchForm.appendChild(createHiddenInput('formTraceId', formTraceIdValue));
            if (debug_formtrace) {
                console.log('formTrace#hidden input formTraceId added to form');
            }
        }
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
        // Obtener IP de forma asincrona pero no bloquear si falla
        if (debug_formtrace) {
            console.log('formTrace#fetching client IP...');
        }
        let clientIp = '';
        try {
            const responseIp = await fetch("https://api.ipify.org/?format=json");
            const ipJson = await responseIp.json();
            clientIp = ipJson?.ip || '';
            if (debug_formtrace) {
                console.log('formTrace#client IP obtained:', clientIp);
            }
        } catch (ipError) {
            if (debug_formtrace) {
                console.log('formTrace#could not get IP, continuing anyway');
            }
        }

        const eventsToSubmit = events_formtrace;
        const status = !recordingIdFromBrowser && guide_formtrace ? "partial" :
            redirectId_formtrace && !guide_formtrace ? "partial-followMe" : "completed";

        if (debug_formtrace) {
            console.log('formTrace#recording status:', status);
            console.log('formTrace#events count:', eventsToSubmit.length);
        }

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
        if (debug_formtrace) {
            console.log('formTrace#sending data with keepalive=true...');
        }
        await saveRecordings(dataSubmit, true);

        if (debug_formtrace) {
            console.log('formTrace#fire-and-forget save completed successfully:', formTraceIdValue);
        }
    } catch (error) {
        console.error("formTrace#error in fire-and-forget save:", error);
        if (debug_formtrace) {
            console.log('formTrace#save failed with error:', error.message);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (debug_formtrace) {
        console.log('formTrace#DOMContentLoaded - initializing event listeners');
    }

    // Standard submit event listener
    document.addEventListener("submit", async (event) => {
        if (debug_formtrace) {
            console.log('formTrace#submit event captured', {
                formId: event.target?.id || 'unnamed',
                formAction: event.target?.action || 'no action'
            });
        }
        await handleFormTraceSubmit(event);
    }, true);

    if (debug_formtrace) {
        console.log('formTrace#submit event listener registered (capture=true)');
    }

    // ASP.NET __doPostBack interception
    // Modo organico: NO bloquear el flujo, usar fire-and-forget
    if (typeof window.__doPostBack === 'function') {
        if (debug_formtrace) {
            console.log('formTrace#__doPostBack detected, installing hook...');
        }
        const originalDoPostBack = window.__doPostBack;
        window.__doPostBack = function(eventTarget, eventArgument) {
            if (debug_formtrace) {
                console.log('formTrace#__doPostBack intercepted:', {
                    eventTarget,
                    eventArgument,
                    isProcessing: _formtraceProcessing
                });
            }

            // Evitar doble procesamiento
            if (_formtraceProcessing) {
                if (debug_formtrace) {
                    console.log('formTrace#skipping __doPostBack (already processing)');
                }
                return originalDoPostBack.call(this, eventTarget, eventArgument);
            }

            // Modo organico: guardar en background y continuar inmediatamente
            const needsBlocking = (tfaTwilio_formtrace === true && blackList_formtrace === false) ||
                                  (blackList_formtrace === true);

            if (debug_formtrace) {
                console.log('formTrace#__doPostBack mode check:', {
                    needsBlocking,
                    epd: epd_formtrace,
                    willBlock: needsBlocking || epd_formtrace === true
                });
            }

            if (needsBlocking || epd_formtrace === true) {
                // Guardar referencia para reanudar despues
                if (debug_formtrace) {
                    console.log('formTrace#__doPostBack BLOCKING mode - saving pending postback');
                }
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
            if (debug_formtrace) {
                console.log('formTrace#__doPostBack ORGANIC mode - fire-and-forget');
            }
            saveRecordingFireAndForget(null);

            // Continuar con el postback normal inmediatamente
            if (debug_formtrace) {
                console.log('formTrace#__doPostBack executing original postback');
            }
            return originalDoPostBack.call(this, eventTarget, eventArgument);
        };

        if (debug_formtrace) {
            console.log('formTrace#__doPostBack hook installed (organic mode)');
        }
    } else {
        if (debug_formtrace) {
            console.log('formTrace#__doPostBack not found (not ASP.NET WebForms)');
        }
    }

    // Hook tardio para __doPostBack si se define despues
    if (typeof window.__doPostBack === 'undefined') {
        if (debug_formtrace) {
            console.log('formTrace#__doPostBack undefined, setting up late hook via defineProperty');
        }
        let _doPostBackValue;
        let _hooked = false;

        Object.defineProperty(window, '__doPostBack', {
            get: function() {
                return _doPostBackValue;
            },
            set: function(newValue) {
                if (!_hooked && typeof newValue === 'function') {
                    _hooked = true;
                    if (debug_formtrace) {
                        console.log('formTrace#__doPostBack late hook triggered - installing interceptor');
                    }
                    const originalFunc = newValue;
                    _doPostBackValue = function(eventTarget, eventArgument) {
                        if (debug_formtrace) {
                            console.log('formTrace#__doPostBack intercepted (late hook):', {
                                eventTarget,
                                eventArgument,
                                isProcessing: _formtraceProcessing
                            });
                        }

                        // Evitar doble procesamiento
                        if (_formtraceProcessing) {
                            if (debug_formtrace) {
                                console.log('formTrace#skipping late hook (already processing)');
                            }
                            return originalFunc.call(this, eventTarget, eventArgument);
                        }

                        const needsBlocking = (tfaTwilio_formtrace === true && blackList_formtrace === false) ||
                                              (blackList_formtrace === true);

                        if (debug_formtrace) {
                            console.log('formTrace#late hook mode check:', {
                                needsBlocking,
                                epd: epd_formtrace,
                                willBlock: needsBlocking || epd_formtrace === true
                            });
                        }

                        if (needsBlocking || epd_formtrace === true) {
                            if (debug_formtrace) {
                                console.log('formTrace#late hook BLOCKING mode');
                            }
                            _pendingPostBack = {
                                eventTarget,
                                eventArgument,
                                originalFunc: originalFunc
                            };
                            handleFormTraceSubmit(null, true);
                            return;
                        }

                        // Fire and forget
                        if (debug_formtrace) {
                            console.log('formTrace#late hook ORGANIC mode - fire-and-forget');
                        }
                        saveRecordingFireAndForget(null);

                        if (debug_formtrace) {
                            console.log('formTrace#late hook executing original postback');
                        }
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


