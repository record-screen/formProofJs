async function saveRecording(saveOnSubmit, event) {
    if (saveOnSubmit) {
        console.log('formproof#saving on submit');
        const data = new FormData(event.target);
        const recordKey = await formproofSaveRecordWithOnsubmitEvent(data);
        console.log('Record key: ', recordKey)
    }
    // event.target.submit();
}
