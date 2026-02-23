async function saveRecording(saveOnSubmit, event) {
    if (saveOnSubmit) {
        if (debug_formtrace && debug_formtrace === true){
            console.log('formTrace#saving on submit');
        }

        // Obtener el formulario: desde event o buscándolo en el DOM
        let formElement;

        if (event && event.target instanceof HTMLFormElement) {
            // Caso 1: Submit normal - tenemos el event con el form
            formElement = event.target;
            if (debug_formtrace && debug_formtrace === true){
                console.log('formTrace#form obtained from event.target');
            }
        } else {
            // Caso 2: __doPostBack - buscar el form en el DOM
            // Intentar encontrar el form más cercano al script de FormProof
            formElement = document.getElementById("formproofScript")?.closest('form');

            // Si no se encuentra, buscar el primer form en la página
            if (!formElement) {
                formElement = document.querySelector('form');
            }

            if (debug_formtrace && debug_formtrace === true){
                console.log('formTrace#form obtained from DOM (no event available)');
            }
        }

        // Validar que tenemos un formulario válido
        if (!formElement || !(formElement instanceof HTMLFormElement)) {
            console.error("Invalid form element - no form found");
            return;
        }

        const formData = new FormData(formElement);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        const recordKey = await formTraceSaveRecordWithOnsubmitEvent(data);
        if (debug_formtrace && debug_formtrace === true){
            console.log('Success formTraceId:', recordKey);
        }
    }
}
