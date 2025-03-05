// Reading query params
const scriptElement = document.getElementById("formproofScript");
let token = ''
let automaticRecord = true;
let saveOnSubmit = true;
let keepVideo = false;
let tfaTwilio = false;
let blackList = false;
let phoneInputId = ''
let privacityInputId = ''
let hiddenFormTraceRedirect = 'hiddenFormTraceRedirect'
let guide = ''
let callback = ''
let formTraceId = ''
let baseApi = 'https://intelligent-code-qlrkx.ampt.app/api'
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
    token = urlParams.get("token");
    phoneInputId = urlParams.get("phoneInputId");
    callback = urlParams.get("callback");
    guide = urlParams.get("guide")
    formTraceId = recordingIdFromBrowser;
    debug = urlParams.get("debug") ? urlParams.get("debug") : false;
    keepVideo = urlParams.get("keepVideo") ? urlParams.get("keepVideo") : false;
    tfaTwilio = urlParams.get("tfaTwilio") ? urlParams.get("tfaTwilio") : false;
    blackList = urlParams.get("blackList") ? urlParams.get("blackList") : false;
    privacityInputId = urlParams.get("privacityId");
    saveOnSubmit = urlParams.get("saveOnSubmit") ? urlParams.get("saveOnSubmit") : true;
} else {
    console.error("You need add id='formproofScript' to script")
}
const formTraceEvents = [];
const storageRecord = 'FORMTRACE_EVENTS';
let pathNamePage = window.location.pathname;
let formTraceEventsToSave = {};
const formTraceApiSave = `${baseApi}/recordings`;
let savingLoading = false;
let record = true;
const sendTfaCodeApi = `${baseApi}/tfa/sendCode`;
const validateTfCodeApi = `${baseApi}/tfa/validate`;
const validateBlackListApi = `${baseApi}/blacklist`;

if (automaticRecord) {
    console.log('formTrace start..');

    if (debug && guide) {
        alert("Formtrace loaded and script coreg");
    } else if (debug) {
        alert("Formtrace loaded and script normal");
    } else if (guide) {
        alert("script coreg");
    }

    formTraceStartRecord();
}

function formTraceStartRecord() {
    rrweb.record({
        emit(event) {
            if (record) {
                formTraceEventsToSave = localStorage.getItem(storageRecord) ? JSON.parse(localStorage.getItem(storageRecord)) : {};
                formTraceEventsToSave[pathNamePage] = [];
                formTraceEvents.push(event);
                if (keepVideo) {
                    formTraceEventsToSave[pathNamePage] = Object.assign(formTraceEvents);
                    localStorage.setItem(storageRecord, JSON.stringify(formTraceEventsToSave));
                }
            }
        },
        recordCanvas: true,
    });
}

addEventListener("submit", async (event) => {
    const hiddenFormTrace = document.getElementById(hiddenFormTraceRedirect);
    let alertMessage = "";

    if (hiddenFormTrace?.value) {
        alertMessage = `Script coreg and redirect to ${hiddenFormTrace.value}`;
    }

    if (debug) {
        alertMessage = alertMessage ? `${alertMessage} and formtrace submit event` : "Formtrace submit event";
    }

    if (alertMessage) {
        alert(alertMessage);
    }

    event.preventDefault();

    if (tfaTwilio && tfaTwilio === 'true' && blackList === 'false') {
        await tfaValidation(tfaTwilio, phoneInputId, sendTfaCodeApi, validateTfCodeApi, saveOnSubmit, event);
    } else if (blackList && blackList === 'true') {
        await blackListPhone(tfaTwilio, blackList, phoneInputId, validateBlackListApi, saveOnSubmit, event);
    } else {
        await saveRecording(saveOnSubmit, event);
    }
});


function generateUUID() {
    return crypto.randomUUID();
}

async function formproofSaveRecordWithOnsubmitEvent(data) {
    savingLoading = true;
    record = false;
    console.log('formTraceSaveRecordWithOnsubmitEvent');
    const termsText = document.getElementById(privacityInputId);
    if (termsText) {
        data['terms'] = termsText.innerText;
    }

    let formTraceIdValue;

    if (recordingIdFromBrowser || guide) {
        formTraceIdValue = recordingIdFromBrowser || generateUUID();
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
        const responseIp = await fetch("https://api.ipify.org/?format=json");
        const responseAsJson = await responseIp.json();
        const clientIp = responseAsJson?.ip;
        const eventsToSubmit = !keepVideo ? { [pathNamePage]: formTraceEvents } : JSON.parse(localStorage.getItem(storageRecord));
        const status = !recordingIdFromBrowser && guide ? "partial" : "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            token: token || '',
            status: status
        };

        if (!recordingIdFromBrowser && guide) {
            dataSubmit.provider = guide;
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

        if (callback) {
            test({ form: data, formProofResponse: responseAsJson2 });
        }
        return responseAsJson2;
    } catch (error) {
        console.error("Error al guardar la grabación:", error);
    } finally {
        savingLoading = false;
        if (keepVideo) {
            localStorage.removeItem(storageRecord);
        }
    }
}

async function formTraceSaveRecord(data = {}) {
    savingLoading = true;
    record = false;
    console.log('formTraceSaveRecordWithOnsubmitEvent');
    const termsText = document.getElementById(privacityInputId);
    if (termsText) {
        data['terms'] = termsText.innerText;
    }

    let formTraceIdValue;

    if (recordingIdFromBrowser || guide) {
        formTraceIdValue = recordingIdFromBrowser || generateUUID();
        data['formTraceId'] = formTraceIdValue;
    }

    const userAgent = window.navigator.userAgent;

    try {
        const responseIp = await fetch("https://api.ipify.org/?format=json");
        const responseAsJson = await responseIp.json();
        const clientIp = responseAsJson?.ip;
        const eventsToSubmit = !keepVideo ? { [pathNamePage]: formTraceEvents } : JSON.parse(localStorage.getItem(storageRecord));
        const status = !recordingIdFromBrowser && guide ? "partial" : "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            token: token || '',
            status: status
        };

        if (!recordingIdFromBrowser && guide) {
            dataSubmit.provider = guide;
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

        if (callback) {
            test({ form: data, formProofResponse: responseAsJson2 });
        }
        return responseAsJson2;
    } catch (error) {
        console.error("Error al guardar la grabación:", error);
    } finally {
        savingLoading = false;
        if (keepVideo) {
            localStorage.removeItem(storageRecord);
        }
    }
}

window.formTraceSaveRecord = formTraceSaveRecord;


