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
let hiddenFormTraceRedirect = 'redirectId'
let guide_formtrace = ''
let callback_formtrace = ''
let formTraceId = ''
let debug_formtrace = ''
let baseApi_formtrace = 'https://splendid-binary-uynxj.ampt.app/api'
let regex = /^(\+1)?[ ()-]*((?!(\d)\3{9})\d{3}[ ()-]?\d{3}[ ()-]?\d{4})$/
let epd_formtrace = '';
let esp_formtrace = '';

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
    epd_formtrace = urlParams.get("epd")
    esp_formtrace = urlParams.get("esp")
    tfaTwilio_formtrace = urlParams.get("tfaTwilio") ? urlParams.get("tfaTwilio") : false;
    keepVideo_formtrace = urlParams.get("keepVideo") ? urlParams.get("keepVideo") : false;
    tfaTwilio_formtrace = urlParams.get("tfaTwilio") ? urlParams.get("tfaTwilio") : false;
    blackList_formtrace = urlParams.get("blackList") ? urlParams.get("blackList") : false;
    privacityInputId_formtrace = urlParams.get("privacityId");
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
                events_formtrace.push(event);
            }
        },
        recordCanvas: true,
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("submit", async (event) => {

        if (epd_formtrace === 'false') {
            event.preventDefault();
        }


        if (esp_formtrace === 'true') {
            console.log(esp_formtrace);
            event.stopPropagation();
        }

        const hiddenFormTrace = document.getElementById(hiddenFormTraceRedirect);
        const termsText = document.getElementById(privacityInputId_formtrace);

        if (debug_formtrace) {
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

        if (tfaTwilio_formtrace && tfaTwilio_formtrace === 'true' && blackList_formtrace === 'false') {
            await tfaValidation(tfaTwilio_formtrace, phoneInputId_formtrace, sendTfaCodeApi, validateTfCodeApi, saveOnSubmit_formtrace, event);
        }
        else if (blackList_formtrace && blackList_formtrace === 'true') {
            await blackListPhone(tfaTwilio_formtrace, blackList_formtrace, phoneInputId_formtrace, validateBlackListApi, saveOnSubmit_formtrace, event);
        }
        else {
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

        if (!recordingIdFromBrowser && guide_formtrace) {
            dataSubmit.provider = guide_formtrace;
            dataSubmit.formTraceId = generateUUID();
        }

        if (formTraceIdValue) {
            dataSubmit.formTraceId = formTraceIdValue;
        }

        const response = await saveRecordings(dataSubmit);
        const responseAsJson2 = await response.json();

        const hiddenFormTraceInput = document.getElementById(hiddenFormTraceRedirect);
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

async function formTraceSaveRecord(data = {}) {
    savingLoading_formtrace = true;
    record_formtrace = false;
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

        if (!recordingIdFromBrowser && guide_formtrace) {
            dataSubmit.provider = guide_formtrace;
            dataSubmit.formTraceId = generateUUID();
        }

        if (formTraceIdValue) {
            dataSubmit.formTraceId = formTraceIdValue;
        }

        const response = await saveRecordings(dataSubmit);
        const responseAsJson2 = await response.json();

        const hiddenFormTraceInput = document.getElementById(hiddenFormTraceRedirect);
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


