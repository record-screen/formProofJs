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
let hiddenFormTrace = 'hiddenFormTrace'
let callback = ''
let baseApi = 'https://intelligent-code-qlrkx.ampt.app/api'
let regex = /^(\+1)?[ ()-]*((?!(\d)\3{9})\d{3}[ ()-]?\d{3}[ ()-]?\d{4})$/


if (scriptElement) {
    const scriptSrc = scriptElement.getAttribute("src");
    const urlParams = new URLSearchParams(scriptSrc.split("?")[1]);
    token = urlParams.get("token");
    phoneInputId = urlParams.get("phoneInputId");
    callback = urlParams.get("callback")
    keepVideo = urlParams.get("keepVideo") ? urlParams.get("keepVideo") : false;
    tfaTwilio = urlParams.get("tfaTwilio") ? urlParams.get("tfaTwilio") : false;
    blackList = urlParams.get("blackList") ? urlParams.get("blackList") : false;
    privacityInputId = urlParams.get("privacityId");
    saveOnSubmit = urlParams.get("saveOnSubmit") ? urlParams.get("saveOnSubmit") : true;
} else {
    console.error("You need add id='formproofScript' to script")
}
const events = [];
const storageRecord = 'FORMPROOF_EVENTS';
let pathNamePage = window.location.pathname;
let eventsToSave = {};
const formProofApiSave = `${baseApi}/recordings`;
let savingLoading = false;
let record = true;
const sendTfaCodeApi = `${baseApi}/tfa/sendCode`;
const validateTfCodeApi = `${baseApi}/tfa/validate`;
const validateBlackListApi = `${baseApi}/blacklist`;

if (automaticRecord) {
    console.log('formTrace start..')
    formProoftStartRecord()
}

function formProoftStartRecord() {
    rrweb.record({
        emit(event) {
            if (record) {
                eventsToSave = localStorage.getItem(storageRecord) ? JSON.parse(localStorage.getItem(storageRecord)) : {};
                eventsToSave[pathNamePage] = [];
                events.push(event);
                if (keepVideo) {
                    eventsToSave[pathNamePage] = Object.assign(events);
                    localStorage.setItem(storageRecord, JSON.stringify(eventsToSave));
                }
            }
        },
        recordCanvas: true,
    });
}

addEventListener("submit", async (event) => {
    event.preventDefault();
    if (tfaTwilio && tfaTwilio === 'true' && blackList === 'false') {
        await tfaValidation(tfaTwilio, phoneInputId, sendTfaCodeApi, validateTfCodeApi, saveOnSubmit, event);
    } else if (blackList && blackList === 'true') {
        await blackListPhone(tfaTwilio, blackList, phoneInputId, validateBlackListApi, saveOnSubmit, event)
    } else {
        await saveRecording(saveOnSubmit, event)
    }
});

async function formproofSaveRecordWithOnsubmitEvent(data) {
    savingLoading = true;
    console.log('formproofSaveRecordWithOnsubmitEvent');
    const termsText = document.getElementById(privacityInputId)?.innerText || '';
    const jsonObject = Object.fromEntries(Array.from(data.entries()));
    jsonObject['terms'] = termsText;
    const userAgent = window.navigator.userAgent;
    const responseIp = await fetch("https://api.ipify.org/?format=json");
    const responseAsJson = await responseIp.json();
    const clientIp = responseAsJson?.ip;
    const eventsToSubmit = !keepVideo ? { [pathNamePage]: events } : JSON.parse(localStorage.getItem(storageRecord));
    const dataSubmit = {
        form: jsonObject,
        events: JSON.stringify(eventsToSubmit),
        clientIp,
        userAgent,
        token: token ? token : ''
    };
    const response = await saveRecordings(dataSubmit);
    savingLoading = false;
    record = false;
    if (keepVideo) {
        localStorage.removeItem(storageRecord);
    }
    const responseAsJson2 = await response.json();
    const recordingId = responseAsJson2.recordingId;
    const hiddenFormTraceInput = document.getElementById(hiddenFormTrace);

    if (hiddenFormTraceInput && hiddenFormTraceInput.value) {
        const redirectUrl = new URL(hiddenFormTraceInput.value);
        redirectUrl.searchParams.set('recordingId', recordingId);
        window.location.href = redirectUrl.toString();
    } else {
        console.error("El input con ID 'hiddenFormTrace' no existe o no tiene un valor.");
    }
    if (callback) {
        test({ form: jsonObject, formProofResponse: responseAsJson2 });
    }
    return responseAsJson2;
}

async function formproofSaveRecord(data = {}) {
    console.log('formproofSaveRecord#saveRecord');
    savingLoading = true;
    const userAgent = window.navigator.userAgent;
    const responseIp = await fetch("https://api.ipify.org/?format=json");
    const responseAsJson = await responseIp.json();
    const clientIp = responseAsJson?.ip;
    const eventsToSubmit = !keepVideo ? {[pathNamePage]: events} : JSON.parse(localStorage.getItem(storageRecord));
    const dataSubmit = {
        form: data,
        events: JSON.stringify(eventsToSubmit),
        clientIp,
        userAgent,
        token: token ? token : ''
    };
    const response = await saveRecordings(dataSubmit)
    savingLoading = false;
    record = false;
    if (keepVideo) {
        localStorage.removeItem(storageRecord);
    }
    return await response.json();
}

window.formproofSaveRecord = formproofSaveRecord;

