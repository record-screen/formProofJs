async function saveRecording(saveOnSubmit, event) {
    if (saveOnSubmit) {
        console.log('formTrace#saving on submit');
        if (!event.target || !(event.target instanceof HTMLFormElement)) {
            console.error("Invalid form element");
            return;
        }
        const formData = new FormData(event.target);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        console.log('Data', data)
        const recordKey = await formTraceSaveRecordWithOnsubmitEvent(data);
        console.log('Record key: ', recordKey);
    }
}
