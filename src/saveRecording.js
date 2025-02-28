async function saveRecording(saveOnSubmit, event) {
    if (saveOnSubmit) {
        console.log('formTrace#saving on submit');

        // Verificar que event.target sea un formulario válido
        if (!event.target || !(event.target instanceof HTMLFormElement)) {
            console.error("Invalid form element");
            return;
        }

        // Crear FormData desde el formulario
        const formData = new FormData(event.target);

        // Convertir FormData a un objeto manualmente
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        console.log('Data', data); // Verificar los datos

        // Pasar el objeto a formproofSaveRecordWithOnsubmitEvent
        const recordKey = await formproofSaveRecordWithOnsubmitEvent(data);
        console.log('Record key: ', recordKey);
    }
    // event.target.submit();
}
