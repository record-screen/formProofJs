// Reading query params
const scriptElement = document.getElementById("formproofScript");
let token = ''
let automaticRecord_formtrace = true;
let saveOnSubmit_formtrace = true;
let keepVideo_formtrace = false;
let tfaTwilio_formtrace = false;
let blackList_formtrace = false;
let phoneInputId_formtrace = ''
let privacityInputId_formtrace = ''
let hiddenFormTraceRedirect = 'hiddenFormTraceRedirect'
let guide_formtrace = ''
let callback_formtrace = ''
let formTraceId = ''
let debug_formtrace = ''
let baseApi_formtrace = 'https://splendid-binary-uynxj.app/api'
let regex = /^(\+1)?[ ()-]*((?!(\d)\3{9})\d{3}[ ()-]?\d{3}[ ()-]?\d{4})$/

const urlParamsBrowser = new URLSearchParams(window.location.search);
const recordingIdFromBrowser = urlParamsBrowser.get("formTraceId");

if (recordingIdFromBrowser) {
    const hiddenFormTraceInputId = document.getElementById("hiddenFormTraceId");
    if (hiddenFormTraceInputId) {
        hiddenFormTraceInputId.value = recordingIdFromBrowser;
    }
}


if (scriptElement) {
    const scriptSrc = scriptElement.getAttribute("src");
    const urlParams = new URLSearchParams(scriptSrc.split("?")[1]);
    token_formtrace = urlParams.get("token");
    phoneInputId_formtrace = urlParams.get("phoneInputId");
    callback_formtrace = urlParams.get("callback");
    guide_formtrace = urlParams.get("guide")
    formTraceId = recordingIdFromBrowser;
    debug_formtrace = urlParams.get("debug") ? urlParams.get("debug") : false;
    keepVideo_formtrace = urlParams.get("keepVideo") ? urlParams.get("keepVideo") : false;
    tfaTwilio_formtrace = urlParams.get("tfaTwilio") ? urlParams.get("tfaTwilio") : false;
    blackList_formtrace = urlParams.get("blackList") ? urlParams.get("blackList") : false;
    privacityInputId_formtrace = urlParams.get("privacityId");
    saveOnSubmit_formtrace = urlParams.get("saveOnSubmit") ? urlParams.get("saveOnSubmit") : true;
} else {
    console.error("You need add id='formproofScript' to script")
}
const events_formtrace = [];
const storageRecord_formtrace = 'FORMTRACE_EVENTS';
let pathNamePage_formtrace = window.location.pathname;
let eventsToSave_formtrace = {};
const formTraceApiSave = `${baseApi_formtrace}/recordings`;
let savingLoading_formtrace = false;
let record_formtrace = true;
const sendTfaCodeApi = `${baseApi_formtrace}/tfa/sendCode`;
const validateTfCodeApi = `${baseApi_formtrace}/tfa/validate`;
const validateBlackListApi = `${baseApi_formtrace}/blacklist`;

if (automaticRecord_formtrace) {
    console.log('formTrace start..');
    if (debug_formtrace && guide_formtrace) {
        alert("Formtrace loaded coreg");
    } else if (debug_formtrace) {
        alert("Formtrace loaded normal");
    }

    formTraceStartRecord();
}

function formTraceStartRecord() {
    rrweb.record({
        emit(event) {
            if (record_formtrace) {
                eventsToSave_formtrace = localStorage.getItem(storageRecord_formtrace) ? JSON.parse(localStorage.getItem(storageRecord_formtrace)) : {};
                eventsToSave_formtrace[pathNamePage_formtrace] = [];
                events_formtrace.push(event);
                if (keepVideo_formtrace) {
                    eventsToSave_formtrace[pathNamePage_formtrace] = Object.assign(events_formtrace);
                    localStorage.setItem(storageRecord_formtrace, JSON.stringify(eventsToSave_formtrace));
                }
            }
        },
        recordCanvas: true,
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("submit", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        console.log("Form submission blocked:", event.target);

        const hiddenFormTrace = document.getElementById(hiddenFormTraceRedirect);
        const termsText = document.getElementById(privacityInputId_formtrace);

        let alertMessage = "";

        if (hiddenFormTrace?.value) {
            alertMessage = `Formtrace coreg and redirect to ${hiddenFormTrace.value}`;
        }

        if (debug_formtrace) {
            alertMessage = alertMessage ? `${alertMessage} and formtrace submit event` : "Formtrace submit event";
        }

        if (termsText) {
            const termsContent = termsText.innerText.trim();
            if (termsContent) {
                alertMessage = alertMessage ? `${alertMessage} | Terms: ${termsContent}` : `Terms: ${termsContent}`;
            }
        }

        if (alertMessage) {
            alert(alertMessage);
        }

        if (tfaTwilio_formtrace && tfaTwilio_formtrace === 'true' && blackList_formtrace === 'false') {
            await tfaValidation(tfaTwilio_formtrace, phoneInputId_formtrace, sendTfaCodeApi, validateTfCodeApi, saveOnSubmit_formtrace, event);
        } else if (blackList_formtrace && blackList_formtrace === 'true') {
            await blackListPhone(tfaTwilio_formtrace, blackList_formtrace, phoneInputId_formtrace, validateBlackListApi, saveOnSubmit_formtrace, event);
        } else {
            await saveRecording(saveOnSubmit_formtrace, event);
        }

    }, true);
});



