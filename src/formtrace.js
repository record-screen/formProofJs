// Reading query params
const scriptElement = document.getElementById("formproofScript");
let _formTraceToken = ''
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
let _formTraceBaseApi = 'https://splendid-binary-uynxj.ampt.app/api'
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
    _formTraceToken = urlParams.get("token");
    phoneInputId = urlParams.get("phoneInputId");
    callback = urlParams.get("callback");
    guide = urlParams.get("guide")
    formTraceId = recordingIdFromBrowser;
    _formTraceDebug = urlParams.get("debug") ? urlParams.get("debug") : false;
    keepVideo = urlParams.get("keepVideo") ? urlParams.get("keepVideo") : false;
    tfaTwilio = urlParams.get("tfaTwilio") ? urlParams.get("tfaTwilio") : false;
    blackList = urlParams.get("blackList") ? urlParams.get("blackList") : false;
    privacityInputId = urlParams.get("privacityId");
    saveOnSubmit = urlParams.get("saveOnSubmit") ? urlParams.get("saveOnSubmit") : true;
} else {
    console.error("You need add id='formproofScript' to script")
}
const _formTraceEvents = [];
const _formTraceStorageRecord = 'FORMTRACE_EVENTS';
let _formTracePathNamePage = window.location.pathname;
let _formTraceEventsToSave = {};
const _formTraceApiSave = `${_formTraceBaseApi}/recordings`;
let _formTraceSavingLoading = false;
let _formTraceRecord = true;
const sendTfaCodeApi = `${_formTraceBaseApi}/tfa/sendCode`;
const validateTfCodeApi = `${_formTraceBaseApi}/tfa/validate`;
const validateBlackListApi = `${_formTraceBaseApi}/blacklist`;

if (automaticRecord) {
    console.log('formTrace start..');

    if (_formTraceDebug && guide) {
        alert("Formtrace loaded coreg");
    } else if (_formTraceDebug) {
        alert("Formtrace loaded normal");
    } else if (guide) {
        alert("Formtrace coreg");
    }

    formTraceStartRecord();
}

function formTraceStartRecord() {
    rrweb.record({
        emit(event) {
            if (_formTraceRecord) {
                _formTraceEventsToSave = localStorage.getItem(_formTraceStorageRecord) ? JSON.parse(localStorage.getItem(_formTraceStorageRecord)) : {};
                _formTraceEventsToSave[_formTracePathNamePage] = [];
                _formTraceEvents.push(event);
                if (keepVideo) {
                    _formTraceEventsToSave[_formTracePathNamePage] = Object.assign(_formTraceEvents);
                    localStorage.setItem(_formTraceStorageRecord, JSON.stringify(_formTraceEventsToSave));
                }
            }
        },
        recordCanvas: true,
    });
}

addEventListener("submit", async (event) => {
    const hiddenFormTrace = document.getElementById(hiddenFormTraceRedirect);
    const termsText = document.getElementById(privacityInputId);

    let alertMessage = "";

    if (hiddenFormTrace?.value) {
        alertMessage = `Formtrace coreg and redirect to ${hiddenFormTrace.value}`;
    }

    if (_formTraceDebug) {
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
    _formTraceSavingLoading = true;
    _formTraceRecord = false;
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
        const eventsToSubmit = !keepVideo ? { [_formTracePathNamePage]: _formTraceEvents } : JSON.parse(localStorage.getItem(_formTraceStorageRecord));
        const status = !recordingIdFromBrowser && guide ? "partial" : "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            token: _formTraceToken || '',
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
        _formTraceSavingLoading = false;
        if (keepVideo) {
            localStorage.removeItem(_formTraceStorageRecord);
        }
    }
}

async function formTraceSaveRecord(data = {}) {
    _formTraceSavingLoading = true;
    _formTraceRecord = false;
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
        const eventsToSubmit = !keepVideo ? { [_formTracePathNamePage]: _formTraceEvents } : JSON.parse(localStorage.getItem(_formTraceStorageRecord));
        const status = !recordingIdFromBrowser && guide ? "partial" : "completed";

        const dataSubmit = {
            form: data,
            events: JSON.stringify(eventsToSubmit),
            clientIp,
            userAgent,
            token: _formTraceToken || '',
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
        _formTraceSavingLoading = false;
        if (keepVideo) {
            localStorage.removeItem(_formTraceStorageRecord);
        }
    }
}

window.formTraceSaveRecord = formTraceSaveRecord;


