document.addEventListener('DOMContentLoaded', () => {
    const selectPlanta = document.getElementById('select-planta');
    const selectEdificio = document.getElementById('select-edificio');
    const selectUbicacion = document.getElementById('select-ubicacion');
    const customLocation = document.getElementById('custom-location');
    const formScreen = document.getElementById('form-screen');
    const successScreen = document.getElementById('success-screen');
    const requestForm = document.getElementById('request-form');
    const requestCode = document.getElementById('request-code');
    const btnNewReport = document.getElementById('btn-new-report');

    // 1. Cargar plantas al iniciar
    fetch('/api/plantas')
        .then(res => res.json())
        .then(plantas => {
            selectPlanta.innerHTML = '<option value="">-- Selecciona una planta --</option>';
            plantas.forEach(p => {
                selectPlanta.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
            });
        })
        .catch(err => {
            console.error('Error al cargar plantas:', err);
            selectPlanta.innerHTML = '<option value="">Error al cargar plantas</option>';
        });

    // 2. Al cambiar planta, cargar sus edificios
    selectPlanta.addEventListener('change', () => {
        const plantaId = selectPlanta.value;
        selectEdificio.innerHTML = '<option value="">-- Selecciona un edificio --</option>';
        selectEdificio.disabled = true;
        selectUbicacion.innerHTML = '<option value="">-- Selecciona una ubicación --</option>';
        selectUbicacion.disabled = true;

        if (!plantaId) return;

        fetch(`/api/plantas/${plantaId}/edificios`)
            .then(res => res.json())
            .then(edificios => {
                selectEdificio.disabled = false;
                edificios.forEach(e => {
                    selectEdificio.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
                });
            })
            .catch(err => console.error('Error al cargar edificios:', err));
    });

    // 3. Al cambiar edificio, cargar ubicaciones
    selectEdificio.addEventListener('change', () => {
        const edificioId = selectEdificio.value;
        selectUbicacion.innerHTML = '<option value="">-- Selecciona una ubicación (opcional) --</option>';
        selectUbicacion.disabled = true;

        if (!edificioId) return;

        fetch(`/api/edificios/${edificioId}/ubicaciones`)
            .then(res => res.json())
            .then(ubicaciones => {
                if (ubicaciones.length > 0) {
                    selectUbicacion.disabled = false;
                    ubicaciones.forEach(u => {
                        selectUbicacion.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
                    });
                } else {
                    selectUbicacion.innerHTML = '<option value="">No hay ubicaciones predefinidas</option>';
                }
            })
            .catch(err => console.error('Error al cargar ubicaciones:', err));
    });

    // 4. Enviar formulario
    requestForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const plantaId = parseInt(selectPlanta.value);
        const edificioId = parseInt(selectEdificio.value);
        const ubicacionId = selectUbicacion.value ? parseInt(selectUbicacion.value) : null;
        
        const locDetail = customLocation.value.trim();
        const descText = document.getElementById('problem-description').value.trim();
        
        // Concatenar el detalle de ubicación al inicio de la descripción de la OT
        const finalDescription = `[Detalle ubicación: ${locDetail}] - ${descText}`;
        const prioridad = document.getElementById('select-prioridad').value;
        const reporterName = document.getElementById('reporter-name').value.trim() || 'Usuario Anónimo';
        const reporterContact = document.getElementById('reporter-contact').value.trim() || 'Sin contacto';

        const payload = {
            descripcion: finalDescription,
            tipo: 'Correctiva',
            estado: 'Pendiente',
            prioridad: prioridad,
            reportado_por: `${reporterName} (${reporterContact})`,
            planta_id: plantaId,
            edificio_id: edificioId,
            ubicacion_id: ubicacionId,
            activo_id: null, // No se asocia activo en reporte libre inicial
            tecnico_id: null  // Sin técnico asignado aún
        };

        fetch('/api/ordenes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al enviar la orden');
            return res.json();
        })
        .then(data => {
            // Mostrar pantalla de éxito
            requestCode.textContent = `#OT-${data.id}`;
            formScreen.style.display = 'none';
            successScreen.style.display = 'block';
        })
        .catch(err => {
            alert('Ocurrió un error al enviar el reporte. Por favor reintente.');
            console.error(err);
        });
    });

    // 5. Botón para nuevo reporte
    btnNewReport.addEventListener('click', () => {
        requestForm.reset();
        selectEdificio.innerHTML = '<option value="">Selecciona una planta primero...</option>';
        selectEdificio.disabled = true;
        selectUbicacion.innerHTML = '<option value="">No hay ubicaciones registradas aún...</option>';
        selectUbicacion.disabled = true;
        
        successScreen.style.display = 'none';
        formScreen.style.display = 'block';
    });
});
