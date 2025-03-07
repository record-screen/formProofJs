async function saveRecording(saveOnSubmit, event) {
    if (saveOnSubmit) {
        if (debug_formtrace){
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
        const recordKey = await formTraceSaveRecordWitrhOnsubmitEvent(data);
        if (debug_formtrace){
            console.log('Success formTraceId:', recordKey);
        }
    }
}
