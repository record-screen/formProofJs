async function saveRecordings(dataSubmit, useKeepalive = false) {
    const jsonBody = JSON.stringify(dataSubmit);

    // Cuando keepalive=true, intentar multiples metodos
    if (useKeepalive) {
        // Metodo 1: sendBeacon con text/plain (evita CORS preflight)
        if (navigator.sendBeacon) {
            // Usar text/plain para evitar preflight CORS
            const blob = new Blob([jsonBody], { type: 'text/plain' });
            const success = navigator.sendBeacon(formTraceApiSave, blob);
            if (debug_formtrace) {
                console.log('formTrace#sendBeacon (text/plain) result:', success);
            }
            if (success) {
                return {
                    ok: true,
                    json: async () => ({ success: true, message: 'sent via beacon' })
                };
            }
        }

        // Metodo 2: fetch con keepalive (fire-and-forget, no await)
        if (debug_formtrace) {
            console.log('formTrace#trying fetch with keepalive (fire-and-forget)');
        }
        try {
            // Iniciar fetch pero NO esperar - solo disparar
            fetch(formTraceApiSave, {
                method: 'POST',
                body: jsonBody,
                headers: {
                    'Content-Type': 'application/json'
                },
                keepalive: true
            }).catch(err => {
                if (debug_formtrace) {
                    console.log('formTrace#keepalive fetch error (expected if page changes):', err.message);
                }
            });

            return {
                ok: true,
                json: async () => ({ success: true, message: 'sent via keepalive fetch' })
            };
        } catch (e) {
            if (debug_formtrace) {
                console.log('formTrace#keepalive fetch setup error:', e.message);
            }
        }

        // Metodo 3: ultimo intento con imagen pixel (mas compatible)
        try {
            const encodedData = encodeURIComponent(jsonBody);
            const img = new Image();
            img.src = `${formTraceApiSave}?data=${encodedData}&_t=${Date.now()}`;
            if (debug_formtrace) {
                console.log('formTrace#sent via image pixel fallback');
            }
            return {
                ok: true,
                json: async () => ({ success: true, message: 'sent via image pixel' })
            };
        } catch (imgError) {
            if (debug_formtrace) {
                console.log('formTrace#image pixel failed:', imgError.message);
            }
        }
    }

    // Modo normal: fetch con await
    const options = {
        method: 'POST',
        body: jsonBody,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    return await fetch(formTraceApiSave, options);
}
