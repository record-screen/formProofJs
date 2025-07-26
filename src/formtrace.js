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

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("submit", async (event) => {

        if (epd_formtrace && epd_formtrace === true) {
            event.preventDefault();
        }

        if (esp_formtrace && esp_formtrace === true) {
            event.stopPropagation();
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

            alert(alertMessage);
            console.log("Form submission blocked:", event.target);
        }

        if (esp_formtrace === false) {
            if (tfaTwilio_formtrace && tfaTwilio_formtrace === true && blackList_formtrace === false) {
                await tfaValidation(tfaTwilio_formtrace, phoneInputId_formtrace, sendTfaCodeApi, validateTfCodeApi, saveOnSubmit_formtrace, event);
            }
            else if (blackList_formtrace && blackList_formtrace === true) {
                await blackListPhone(tfaTwilio_formtrace, blackList_formtrace, phoneInputId_formtrace, validateBlackListApi, saveOnSubmit_formtrace, event);
            }
            else {
                await saveRecording(saveOnSubmit_formtrace, event);
            }
        }
    }, true);
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

async function formTraceSaveRecordWithOnsubmitEvent(data) {
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
        searchForm.appendChild(createHiddenInput('formTraceId', formTraceIdValue));
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
        const responseIp = await fetch("https://api.ipify.org/?format=json");
        const responseAsJson = await responseIp.json();
        const clientIp = responseAsJson?.ip;
        const eventsToSubmit = events_formtrace
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

        const response = await saveRecordings(dataSubmit);
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


