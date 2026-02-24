async function saveRecordings(dataSubmit, useKeepalive = false) {
    const jsonBody = JSON.stringify(dataSubmit);

    const options = {
        method: 'POST',
        body: jsonBody,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // keepalive permite que la peticion continue si la pagina cambia
    // DESPUES de que se envien los datos
    if (useKeepalive) {
        options.keepalive = true;
    }

    if (debug_formtrace) {
        console.log('formTrace#fetch starting with keepalive:', useKeepalive);
    }

    try {
        // ESPERAR a que el fetch se complete (o al menos envie los datos)
        const response = await fetch(formTraceApiSave, options);

        if (debug_formtrace) {
            console.log('formTrace#fetch completed, status:', response.status);
        }

        return response;
    } catch (fetchError) {
        if (debug_formtrace) {
            console.log('formTrace#fetch error:', fetchError.message);
        }

        // Si el fetch falla, intentar sendBeacon como fallback
        if (useKeepalive && navigator.sendBeacon) {
            const blob = new Blob([jsonBody], { type: 'text/plain' });
            const success = navigator.sendBeacon(formTraceApiSave, blob);
            if (debug_formtrace) {
                console.log('formTrace#sendBeacon fallback result:', success);
            }
            return {
                ok: success,
                json: async () => ({ success, message: 'sent via beacon fallback' })
            };
        }

        throw fetchError;
    }
}
