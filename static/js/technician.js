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
    const techAssignee = document.getElementById('tech-assignee');
    
    const resolveModal = document.getElementById('resolve-modal');
    const resolveForm = document.getElementById('resolve-form');
    const resolveOtId = document.getElementById('resolve-ot-id');
    const resolveComments = document.getElementById('resolve-comments');
    const closeModal = document.getElementById('close-modal');
    
    const locationModal = document.getElementById('location-modal');
    const newLocationForm = document.getElementById('new-location-form');
    const newLocationName = document.getElementById('new-location-name');
    const closeLocationModal = document.getElementById('close-location-modal');
    
    // Photo Modal DOM Elements
    const photoModal = document.getElementById('photo-modal');
    const photoUploadForm = document.getElementById('photo-upload-form');
    const photoOtId = document.getElementById('photo-ot-id');
    const photoComment = document.getElementById('photo-comment');
    const photoPreviewContainer = document.getElementById('photo-preview-container');
    const photoPreviewImg = document.getElementById('photo-preview-img');
    const closePhotoModal = document.getElementById('close-photo-modal');
    let selectedPhotoFile = null;
    
    let currentTechId = localStorage.getItem('selected_tech_id') || null;
    let allTechnicians = [];

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
    function populateAssigneeDropdown() {
        if (!techAssignee) return;
        techAssignee.innerHTML = '<option value="">-- Sin asignar --</option>';
        allTechnicians.forEach(t => {
            const isMe = currentTechId && parseInt(currentTechId) === t.id;
            techAssignee.innerHTML += `<option value="${t.id}" ${isMe ? 'selected' : ''}>${t.nombre} ${isMe ? '(Yo)' : ''}</option>`;
        });
    }

    function loadTechnicians() {
        fetch('/api/tecnicos')
            .then(res => res.json())
            .then(tecnicos => {
                allTechnicians = tecnicos;
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
                
                populateAssigneeDropdown();
                loadMyTasks();
            })
            .catch(err => console.error('Error al cargar técnicos:', err));
    }

    selectTechUser.addEventListener('change', () => {
        currentTechId = selectTechUser.value;
        if (currentTechId) {
            localStorage.setItem('selected_tech_id', currentTechId);
            populateAssigneeDropdown();
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
                
                // Sort OTs by priority (alta, media, baja) and then by creation date (older first)
                const priorityWeight = { 'alta': 1, 'media': 2, 'baja': 3 };
                ots.sort((a, b) => {
                    const pA = priorityWeight[(a.prioridad || 'media').toLowerCase()] || 2;
                    const pB = priorityWeight[(b.prioridad || 'media').toLowerCase()] || 2;
                    if (pA !== pB) return pA - pB;
                    return new Date(a.fecha_creacion || 0) - new Date(b.fecha_creacion || 0);
                });

                techOtList.innerHTML = '';
                ots.forEach(ot => {
                    const isDone = ot.estado === 'REALIZADA' || ot.estado === 'Resuelta';
                    const isScheduled = ot.estado === 'PROGRAMADA';
                    const isAssigned = ot.estado === 'ASIGNADA';
                    
                    let statusClass = 'assigned';
                    let statusLabel = 'Asignada';
                    let actionBtnHtml = '';
                    
                    if (isDone) {
                        statusClass = 'status-ok';
                        statusLabel = 'Realizada';
                        actionBtnHtml = '<span style="color: var(--success); font-size: 0.85rem; font-weight: 600;">✓ Realizada</span>';
                    } else {
                        if (ot.fecha_inicio) {
                            if (ot.estado_ejecucion === 'PAUSADA' || ot.estado_ejecucion === 'DETENIDA') {
                                statusClass = 'pending';
                                statusLabel = 'Pausada';
                                actionBtnHtml = `
                                    <button class="btn-secondary btn-tech-resume" data-id="${ot.id}" style="font-size: 0.8rem; background: var(--accent-color); color: white; border: none; padding: 0.35rem 0.65rem; border-radius: 4px; cursor: pointer; font-weight: 500;">Retomar</button>
                                    <button class="btn-primary btn-tech-complete" data-id="${ot.id}" data-plantilla-id="${ot.plantilla_id || ''}" style="font-size: 0.8rem; background: var(--success); color: white; border: none; padding: 0.35rem 0.65rem; border-radius: 4px; cursor: pointer; margin-left: 0.25rem; font-weight: 500;">Terminar</button>
                                `;
                            } else {
                                statusClass = 'in-progress';
                                statusLabel = 'Iniciada';
                                actionBtnHtml = `
                                    <button class="btn-secondary btn-tech-pause" data-id="${ot.id}" style="font-size: 0.8rem; background: var(--bg-primary); color: var(--text-color); border: 1px solid var(--border-color); padding: 0.35rem 0.65rem; border-radius: 4px; cursor: pointer; font-weight: 500;">Detener</button>
                                    <button class="btn-primary btn-tech-complete" data-id="${ot.id}" data-plantilla-id="${ot.plantilla_id || ''}" style="font-size: 0.8rem; background: var(--success); color: white; border: none; padding: 0.35rem 0.65rem; border-radius: 4px; cursor: pointer; margin-left: 0.25rem; font-weight: 500;">Terminar</button>
                                `;
                            }
                        } else {
                            if (isScheduled) {
                                statusClass = 'scheduled';
                                statusLabel = 'Programada';
                            } else {
                                statusClass = 'assigned';
                                statusLabel = 'Asignada';
                            }
                            actionBtnHtml = `<button class="btn-primary btn-tech-start" data-id="${ot.id}" style="font-size: 0.8rem; background: var(--accent-color); color: white; border: none; padding: 0.35rem 0.65rem; border-radius: 4px; cursor: pointer; font-weight: 500;">Iniciar</button>`;
                        }
                    }

                    const activeName = ot.activo_nombre ? `<strong>Activo:</strong> ${ot.activo_nombre}` : '<span style="color: var(--warning);">Reporte general de área</span>';
                    
                    let dateHtml = '';
                    if (ot.fecha_programada) {
                        const dateObj = new Date(ot.fecha_programada);
                        let formattedDate = dateObj.toLocaleDateString('es-CL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                        const hours = String(dateObj.getHours()).padStart(2, '0');
                        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                        const timePart = `${hours}:${minutes}`;
                        if (timePart !== '00:00') {
                            formattedDate += ` a las ${timePart}`;
                        }
                        dateHtml = `<p style="margin-bottom: 0.4rem; color: var(--warning);"><span style="font-size: 1.1rem; vertical-align: middle; margin-right: 0.2rem;">📅</span><strong>Prog:</strong> ${formattedDate}</p>`;
                    }

                    // Renderizar fotos
                    let fotosHtml = '';
                    if (ot.fotos && ot.fotos.length > 0) {
                        fotosHtml = `
                            <div style="margin-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem;">
                                <strong style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Fotos de Respaldo:</strong>
                                <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem;">
                                    ${ot.fotos.map(f => `
                                        <div style="flex: 0 0 80px; position: relative; cursor: pointer;" onclick="window.open('${f.url_foto}', '_blank')">
                                            <img src="${f.url_foto}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" title="${f.comentario || ''}">
                                            ${f.comentario ? `<div style="font-size: 0.65rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; margin-top: 0.15rem;">${f.comentario}</div>` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }

                    let uploadPhotoHtml = '';
                    if (!isDone) {
                        uploadPhotoHtml = `
                            <div style="margin-top: 0.5rem; text-align: left;">
                                <button class="btn-secondary btn-tech-upload-photo-trigger" data-id="${ot.id}" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; display: flex; align-items: center; gap: 0.25rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-color); cursor: pointer;">
                                    📸 Añadir Foto
                                </button>
                                <input type="file" id="file-input-${ot.id}" accept="image/*" style="display: none;" class="tech-file-input" data-id="${ot.id}">
                            </div>
                        `;
                    }

                    // Renderizar comentarios de avance (Bitácora)
                    let comentariosAvanceHtml = '';
                    if (ot.comentarios_avance && ot.comentarios_avance.length > 0) {
                        comentariosAvanceHtml = `
                            <div style="margin-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; text-align: left;">
                                <strong style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Bitácora de Notas:</strong>
                                <div style="display: flex; flex-direction: column; gap: 0.45rem; max-height: 150px; overflow-y: auto; background: rgba(0,0,0,0.15); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);">
                                    ${ot.comentarios_avance.map(c => {
                                        const cDate = new Date(c.fecha_creacion);
                                        const timeStr = cDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                                        const dateStr = cDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
                                        return `
                                            <div style="font-size: 0.78rem; line-height: 1.35; border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom: 0.25rem; margin-bottom: 0.15rem;">
                                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.1rem;">
                                                    <span style="color: var(--accent-color); font-weight: 600; font-size: 0.75rem;">${c.autor}</span>
                                                    <span style="color: var(--text-muted); font-size: 0.68rem;">${dateStr} ${timeStr}</span>
                                                </div>
                                                <span style="color: #e2e8f0;">${c.comentario}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `;
                    }

                    let addCommentHtml = '';
                    if (!isDone) {
                        addCommentHtml = `
                            <div style="margin-top: 0.65rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; display: flex; gap: 0.35rem; align-items: center;">
                                <input type="text" id="note-input-${ot.id}" class="form-control" placeholder="Escribe una nota de avance..." style="font-size: 0.8rem; padding: 0.35rem 0.5rem; flex: 1; height: 32px; background: rgba(0,0,0,0.2);">
                                <button class="btn-primary btn-tech-add-note" data-id="${ot.id}" style="font-size: 0.8rem; padding: 0 0.75rem; background: var(--accent-color); border: none; border-radius: 4px; cursor: pointer; font-weight: 500; height: 32px; display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                                    Enviar
                                </button>
                            </div>
                        `;
                    }

                    // Render components worked on
                    let componentsHtml = '';
                    if (ot.componentes_trabajados && ot.componentes_trabajados.length > 0) {
                        componentsHtml = `
                            <div style="font-size: 0.8rem; background: rgba(59, 130, 246, 0.08); border-left: 2px solid var(--accent-color); padding: 0.35rem 0.5rem; border-radius: 4px; margin-top: 0.4rem; margin-bottom: 0.4rem; text-align: left;">
                                <strong style="color: var(--text-color); font-size: 0.78rem; display: block; margin-bottom: 0.15rem;">Despieces a Trabajar:</strong>
                                <ul style="margin: 0; padding-left: 1rem; list-style-type: disc; display: flex; flex-direction: column; gap: 0.15rem;">
                                    ${ot.componentes_trabajados.map(comp => `
                                        <li>
                                            <strong style="color: var(--text-main);">${comp.nombre}</strong>
                                            ${comp.comentario ? `<span style="color: #cbd5e1; font-style: italic;"> - "${comp.comentario}"</span>` : ''}
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        `;
                    }

                    techOtList.innerHTML += `
                        <div class="tech-ot-card ${statusClass}">
                            <div class="tech-ot-header">
                                <span style="font-weight: 700; font-size: 0.95rem; color: var(--accent-color);">#OT-${ot.id}</span>
                                <span class="card-tag status-${isDone ? 'done' : statusLabel === 'Iniciada' ? 'progress' : statusLabel === 'Pausada' ? 'pending' : isScheduled ? 'scheduled' : 'assigned'}">${statusLabel}</span>
                            </div>
                            <div class="tech-ot-body">
                                <p style="margin-bottom: 0.4rem;"><strong>Ubicación:</strong> ${ot.planta_nombre} / ${ot.edificio_nombre} ${ot.ubicacion_nombre ? '/ ' + ot.ubicacion_nombre : ''}</p>
                                <p style="margin-bottom: 0.4rem;">${activeName}</p>
                                ${dateHtml}
                                <p style="margin-top: 0.5rem; background: rgba(0,0,0,0.15); padding: 0.6rem; border-radius: 6px; font-size: 0.85rem; color: #cbd5e1; border-left: 2px solid var(--border-focus);">${ot.descripcion}</p>
                                ${componentsHtml}
                                ${ot.comentarios_tecnicos ? `<p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--success);"><strong>Resolución:</strong> ${ot.comentarios_tecnicos}</p>` : ''}
                                ${fotosHtml}
                                ${uploadPhotoHtml}
                                ${comentariosAvanceHtml}
                                ${addCommentHtml}
                            </div>
                            <div class="tech-ot-footer">
                                <span style="font-size: 0.75rem; color: var(--text-muted);">Prioridad: <strong style="color: ${ot.prioridad === 'Alta' ? 'var(--danger)' : ot.prioridad === 'Media' ? 'var(--warning)' : 'var(--success)'}">${ot.prioridad}</strong></span>
                                <div class="flex-inline">${actionBtnHtml}</div>
                            </div>
                        </div>
                    `;
                });
                
                // Add event listeners to action buttons
                document.querySelectorAll('.btn-tech-start').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const otId = btn.getAttribute('data-id');
                        startTask(otId);
                    });
                });

                document.querySelectorAll('.btn-tech-pause').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const otId = btn.getAttribute('data-id');
                        pauseTask(otId);
                    });
                });

                document.querySelectorAll('.btn-tech-resume').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const otId = btn.getAttribute('data-id');
                        resumeTask(otId);
                    });
                });

                document.querySelectorAll('.btn-tech-complete').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const otId = btn.getAttribute('data-id');
                        const pId = btn.getAttribute('data-plantilla-id') ? parseInt(btn.getAttribute('data-plantilla-id')) : null;
                        openCompleteModal(otId, pId);
                    });
                });

                // Listeners for photo triggers
                document.querySelectorAll('.btn-tech-upload-photo-trigger').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const otId = btn.getAttribute('data-id');
                        const fileInput = document.getElementById(`file-input-${otId}`);
                        if (fileInput) fileInput.click();
                    });
                });

                document.querySelectorAll('.tech-file-input').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const otId = input.getAttribute('data-id');
                        const file = e.target.files[0];
                        if (file) {
                            openPhotoModal(otId, file);
                        }
                    });
                });

                // Listeners for progress notes
                document.querySelectorAll('.btn-tech-add-note').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const otId = btn.getAttribute('data-id');
                        const noteInput = document.getElementById(`note-input-${otId}`);
                        if (noteInput && noteInput.value.trim()) {
                            addProgressNote(otId, noteInput.value.trim());
                        }
                    });
                });
            })
            .catch(err => console.error('Error al cargar tareas del técnico:', err));
    }

    function addProgressNote(otId, comentario) {
        const currentTechName = selectTechUser.options[selectTechUser.selectedIndex].text;
        fetch(`/api/ordenes/${otId}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                comentario: comentario,
                autor: currentTechName
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al guardar nota de avance');
            return res.json();
        })
        .then(() => {
            loadMyTasks();
        })
        .catch(err => alert(err.message));
    }

    // --- 4. START/PAUSE/RESUME TASK ACTIONS ---
    function startTask(otId) {
        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fecha_inicio: new Date().toISOString(),
                estado_ejecucion: 'EN_PROCESO'
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al iniciar la tarea');
            loadMyTasks();
        })
        .catch(err => alert(err.message));
    }

    function pauseTask(otId) {
        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                estado_ejecucion: 'PAUSADA'
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al detener la tarea');
            loadMyTasks();
        })
        .catch(err => alert(err.message));
    }

    function resumeTask(otId) {
        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                estado_ejecucion: 'EN_PROCESO'
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al retomar la tarea');
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
                estado: 'REALIZADA',
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

    function resetTechOtComponents() {
        const container = document.getElementById('tech-ot-components-container');
        if (container) container.style.display = 'none';
        const listDiv = document.getElementById('tech-ot-components-list');
        if (listDiv) listDiv.innerHTML = '';
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
        resetTechOtComponents();

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
        resetTechOtComponents();

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
        resetTechOtComponents();

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

    techSelectActivo.addEventListener('change', (e) => {
        const activoId = e.target.value;
        const container = document.getElementById('tech-ot-components-container');
        const listDiv = document.getElementById('tech-ot-components-list');
        
        listDiv.innerHTML = '';
        container.style.display = 'none';
        
        if (!activoId) return;
        
        fetch(`/api/activos/${activoId}`)
            .then(res => res.json())
            .then(data => {
                if (data.componentes && data.componentes.length > 0) {
                    container.style.display = 'block';
                    data.componentes.forEach(comp => {
                        const itemHtml = `
                            <div class="tech-ot-component-item" style="display: flex; flex-direction: column; gap: 0.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.25rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" id="tech-ot-comp-${comp.id}" class="tech-ot-comp-checkbox" value="${comp.id}" style="width: 16px; height: 16px; cursor: pointer;">
                                    <label for="tech-ot-comp-${comp.id}" style="margin-bottom: 0; cursor: pointer; font-weight: 500; font-size: 0.85rem; color: var(--text-main);">${comp.nombre} (${comp.estado})</label>
                                </div>
                                <div id="tech-ot-comp-comment-container-${comp.id}" style="display: none; padding-left: 1.5rem;">
                                    <input type="text" id="tech-ot-comp-comment-${comp.id}" class="form-control" placeholder="Comentario técnico para este componente..." style="padding: 0.35rem 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                </div>
                            </div>
                        `;
                        listDiv.insertAdjacentHTML('beforeend', itemHtml);
                        
                        const checkbox = document.getElementById(`tech-ot-comp-${comp.id}`);
                        const commentContainer = document.getElementById(`tech-ot-comp-comment-container-${comp.id}`);
                        checkbox.addEventListener('change', () => {
                            if (checkbox.checked) {
                                commentContainer.style.display = 'block';
                            } else {
                                commentContainer.style.display = 'none';
                                document.getElementById(`tech-ot-comp-comment-${comp.id}`).value = '';
                            }
                        });
                    });
                }
            })
            .catch(err => console.error('Error al obtener componentes:', err));
    });

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
        
        const descText = document.getElementById('tech-problem-description').value.trim();
        const prioridad = document.getElementById('tech-select-prioridad').value;
        const currentTechName = selectTechUser.value ? selectTechUser.options[selectTechUser.selectedIndex].text : 'Técnico';

        const targetAssigneeVal = document.getElementById('tech-assignee').value;
        const targetTechId = targetAssigneeVal ? parseInt(targetAssigneeVal) : null;

        const componentes_trabajados = [];
        document.querySelectorAll('.tech-ot-comp-checkbox:checked').forEach(cb => {
            const compId = parseInt(cb.value);
            const commentInput = document.getElementById(`tech-ot-comp-comment-${compId}`);
            componentes_trabajados.push({
                componente_id: compId,
                comentario: commentInput ? commentInput.value.trim() || null : null
            });
        });

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
            tecnico_id: targetTechId,
            componentes_trabajados: componentes_trabajados
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
            let successMsg = `Orden #OT-${data.id} registrada con éxito.`;
            if (data.tecnico_id) {
                if (currentTechId && parseInt(currentTechId) === data.tecnico_id) {
                    successMsg += " Asignada a tu cola.";
                } else {
                    const assignedTech = allTechnicians.find(t => t.id === data.tecnico_id);
                    if (assignedTech) {
                        successMsg += ` Asignada a ${assignedTech.nombre}.`;
                    }
                }
            } else {
                successMsg += " Quedó sin asignar.";
            }
            alert(successMsg);

            techReportForm.reset();
            resetTechOtComponents();
            populateAssigneeDropdown();
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

    // --- 9. PHOTO MODAL MANAGEMENT ---
    function openPhotoModal(otId, file) {
        photoOtId.value = otId;
        selectedPhotoFile = file;
        photoComment.value = '';
        
        // Show file preview
        const reader = new FileReader();
        reader.onload = (e) => {
            photoPreviewImg.src = e.target.result;
            photoPreviewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
        
        photoModal.style.display = 'flex';
    }

    closePhotoModal.addEventListener('click', () => {
        photoModal.style.display = 'none';
        selectedPhotoFile = null;
    });

    photoUploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedPhotoFile) return;

        const otId = photoOtId.value;
        const commentVal = photoComment.value.trim();
        const btnConfirm = document.getElementById('btn-confirm-upload');
        
        btnConfirm.disabled = true;
        btnConfirm.textContent = 'Subiendo...';

        const formData = new FormData();
        formData.append('file', selectedPhotoFile);
        if (commentVal) {
            formData.append('comentario', commentVal);
        }

        fetch(`/api/ordenes/${otId}/fotos`, {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al subir la imagen');
            return res.json();
        })
        .then(data => {
            photoModal.style.display = 'none';
            selectedPhotoFile = null;
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Subir Imagen';
            loadMyTasks();
        })
        .catch(err => {
            alert(err.message);
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Subir Imagen';
        });
    });

    // Inicializar
    loadTechnicians();
});
