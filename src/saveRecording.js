async function saveRecording(saveOnSubmit, event) {
    if (saveOnSubmit) {
        if (debug_formtrace && debug_formtrace === 'true'){
            console.log('formTrace#saving on submit');
        }
        if (!event.target || !(event.target instanceof HTMLFormElement)) {
            console.error("Invalid form element");
            return;
        }
        const formData = new FormData(event.target);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        const recordKey = await formTraceSaveRecordWithOnsubmitEvent(data);
        if (debug_formtrace && debug_formtrace === 'true'){
            console.log('Success formTraceId:', recordKey);
        }
    }
}
