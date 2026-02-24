async function saveRecordings(dataSubmit, useKeepalive = false) {
    // Cuando keepalive=true, usar sendBeacon que es mas robusto
    // para enviar datos cuando la pagina esta a punto de cerrarse/cambiar
    if (useKeepalive && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(dataSubmit)], { type: 'application/json' });
        const success = navigator.sendBeacon(formTraceApiSave, blob);
        if (debug_formtrace) {
            console.log('formTrace#sendBeacon result:', success);
        }
        // sendBeacon no devuelve respuesta, retornamos un objeto mock
        return {
            ok: success,
            json: async () => ({ success, message: 'sent via beacon' })
        };
    }

    // Fallback a fetch normal
    const options = {
        method: 'POST',
        body: JSON.stringify(dataSubmit),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    };

    if (useKeepalive) {
        options.keepalive = true;
    }

    return await fetch(formTraceApiSave, options);
}