function generateUUID() {
    return crypto.randomUUID();
}

async function formTraceSaveRecordWithOnsubmitEvent(data) {
    savingLoading_formtrace = true;
    record_formtrace = false;
    console.log('formTraceSaveRecordWithOnsubmitEvent');
    const termsText = document.getElementById(privacityInputId_formtrace);
    if (termsText) {
        data['terms'] = termsText.innerText;
    }

    let formTraceIdValue;

    if (recordingIdFromBrowser || guide_formtrace) {
        formTraceIdValue = recordingIdFromBrowser || generateUUID();
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
        const responseIp = await fetch("https://api.ipify.org/?format=json");
        const responseAsJson = await responseIp.json();
        const clientIp = responseAsJson?.ip;
        const eventsToSubmit = !keepVideo_formtrace ? { [pathNamePage_formtrace]: events_formtrace } : JSON.parse(localStorage.getItem(storageRecord_formtrace));
        const status = !recordingIdFromBrowser && guide_formtrace ? "partial" : "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            token: token_formtrace || '',
            status: status
        };

        if (!recordingIdFromBrowser && guide_formtrace) {
            dataSubmit.provider = guide_formtrace;
            dataSubmit.formTraceId = generateUUID();
        }

        if (formTraceIdValue) {
            dataSubmit.formTraceId = formTraceIdValue;
        }

        const hiddenFormTraceInput = document.getElementById(hiddenFormTraceRedirect);
        if (hiddenFormTraceInput?.value) {
            const redirectUrl = new URL(hiddenFormTraceInput.value);
            redirectUrl.searchParams.set('formTraceId', formTraceIdValue);
            window.location.href = redirectUrl.toString();
        }

        const response = await saveRecordings(dataSubmit);
        const responseAsJson2 = await response.json();

        if (callback_formtrace) {
            test({ form: data, formProofResponse: responseAsJson2 });
        }
        return responseAsJson2;
    } catch (error) {
        console.error("Error al guardar la grabación:", error);
    } finally {
        savingLoading_formtrace = false;
        if (keepVideo_formtrace) {
            localStorage.removeItem(storageRecord_formtrace);
        }
    }
}

async function formTraceSaveRecord(data = {}) {
    savingLoading_formtrace = true;
    record_formtrace = false;
    console.log('formTraceSaveRecordWithOnsubmitEvent');
    const termsText = document.getElementById(privacityInputId_formtrace);
    if (termsText) {
        data['terms'] = termsText.innerText;
    }

    let formTraceIdValue;

    if (recordingIdFromBrowser || guide_formtrace) {
        formTraceIdValue = recordingIdFromBrowser || generateUUID();
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
        const responseIp = await fetch("https://api.ipify.org/?format=json");
        const responseAsJson = await responseIp.json();
        const clientIp = responseAsJson?.ip;
        const eventsToSubmit = !keepVideo_formtrace ? { [pathNamePage_formtrace]: events_formtrace } : JSON.parse(localStorage.getItem(storageRecord_formtrace));
        const status = !recordingIdFromBrowser && guide_formtrace ? "partial" : "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            token: token_formtrace || '',
            status: status
        };

        if (!recordingIdFromBrowser && guide_formtrace) {
            dataSubmit.provider = guide_formtrace;
            dataSubmit.formTraceId = generateUUID();
        }

        if (formTraceIdValue) {
            dataSubmit.formTraceId = formTraceIdValue;
        }

        const hiddenFormTraceInput = document.getElementById(hiddenFormTraceRedirect);
        if (hiddenFormTraceInput?.value) {
            const redirectUrl = new URL(hiddenFormTraceInput.value);
            redirectUrl.searchParams.set('formTraceId', formTraceIdValue);
            window.location.href = redirectUrl.toString();
        }

        const response = await saveRecordings(dataSubmit);
        const responseAsJson2 = await response.json();

        if (callback_formtrace) {
            test({ form: data, formProofResponse: responseAsJson2 });
        }
        return responseAsJson2;
    } catch (error) {
        console.error("Error al guardar la grabación:", error);
    } finally {
        savingLoading_formtrace = false;
        if (keepVideo_formtrace) {
            localStorage.removeItem(storageRecord_formtrace);
        }
    }
}

window.formTraceSaveRecord = formTraceSaveRecord;


