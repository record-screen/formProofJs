async function saveRecordings(dataSubmit, useKeepalive = false) {
    const jsonBody = JSON.stringify(dataSubmit);
    const payloadSize = jsonBody.length;

    // keepalive y sendBeacon tienen limite de ~64KB
    const KEEPALIVE_LIMIT = 60000; // 60KB para tener margen
    const isPayloadTooLarge = payloadSize > KEEPALIVE_LIMIT;

    if (debug_formtrace) {
        console.log('formTrace#payload size:', payloadSize, 'bytes, limit:', KEEPALIVE_LIMIT);
        console.log('formTrace#payload too large for keepalive:', isPayloadTooLarge);
    }

    // Para payloads grandes, usar XMLHttpRequest sincrono como ultimo recurso
    // Esto garantiza que los datos se envien antes de que la pagina cambie
    if (isPayloadTooLarge) {
        if (debug_formtrace) {
            console.log('formTrace#using XMLHttpRequest for large payload');
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', formTraceApiSave, true); // true = async
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = function() {
                if (debug_formtrace) {
                    console.log('formTrace#XHR completed, status:', xhr.status);
                }
                resolve({
                    ok: xhr.status >= 200 && xhr.status < 300,
                    status: xhr.status,
                    json: async () => {
                        try {
                            return JSON.parse(xhr.responseText);
                        } catch (e) {
                            return { status: xhr.status };
                        }
                    }
                });
            };

            xhr.onerror = function() {
                if (debug_formtrace) {
                    console.log('formTrace#XHR error');
                }
                reject(new Error('XHR failed'));
            };

            xhr.ontimeout = function() {
                if (debug_formtrace) {
                    console.log('formTrace#XHR timeout');
                }
                reject(new Error('XHR timeout'));
            };

            // Timeout de 30 segundos para payloads grandes
            xhr.timeout = 30000;

            if (debug_formtrace) {
                console.log('formTrace#XHR sending...');
            }
            xhr.send(jsonBody);
        });
    }

    // Para payloads pequenos, usar fetch con keepalive
    const options = {
        method: 'POST',
        body: jsonBody,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (useKeepalive) {
        options.keepalive = true;
        if (debug_formtrace) {
            console.log('formTrace#using fetch with keepalive');
        }
    }

    if (debug_formtrace) {
        console.log('formTrace#fetch starting...');
    }

    try {
        const response = await fetch(formTraceApiSave, options);

        if (debug_formtrace) {
            console.log('formTrace#fetch completed, status:', response.status);
        }

        return response;
    } catch (fetchError) {
        if (debug_formtrace) {
            console.log('formTrace#fetch error:', fetchError.message);
        }

        // Fallback a sendBeacon para payloads pequenos
        if (navigator.sendBeacon) {
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
