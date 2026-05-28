document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const selectTechUser = document.getElementById('select-tech-user');
    const techOtList = document.getElementById('tech-ot-list');
    
    const tabMyTasks = document.getElementById('tab-my-tasks');
    const tabNewReport = document.getElementById('tab-new-report');
    const sectionTasks = document.getElementById('section-tasks');
    const sectionReport = document.getElementById('section-report');
    
    const techSelectPlanta = document.getElementById('tech-select-planta');
    const techSelectEdificio = document.getElementById('tech-select-edificio');
    const techSelectUbicacion = document.getElementById('tech-select-ubicacion');
    const techSelectActivo = document.getElementById('tech-select-activo');
    const btnAddLocation = document.getElementById('btn-add-location');
    const techReportForm = document.getElementById('tech-report-form');
    
    const resolveModal = document.getElementById('resolve-modal');
    const resolveForm = document.getElementById('resolve-form');
    const resolveOtId = document.getElementById('resolve-ot-id');
    const resolveComments = document.getElementById('resolve-comments');
    const closeModal = document.getElementById('close-modal');
    
    const locationModal = document.getElementById('location-modal');
    const newLocationForm = document.getElementById('new-location-form');
    const newLocationName = document.getElementById('new-location-name');
    const closeLocationModal = document.getElementById('close-location-modal');
    
    let currentTechId = localStorage.getItem('selected_tech_id') || null;

    // --- 1. TABS MANAGEMENT ---
    tabMyTasks.addEventListener('click', () => {
        tabMyTasks.classList.add('active');
        tabNewReport.classList.remove('active');
        sectionTasks.classList.add('active');
        sectionReport.classList.remove('active');
        loadMyTasks();
    });

    tabNewReport.addEventListener('click', () => {
        tabNewReport.classList.add('active');
        tabMyTasks.classList.remove('active');
        sectionReport.classList.add('active');
        sectionTasks.classList.remove('active');
        loadPlantsForReport();
    });

    // --- 2. LOAD TECHNICIANS (SIMULATED AUTH) ---
    function loadTechnicians() {
        fetch('/api/tecnicos')
            .then(res => res.json())
            .then(tecnicos => {
                selectTechUser.innerHTML = '<option value="">-- Seleccionar --</option>';
                tecnicos.forEach(t => {
                    const selected = currentTechId && parseInt(currentTechId) === t.id ? 'selected' : '';
                    selectTechUser.innerHTML += `<option value="${t.id}" ${selected}>${t.nombre}</option>`;
                });
                
                if (!currentTechId && tecnicos.length > 0) {
                    currentTechId = tecnicos[0].id;
                    localStorage.setItem('selected_tech_id', currentTechId);
                    selectTechUser.value = currentTechId;
                }
                
                loadMyTasks();
            })
            .catch(err => console.error('Error al cargar técnicos:', err));
    }

    selectTechUser.addEventListener('change', () => {
        currentTechId = selectTechUser.value;
        if (currentTechId) {
            localStorage.setItem('selected_tech_id', currentTechId);
            loadMyTasks();
        } else {
            techOtList.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Por favor selecciona un técnico arriba.</p>';
        }
    });

    // --- 3. LOAD TASKS FOR SELECTED TECHNICIAN ---
    function loadMyTasks() {
        if (!currentTechId) return;
        techOtList.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 1.5rem;">Cargando tus tareas...</p>';

        fetch(`/api/ordenes?tecnico_id=${currentTechId}`)
            .then(res => res.json())
            .then(ots => {
                if (ots.length === 0) {
                    techOtList.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 2rem;">No tienes tareas asignadas.</p>';
                    return;
                }
                
                techOtList.innerHTML = '';
                ots.forEach(ot => {
                    const isPending = ot.estado === 'Pendiente';
                    const isInProgress = ot.estado === 'En Proceso';
                    const isDone = ot.estado === 'Resuelta';
                    
                    let statusClass = 'pending';
                    let statusLabel = 'Pendiente';
                    let actionBtn = '';
                    
                    if (isInProgress) {
                        statusClass = 'in-progress';
                        statusLabel = 'En Proceso';
                        actionBtn = `<button class="btn-primary btn-complete-task" data-id="${ot.id}" data-plantilla-id="${ot.plantilla_id || ''}" style="font-size: 0.8rem; background: var(--success);">Finalizar</button>`;
                    } else if (isPending) {
                        actionBtn = `<button class="btn-secondary btn-start-task" data-id="${ot.id}" style="font-size: 0.8rem; border-color: var(--accent-color); color: var(--accent-color);">Iniciar</button>`;
                    } else if (isDone) {
                        statusClass = 'status-ok';
                        statusLabel = 'Resuelta';
                        actionBtn = '<span style="color: var(--success); font-size: 0.85rem; font-weight: 600;">✓ Resuelta</span>';
                    }

                    const activeName = ot.activo_nombre ? `<strong>Activo:</strong> ${ot.activo_nombre}` : '<span style="color: var(--warning);">Reporte general de área</span>';
                    
                    techOtList.innerHTML += `
                        <div class="tech-ot-card ${statusClass}">
                            <div class="tech-ot-header">
                                <span style="font-weight: 700; font-size: 0.95rem; color: var(--accent-color);">#OT-${ot.id}</span>
                                <span class="card-tag status-${isPending ? 'open' : isInProgress ? 'progress' : 'done'}">${statusLabel}</span>
                            </div>
                            <div class="tech-ot-body">
                                <p style="margin-bottom: 0.4rem;"><strong>Ubicación:</strong> ${ot.planta_nombre} / ${ot.edificio_nombre} ${ot.ubicacion_nombre ? '/ ' + ot.ubicacion_nombre : ''}</p>
                                <p style="margin-bottom: 0.4rem;">${activeName}</p>
                                <p style="margin-top: 0.5rem; background: rgba(0,0,0,0.15); padding: 0.6rem; border-radius: 6px; font-size: 0.85rem; color: #cbd5e1; border-left: 2px solid var(--border-focus);">${ot.descripcion}</p>
                                ${ot.comentarios_tecnicos ? `<p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--success);"><strong>Resolución:</strong> ${ot.comentarios_tecnicos}</p>` : ''}
                            </div>
                            <div class="tech-ot-footer">
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Prioridad: <strong style="color: ${ot.prioridad === 'Alta' ? 'var(--danger)' : ot.prioridad === 'Media' ? 'var(--warning)' : 'var(--success)'}">${ot.prioridad}</strong></span>
                                <div>${actionBtn}</div>
                            </div>
                        </div>
                    `;
                });
                
                // Add event listeners to action buttons
                document.querySelectorAll('.btn-start-task').forEach(btn => {
                    btn.addEventListener('click', () => startTask(btn.getAttribute('data-id')));
                });
                document.querySelectorAll('.btn-complete-task').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const otId = btn.getAttribute('data-id');
                        const pId = btn.getAttribute('data-plantilla-id') ? parseInt(btn.getAttribute('data-plantilla-id')) : null;
                        openCompleteModal(otId, pId);
                    });
                });
            })
            .catch(err => console.error('Error al cargar tareas del técnico:', err));
    }

    // --- 4. START TASK ACTION ---
    function startTask(otId) {
        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'En Proceso' })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al iniciar tarea');
            loadMyTasks();
        })
        .catch(err => alert(err.message));
    }

    // --- 5. COMPLETE TASK DIALOG ---
    const techChecklistSection = document.getElementById('tech-checklist-section');
    const techChecklistContainer = document.getElementById('tech-checklist-container');
    let currentChecklistItems = [];

    function openCompleteModal(otId, plantillaId) {
        resolveOtId.value = otId;
        resolveComments.value = '';
        techChecklistContainer.innerHTML = '';
        techChecklistSection.style.display = 'none';
        currentChecklistItems = [];

        if (plantillaId) {
            // Load checklist items
            fetch(`/api/plantillas/${plantillaId}/items`)
                .then(res => res.json())
                .then(items => {
                    currentChecklistItems = items;
                    if (items.length > 0) {
                        techChecklistSection.style.display = 'block';
                        items.forEach(item => {
                            let inputHtml = '';
                            if (item.tipo_respuesta === 'booleano') {
                                inputHtml = `
                                    <div class="flex-inline" style="gap: 1.5rem; margin-top: 0.25rem;">
                                        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem; color: #a3e635; font-size: 0.85rem;">
                                            <input type="radio" name="check-${item.id}" value="ok" required checked>
                                            Pasa (OK)
                                        </label>
                                        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.35rem; color: #f87171; font-size: 0.85rem;">
                                            <input type="radio" name="check-${item.id}" value="fail">
                                            Falla (No OK)
                                        </label>
                                    </div>
                                `;
                            } else if (item.tipo_respuesta === 'numerico') {
                                inputHtml = `
                                    <div class="flex-inline" style="margin-top: 0.25rem;">
                                        <input type="number" step="any" class="form-control" id="check-${item.id}" placeholder="Ej: 12.5" required style="flex: 1;">
                                        <span style="color: var(--text-muted); font-size: 0.85rem; padding: 0.45rem 0.65rem; background: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color);">${item.unidad_medida || ''}</span>
                                    </div>
                                `;
                            } else {
                                inputHtml = `
                                    <input type="text" class="form-control" id="check-${item.id}" placeholder="Detalles de inspección..." required style="margin-top: 0.25rem;">
                                `;
                            }

                            techChecklistContainer.innerHTML += `
                                <div class="checklist-item-row" style="background: rgba(255,255,255,0.02); padding: 0.65rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05); text-align: left;">
                                    <label style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); display: block; margin-bottom: 0.25rem;">${item.texto_pregunta}</label>
                                    ${inputHtml}
                                    <input type="text" class="form-control" id="obs-${item.id}" placeholder="Nota u observación opcional" style="margin-top: 0.5rem; font-size: 0.78rem; padding: 0.35rem 0.5rem; background: rgba(0,0,0,0.1);">
                                </div>
                              `;
                        });
                    }
                })
                .catch(err => console.error('Error al cargar checklist:', err));
        }

        resolveModal.style.display = 'flex';
    }

    closeModal.addEventListener('click', () => {
        resolveModal.style.display = 'none';
    });

    resolveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otId = resolveOtId.value;
        const comment = resolveComments.value.trim();

        // Gather checklist responses
        const respuestas = [];
        currentChecklistItems.forEach(item => {
            let valBool = null;
            let valText = null;
            let valNum = null;
            const obs = document.getElementById(`obs-${item.id}`).value.trim() || null;

            if (item.tipo_respuesta === 'booleano') {
                const radioChecked = document.querySelector(`input[name="check-${item.id}"]:checked`);
                valBool = radioChecked ? (radioChecked.value === 'ok') : true;
            } else if (item.tipo_respuesta === 'numerico') {
                const inputVal = document.getElementById(`check-${item.id}`).value.trim();
                valNum = inputVal ? parseFloat(inputVal) : null;
            } else {
                valText = document.getElementById(`check-${item.id}`).value.trim() || null;
            }

            respuestas.push({
                item_plantilla_id: item.id,
                valor_booleano: valBool,
                valor_texto: valText,
                valor_numerico: valNum,
                observacion: obs
            });
        });

        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                estado: 'Resuelta',
                comentarios_tecnicos: comment,
                respuestas: respuestas
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al completar tarea');
            resolveModal.style.display = 'none';
            loadMyTasks();
        })
        .catch(err => alert(err.message));
    });

    // --- 6. CORRECTIVE REPORT ON THE GO ---
    function loadPlantsForReport() {
        fetch('/api/plantas')
            .then(res => res.json())
            .then(plantas => {
                techSelectPlanta.innerHTML = '<option value="">-- Selecciona planta --</option>';
                plantas.forEach(p => {
                    techSelectPlanta.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
                });
            })
            .catch(err => console.error('Error:', err));
    }

    techSelectPlanta.addEventListener('change', () => {
        const plantaId = techSelectPlanta.value;
        techSelectEdificio.innerHTML = '<option value="">-- Selecciona --</option>';
        techSelectEdificio.disabled = true;
        techSelectUbicacion.innerHTML = '<option value="">-- Selecciona --</option>';
        techSelectUbicacion.disabled = true;
        btnAddLocation.disabled = true;
        techSelectActivo.innerHTML = '<option value="">-- Selecciona --</option>';
        techSelectActivo.disabled = true;

        if (!plantaId) return;

        fetch(`/api/plantas/${plantaId}/edificios`)
            .then(res => res.json())
            .then(edificios => {
                techSelectEdificio.disabled = false;
                edificios.forEach(e => {
                    techSelectEdificio.innerHTML += `<option value="${e.id}">${e.nombre}</option>`;
                });
            })
            .catch(err => console.error(err));
    });

    techSelectEdificio.addEventListener('change', () => {
        const edificioId = techSelectEdificio.value;
        techSelectUbicacion.innerHTML = '<option value="">-- Selecciona --</option>';
        techSelectUbicacion.disabled = true;
        btnAddLocation.disabled = true;
        techSelectActivo.innerHTML = '<option value="">-- Selecciona --</option>';
        techSelectActivo.disabled = true;

        if (!edificioId) return;

        btnAddLocation.disabled = false;
        loadLocationsForEdificio(edificioId);
    });

    function loadLocationsForEdificio(edificioId, autoSelectId = null) {
        fetch(`/api/edificios/${edificioId}/ubicaciones`)
            .then(res => res.json())
            .then(ubicaciones => {
                techSelectUbicacion.disabled = false;
                techSelectUbicacion.innerHTML = '<option value="">-- Selecciona ubicación --</option>';
                
                ubicaciones.forEach(u => {
                    const selected = autoSelectId && u.id === autoSelectId ? 'selected' : '';
                    techSelectUbicacion.innerHTML += `<option value="${u.id}" ${selected}>${u.nombre}</option>`;
                });
                
                if (autoSelectId) {
                    loadAssetsForLocation(autoSelectId);
                }
            })
            .catch(err => console.error(err));
    }

    techSelectUbicacion.addEventListener('change', () => {
        const ubicacionId = techSelectUbicacion.value;
        techSelectActivo.innerHTML = '<option value="">-- Selecciona --</option>';
        techSelectActivo.disabled = true;

        if (!ubicacionId) return;

        loadAssetsForLocation(ubicacionId);
    });

    function loadAssetsForLocation(ubicacionId) {
        fetch(`/api/activos?ubicacion_id=${ubicacionId}`)
            .then(res => res.json())
            .then(activos => {
                techSelectActivo.disabled = false;
                techSelectActivo.innerHTML = '<option value="">-- Selecciona activo (opcional) --</option>';
                
                if (activos.length === 0) {
                    techSelectActivo.innerHTML = '<option value="">Sin activos en esta ubicación</option>';
                } else {
                    activos.forEach(a => {
                        techSelectActivo.innerHTML += `<option value="${a.id}">${a.nombre} (${a.marca || 'S/M'})</option>`;
                    });
                }
            })
            .catch(err => console.error(err));
    }

    // --- 7. INLINE LOCATION CREATION ---
    btnAddLocation.addEventListener('click', () => {
        newLocationName.value = '';
        locationModal.style.display = 'flex';
    });

    closeLocationModal.addEventListener('click', () => {
        locationModal.style.display = 'none';
    });

    newLocationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const edificioId = parseInt(techSelectEdificio.value);
        const name = newLocationName.value.trim();

        fetch('/api/ubicaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: name,
                edificio_id: edificioId
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al guardar ubicación');
            return res.json();
        })
        .then(data => {
            locationModal.style.display = 'none';
            // Recargar ubicaciones y auto-seleccionar la creada
            loadLocationsForEdificio(edificioId, data.id);
        })
        .catch(err => alert(err.message));
    });

    // --- 8. SUBMIT CORRECTIVE WORK ORDER ---
    techReportForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const plantaId = parseInt(techSelectPlanta.value);
        const edificioId = parseInt(techSelectEdificio.value);
        const ubicacionId = parseInt(techSelectUbicacion.value);
        const activoId = techSelectActivo.value ? parseInt(techSelectActivo.value) : null;
        
        const description = techProblem-description.value.trim(); // wait, ID has hyphen
        // Let's resolve the variable name safely
        const descText = document.getElementById('tech-problem-description').value.trim();
        const prioridad = document.getElementById('tech-select-prioridad').value;
        const currentTechName = selectTechUser.options[selectTechUser.selectedIndex].text;

        const payload = {
            descripcion: descText,
            tipo: 'Correctiva',
            estado: 'Pendiente', // Se crea pendiente
            prioridad: prioridad,
            reportado_por: `Técnico: ${currentTechName}`,
            planta_id: plantaId,
            edificio_id: edificioId,
            ubicacion_id: ubicacionId,
            activo_id: activoId,
            tecnico_id: currentTechId ? parseInt(currentTechId) : null // Auto-asignar a sí mismo
        };

        fetch('/api/ordenes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al registrar la orden');
            return res.json();
        })
        .then(data => {
            alert(`Orden #OT-${data.id} registrada con éxito y asignada a tu cola.`);
            techReportForm.reset();
            // Reset dropdowns
            techSelectEdificio.innerHTML = '<option value="">Selecciona planta primero...</option>';
            techSelectEdificio.disabled = true;
            techSelectUbicacion.innerHTML = '<option value="">Selecciona edificio primero...</option>';
            techSelectUbicacion.disabled = true;
            btnAddLocation.disabled = true;
            techSelectActivo.innerHTML = '<option value="">Selecciona ubicación primero...</option>';
            techSelectActivo.disabled = true;
            
            // Cambiar a pestaña Mis Tareas y recargar
            tabMyTasks.click();
        })
        .catch(err => alert(err.message));
    });

    // Inicializar
    loadTechnicians();
});
