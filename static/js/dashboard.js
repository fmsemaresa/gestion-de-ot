document.addEventListener('DOMContentLoaded', () => {
    // State Variables
    let selectedPlantaId = null;
    let selectedEdificioId = null;
    let selectedUbicacionId = null;
    let selectedActivoId = null;
    let activeTab = 'ots'; // 'ots' or 'activos'
    let techniciansList = [];

    // DOM Elements
    const kpiTotalOts = document.getElementById('kpi-total-ots');
    const kpiPendientes = document.getElementById('kpi-pendientes');
    const kpiResueltas = document.getElementById('kpi-resueltas');
    const kpiMttr = document.getElementById('kpi-mttr');
    const kpiActivos = document.getElementById('kpi-activos');
    
    const hierarchyTree = document.getElementById('hierarchy-tree');
    
    const tabBtnOts = document.getElementById('tab-btn-ots');
    const tabBtnActivos = document.getElementById('tab-btn-activos');
    const tabOts = document.getElementById('tab-ots');
    const tabActivos = document.getElementById('tab-activos');
    
    const otGrid = document.getElementById('ot-grid');
    const filterOtState = document.getElementById('filter-ot-state');
    const btnCreateOt = document.getElementById('btn-create-ot');
    
    const activoGrid = document.getElementById('activo-grid');
    const btnCreateActivo = document.getElementById('btn-create-activo');
    const currentLocationLabel = document.getElementById('current-location-label');
    
    // Modals
    const otModal = document.getElementById('ot-modal');
    const otForm = document.getElementById('ot-form');
    const closeOtModal = document.getElementById('close-ot-modal');
    
    const assetModal = document.getElementById('asset-modal');
    const assetForm = document.getElementById('asset-form');
    const closeAssetModal = document.getElementById('close-asset-modal');
    
    const componentModal = document.getElementById('component-modal');
    const componentForm = document.getElementById('component-form');
    const closeComponentModal = document.getElementById('close-component-modal');
    const btnAddComponent = document.getElementById('btn-add-component');
    
    const assignModal = document.getElementById('assign-modal');
    const assignForm = document.getElementById('assign-form');
    const closeAssignModal = document.getElementById('close-assign-modal');
    const assignSelectTecnico = document.getElementById('assign-select-tecnico');
    const assignOtId = document.getElementById('assign-ot-id');

    // Drawer
    const assetDrawer = document.getElementById('asset-drawer');
    const closeDrawer = document.getElementById('close-drawer');
    const drawerAssetName = document.getElementById('drawer-asset-name');
    const drawerAssetMarca = document.getElementById('drawer-asset-marca');
    const drawerAssetModelo = document.getElementById('drawer-asset-modelo');
    const drawerAssetSerie = document.getElementById('drawer-asset-serie');
    const drawerAssetEstado = document.getElementById('drawer-asset-estado');
    const drawerAssetPlanta = document.getElementById('drawer-asset-planta');
    const drawerAssetEdificio = document.getElementById('drawer-asset-edificio');
    const drawerAssetUbicacion = document.getElementById('drawer-asset-ubicacion');
    const drawerComponentList = document.getElementById('drawer-component-list');
    const drawerHistoryList = document.getElementById('drawer-history-list');

    // Simulated Role Toggle
    const selectRole = document.getElementById('select-role');
    selectRole.addEventListener('change', () => {
        if (selectRole.value === 'tech') {
            window.open('/static/technician.html', '_blank');
            selectRole.value = 'admin'; // Revert selection
        }
    });

    // --- 1. TAB TOGGLE ---
    tabBtnOts.addEventListener('click', () => {
        activeTab = 'ots';
        tabBtnOts.style.borderBottomColor = 'var(--accent-color)';
        tabBtnActivos.style.borderBottomColor = 'transparent';
        tabOts.style.display = 'block';
        tabActivos.style.display = 'none';
        loadWorkOrders();
    });

    tabBtnActivos.addEventListener('click', () => {
        activeTab = 'activos';
        tabBtnActivos.style.borderBottomColor = 'var(--accent-color)';
        tabBtnOts.style.borderBottomColor = 'transparent';
        tabActivos.style.display = 'block';
        tabOts.style.display = 'none';
        loadAssets();
    });

    // --- 2. LOAD KPIS ---
    function loadKPIs() {
        fetch('/api/dashboard/stats')
            .then(res => res.json())
            .then(data => {
                const kpis = data.kpis;
                kpiTotalOts.textContent = kpis.total_ots;
                kpiPendientes.textContent = kpis.pendientes;
                kpiResueltas.textContent = kpis.resueltas;
                kpiMttr.textContent = kpis.mttr_horas.toFixed(1);
                kpiActivos.innerHTML = `${kpis.activos_operativos} <span style="font-size: 1rem; color: var(--text-muted);">/ ${kpis.total_activos}</span>`;
            })
            .catch(err => console.error('Error al cargar KPIs:', err));
    }

    // --- 3. LOAD HIERARCHY TREE ---
    function loadHierarchy() {
        fetch('/api/plantas')
            .then(res => res.json())
            .then(plantas => {
                hierarchyTree.innerHTML = '';
                plantas.forEach(p => {
                    const plantNode = document.createElement('div');
                    plantNode.className = 'hierarchy-item';
                    plantNode.innerHTML = `
                        <div class="hierarchy-header" data-planta-id="${p.id}">
                            <span>🏢 ${p.nombre}</span>
                            <span class="arrow">▶</span>
                        </div>
                        <div class="hierarchy-content" id="plant-content-${p.id}">
                            <p style="color: var(--text-muted); font-size: 0.8rem; padding: 0.5rem 0;">Cargando edificios...</p>
                        </div>
                    `;
                    hierarchyTree.appendChild(plantNode);

                    // Click handler for Plant
                    const header = plantNode.querySelector('.hierarchy-header');
                    header.addEventListener('click', () => {
                        const content = document.getElementById(`plant-content-${p.id}`);
                        const isVisible = content.style.display === 'block';
                        
                        // Close other plants visually (optional, we just toggle here)
                        content.style.display = isVisible ? 'none' : 'block';
                        header.querySelector('.arrow').textContent = isVisible ? '▶' : '▼';
                        
                        selectedPlantaId = p.id;
                        selectedEdificioId = null;
                        selectedUbicacionId = null;
                        
                        // Remove active styling from all, add to this
                        document.querySelectorAll('.hierarchy-header').forEach(h => h.classList.remove('active'));
                        document.querySelectorAll('.sub-item').forEach(s => s.classList.remove('active'));
                        header.classList.add('active');
                        
                        // Load buildings for this plant if not loaded
                        if (!isVisible) {
                            loadBuildings(p.id, content);
                        }
                        
                        // Update views
                        loadWorkOrders();
                        loadAssets();
                    });
                });
            })
            .catch(err => console.error('Error al cargar jerarquía:', err));
    }

    function loadBuildings(plantaId, containerElement) {
        fetch(`/api/plantas/${plantaId}/edificios`)
            .then(res => res.json())
            .then(edificios => {
                containerElement.innerHTML = '';
                edificios.forEach(e => {
                    const buildingItem = document.createElement('div');
                    buildingItem.className = 'building-item';
                    buildingItem.style.margin = '0.4rem 0';
                    buildingItem.innerHTML = `
                        <div class="sub-item" data-edificio-id="${e.id}" style="font-weight: 500; cursor: pointer; padding: 0.4rem 0.5rem; display: flex; justify-content: space-between;">
                            <span>📦 ${e.nombre}</span>
                            <span class="sub-arrow">▶</span>
                        </div>
                        <div class="location-container" id="building-locations-${e.id}" style="display: none; padding-left: 1.2rem; flex-direction: column; gap: 0.25rem; border-left: 1px dashed var(--border-color); margin-top: 0.25rem;">
                        </div>
                    `;
                    containerElement.appendChild(buildingItem);

                    const bHeader = buildingItem.querySelector('.sub-item');
                    bHeader.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent trigger plant click
                        
                        const locContainer = document.getElementById(`building-locations-${e.id}`);
                        const isLocVisible = locContainer.style.display === 'flex';
                        
                        locContainer.style.display = isLocVisible ? 'none' : 'flex';
                        bHeader.querySelector('.sub-arrow').textContent = isLocVisible ? '▶' : '▼';
                        
                        selectedPlantaId = plantaId;
                        selectedEdificioId = e.id;
                        selectedUbicacionId = null;
                        
                        document.querySelectorAll('.hierarchy-header').forEach(h => h.classList.remove('active'));
                        document.querySelectorAll('.sub-item').forEach(s => h => {}); // clear sub-item styles
                        document.querySelectorAll('.sub-item').forEach(s => s.classList.remove('active'));
                        bHeader.classList.add('active');
                        
                        if (!isLocVisible) {
                            loadLocations(e.id, locContainer);
                        }
                        
                        loadWorkOrders();
                        loadAssets();
                    });
                });
            })
            .catch(err => console.error(err));
    }

    function loadLocations(edificioId, containerElement) {
        fetch(`/api/edificios/${edificioId}/ubicaciones`)
            .then(res => res.json())
            .then(ubicaciones => {
                containerElement.innerHTML = '';
                
                // Add Quick add location button
                const btnAddLoc = document.createElement('div');
                btnAddLoc.className = 'sub-item';
                btnAddLoc.style.color = 'var(--accent-color)';
                btnAddLoc.style.border = '1px dashed var(--border-color)';
                btnAddLoc.style.justifyContent = 'center';
                btnAddLoc.innerHTML = '<span>+ Crear Ubicación</span>';
                btnAddLoc.addEventListener('click', (event) => {
                    event.stopPropagation();
                    // Open location creation modal
                    openLocationModalDirect(edificioId);
                });
                containerElement.appendChild(btnAddLoc);
                
                if (ubicaciones.length === 0) {
                    const emptyText = document.createElement('div');
                    emptyText.style.color = 'var(--text-muted)';
                    emptyText.style.fontSize = '0.8rem';
                    emptyText.style.padding = '0.25rem 0.5rem';
                    emptyText.textContent = 'Sin ubicaciones';
                    containerElement.appendChild(emptyText);
                    return;
                }
                
                ubicaciones.forEach(u => {
                    const locItem = document.createElement('div');
                    locItem.className = 'sub-item';
                    locItem.style.fontSize = '0.85rem';
                    locItem.setAttribute('data-ubicacion-id', u.id);
                    locItem.innerHTML = `<span>📍 ${u.nombre}</span>`;
                    containerElement.appendChild(locItem);

                    locItem.addEventListener('click', (event) => {
                        event.stopPropagation();
                        
                        selectedUbicacionId = u.id;
                        
                        document.querySelectorAll('.sub-item').forEach(s => s.classList.remove('active'));
                        locItem.classList.add('active');
                        
                        // Set current location text
                        currentLocationLabel.textContent = `📍 Ubicación seleccionada: ${u.nombre}`;
                        btnCreateActivo.disabled = false;
                        
                        // Load assets & work orders for location
                        loadAssets();
                        loadWorkOrders();
                    });
                });
            })
            .catch(err => console.error(err));
    }

    // --- 4. LOAD WORK ORDERS ---
    function loadWorkOrders() {
        let url = '/api/ordenes';
        const params = [];
        
        const filterState = filterOtState.value;
        if (filterState) params.push(`estado=${filterState}`);
        
        if (selectedPlantaId && !selectedEdificioId) {
            params.push(`planta_id=${selectedPlantaId}`);
        }
        
        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        otGrid.innerHTML = '<p style="color: var(--text-muted);">Cargando órdenes de trabajo...</p>';

        fetch(url)
            .then(res => res.json())
            .then(ots => {
                // Filter OTs in javascript for edificio_id or ubicacion_id
                let filteredOts = ots;
                if (selectedEdificioId && !selectedUbicacionId) {
                    filteredOts = ots.filter(ot => ot.edificio_nombre === document.querySelector(`[data-edificio-id="${selectedEdificioId}"] span`).textContent.replace('📦 ', ''));
                } else if (selectedUbicacionId) {
                    filteredOts = ots.filter(ot => ot.ubicacion_nombre === document.querySelector(`[data-ubicacion-id="${selectedUbicacionId}"] span`).textContent.replace('📍 ', ''));
                }

                if (filteredOts.length === 0) {
                    otGrid.innerHTML = '<p style="color: var(--text-muted);">No se encontraron órdenes de trabajo para este filtro.</p>';
                    return;
                }

                otGrid.innerHTML = '';
                filteredOts.forEach(ot => {
                    const isPending = ot.estado === 'Pendiente';
                    const isInProgress = ot.estado === 'En Proceso';
                    const isDone = ot.estado === 'Resuelta';

                    let statusLabel = 'Pendiente';
                    let statusClass = 'status-open';
                    let assignBtn = '';

                    if (isInProgress) {
                        statusLabel = 'En Proceso';
                        statusClass = 'status-progress';
                        assignBtn = `<span style="font-size:0.8rem; color: var(--text-muted);">Asignado a: <strong>${ot.tecnico_nombre}</strong></span>`;
                    } else if (isPending) {
                        assignBtn = `<button class="btn-primary btn-assign" data-ot-id="${ot.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">Asignar Técnico</button>`;
                    } else if (isDone) {
                        statusLabel = 'Resuelta';
                        statusClass = 'status-done';
                        assignBtn = `<span style="font-size:0.8rem; color: var(--success);">✓ Resuelta por ${ot.tecnico_nombre}</span>`;
                    }

                    let checklistBtn = '';
                    if (isDone && ot.plantilla_id) {
                        checklistBtn = `
                            <div style="margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; text-align: left;">
                                <button class="btn-view-checklist" data-ot-id="${ot.id}" style="background: transparent; border: none; color: var(--accent-color); padding: 0; font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: underline;">
                                    Ver Checklist de Inspección
                                </button>
                                <div id="checklist-results-${ot.id}" style="display: none; margin-top: 0.5rem; background: rgba(0,0,0,0.15); padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; border-left: 2px solid var(--success); flex-direction: column; gap: 0.35rem;">
                                    Cargando resultados...
                                </div>
                            </div>
                        `;
                    }

                    const card = document.createElement('div');
                    card.className = `entity-card priority-${ot.prioridad.toLowerCase()}`;
                    card.innerHTML = `
                        <div class="card-tag ${statusClass}">${statusLabel}</div>
                        <h4 class="entity-title">#OT-${ot.id} - ${ot.tipo}</h4>
                        <div class="entity-subtitle">${ot.planta_nombre} / ${ot.edificio_nombre} ${ot.ubicacion_nombre ? '/ ' + ot.ubicacion_nombre : ''}</div>
                        <p style="font-size:0.85rem; background:rgba(0,0,0,0.1); padding:0.5rem; border-radius:6px; margin-bottom:0.75rem; color:#cbd5e1;">${ot.descripcion}</p>
                        ${checklistBtn}
                        <div class="entity-meta">
                            <div class="meta-row">
                                <span class="meta-icon">👤</span>
                                <span>Reportado por: ${ot.reportado_por || 'Sistema'}</span>
                            </div>
                            <div class="meta-row" style="margin-top: 0.4rem; justify-content: space-between; align-items: center;">
                                ${assignBtn}
                                <span style="font-size:0.75rem; color: var(--text-muted);">${new Date(ot.fecha_creacion).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `;
                    otGrid.appendChild(card);

                    // Add Assign Technician Button Handler
                    const btn = card.querySelector('.btn-assign');
                    if (btn) {
                        btn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            openAssignModalDialog(ot.id);
                        });
                    }
                });

                // Attach event listeners for checklist toggles
                document.querySelectorAll('.btn-view-checklist').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const otId = btn.getAttribute('data-ot-id');
                        const container = document.getElementById(`checklist-results-${otId}`);
                        const isVisible = container.style.display === 'flex' || container.style.display === 'block';
                        
                        if (isVisible) {
                            container.style.display = 'none';
                            btn.textContent = 'Ver Checklist de Inspección';
                        } else {
                            container.style.display = 'flex';
                            container.style.flexDirection = 'column';
                            container.innerHTML = '<span style="color:var(--text-muted);">Cargando...</span>';
                            btn.textContent = 'Ocultar Checklist';
                            
                            fetch(`/api/ordenes/${otId}/respuestas`)
                                .then(res => res.json())
                                .then(respuestas => {
                                    if (respuestas.length === 0) {
                                        container.innerHTML = '<span style="color:var(--text-muted);">Sin respuestas registradas.</span>';
                                        return;
                                    }
                                    container.innerHTML = '';
                                    respuestas.forEach(r => {
                                        let valStr = '';
                                        if (r.tipo_respuesta === 'booleano') {
                                            valStr = r.valor_booleano ? 
                                                '<span style="color: var(--success); font-weight: 600;">Pasa (OK)</span>' : 
                                                '<span style="color: var(--danger); font-weight: 600;">Falla (No OK)</span>';
                                        } else if (r.tipo_respuesta === 'numerico') {
                                            valStr = `<strong style="color:var(--accent-color);">${r.valor_numerico}</strong> <span style="font-size:0.75rem; color:var(--text-muted);">${r.unidad_medida || ''}</span>`;
                                        } else {
                                            valStr = `<span style="color:#cbd5e1;">${r.valor_texto || ''}</span>`;
                                        }
                                        
                                        container.innerHTML += `
                                            <div style="border-bottom:1px solid rgba(255,255,255,0.03); padding-bottom:0.3rem; margin-bottom:0.3rem; font-size:0.8rem;">
                                                <div style="font-weight: 600; color: #94a3b8; font-size: 0.78rem;">${r.texto_pregunta}</div>
                                                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.15rem;">
                                                    <div>${valStr}</div>
                                                    ${r.observacion ? `<span style="font-size:0.75rem; color:var(--warning); font-style:italic;">"${r.observacion}"</span>` : ''}
                                                </div>
                                            </div>
                                        `;
                                    });
                                })
                                .catch(err => {
                                    container.innerHTML = `<span style="color:var(--danger);">Error: ${err.message}</span>`;
                                });
                        }
                    });
                });
            })
            .catch(err => console.error('Error al cargar OTs:', err));
    }

    filterOtState.addEventListener('change', loadWorkOrders);

    // --- 5. LOAD ASSETS ---
    function loadAssets() {
        if (!selectedUbicacionId) {
            activoGrid.innerHTML = '<p style="color: var(--text-muted);">Selecciona una ubicación específica a la izquierda para ver sus activos.</p>';
            return;
        }

        activoGrid.innerHTML = '<p style="color: var(--text-muted);">Cargando activos...</p>';

        fetch(`/api/activos?ubicacion_id=${selectedUbicacionId}`)
            .then(res => res.json())
            .then(activos => {
                if (activos.length === 0) {
                    activoGrid.innerHTML = '<p style="color: var(--text-muted);">No hay activos registrados en esta ubicación. ¡Crea uno nuevo usando el botón superior!</p>';
                    return;
                }

                activoGrid.innerHTML = '';
                activos.forEach(a => {
                    const isOk = a.estado === 'Operativo';
                    const card = document.createElement('div');
                    card.className = `entity-card status-${isOk ? 'ok' : 'issue'}`;
                    card.innerHTML = `
                        <h4 class="entity-title" style="margin-bottom:0.25rem;">${a.nombre}</h4>
                        <div class="entity-subtitle" style="margin-bottom:0.75rem;">${a.tipo}</div>
                        <div class="entity-meta">
                            <div class="meta-row">
                                <span>Marca/Mod: <strong>${a.marca || 'S/M'} / ${a.modelo || 'S/M'}</strong></span>
                            </div>
                            <div class="meta-row" style="justify-content: space-between; margin-top: 0.5rem;">
                                <span class="status-badge ${isOk ? 'status-ok' : 'status-issue'}">${a.estado}</span>
                                <span style="font-size: 0.8rem; color: var(--accent-color); font-weight: 500;">Ficha &gt;</span>
                            </div>
                        </div>
                    `;
                    activoGrid.appendChild(card);

                    card.addEventListener('click', () => {
                        openAssetDrawer(a.id);
                    });
                });
            })
            .catch(err => console.error('Error al cargar activos:', err));
    }

    // --- 6. DRAWER (FICHA TÉCNICA Y DESPIECE) ---
    function openAssetDrawer(activoId) {
        selectedActivoId = activoId;
        
        fetch(`/api/activos/${activoId}`)
            .then(res => res.json())
            .then(data => {
                drawerAssetName.textContent = data.nombre;
                drawerAssetMarca.textContent = data.marca || 'Sin Marca';
                drawerAssetModelo.textContent = data.modelo || 'Sin Modelo';
                drawerAssetSerie.textContent = data.numero_serie || 'S/N';
                drawerAssetEstado.textContent = data.estado;
                
                // Color code state
                drawerAssetEstado.className = 'status-badge ' + (data.estado === 'Operativo' ? 'status-ok' : 'status-issue');
                
                drawerAssetPlanta.textContent = data.planta_nombre || 'N/A';
                drawerAssetEdificio.textContent = data.edificio_nombre || 'N/A';
                drawerAssetUbicacion.textContent = data.ubicacion_nombre || 'N/A';
                
                // Render Components (Despiece)
                drawerComponentList.innerHTML = '';
                if (data.componentes.length === 0) {
                    drawerComponentList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">No se ha registrado despiece de partes para este activo.</p>';
                } else {
                    data.componentes.forEach(c => {
                        drawerComponentList.innerHTML += `
                            <div class="component-item">
                                <div class="component-info">
                                    <h4>${c.nombre}</h4>
                                    <p>${c.marca || 'S/M'} - ${c.modelo || 'S/M'} ${c.numero_serie ? ' / Serie: ' + c.numero_serie : ''}</p>
                                </div>
                                <span class="status-badge ${c.estado === 'Operativo' ? 'status-ok' : 'status-issue'}">${c.estado}</span>
                            </div>
                        `;
                    });
                }
                
                // Render OT History
                drawerHistoryList.innerHTML = '';
                if (data.ordenes_trabajo.length === 0) {
                    drawerHistoryList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">Sin intervenciones registradas.</p>';
                } else {
                    data.ordenes_trabajo.forEach(ot => {
                        drawerHistoryList.innerHTML += `
                            <div class="component-item" style="flex-direction: column; align-items: flex-start; gap: 0.25rem;">
                                <div style="display:flex; justify-content:space-between; width:100%;">
                                    <span style="font-weight: 600; font-size:0.85rem; color:var(--accent-color);">#OT-${ot.id}</span>
                                    <span style="font-size:0.75rem; color:var(--text-muted);">${new Date(ot.fecha_creacion).toLocaleDateString()}</span>
                                </div>
                                <p style="font-size:0.8rem; color:#cbd5e1;">${ot.descripcion}</p>
                                ${ot.comentarios_tecnicos ? `<p style="font-size:0.75rem; color:var(--success); margin-top:0.25rem;"><strong>Comentarios:</strong> ${ot.comentarios_tecnicos}</p>` : ''}
                            </div>
                        `;
                    });
                }
                
                assetDrawer.classList.add('open');
            })
            .catch(err => console.error(err));
    }

    closeDrawer.addEventListener('click', () => {
        assetDrawer.classList.remove('open');
    });

    // --- 7. LOAD TECHNICIANS FOR SELECTS ---
    function loadTechniciansForAssign() {
        fetch('/api/tecnicos')
            .then(res => res.json())
            .then(tecnicos => {
                techniciansList = tecnicos;
                assignSelectTecnico.innerHTML = '<option value="">-- Selecciona Técnico --</option>';
                tecnicos.forEach(t => {
                    assignSelectTecnico.innerHTML += `<option value="${t.id}">${t.nombre} (${t.especialidad})</option>`;
                });
            })
            .catch(err => console.error(err));
    }

    // --- 8. ASSIGN TECHNICIAN MODAL ACTIONS ---
    function openAssignModalDialog(otId) {
        assignOtId.value = otId;
        assignModal.style.display = 'flex';
    }

    closeAssignModal.addEventListener('click', () => {
        assignModal.style.display = 'none';
    });

    assignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otId = assignOtId.value;
        const techId = parseInt(assignSelectTecnico.value);

        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tecnico_id: techId,
                estado: 'En Proceso' // Al asignar, pasa a En Proceso
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al asignar técnico');
            assignModal.style.display = 'none';
            loadKPIs();
            loadWorkOrders();
        })
        .catch(err => alert(err.message));
    });

    // --- 9. MANUAL OT CREATION MODAL ---
    btnCreateOt.addEventListener('click', () => {
        // Load Plants in form dropdown
        fetch('/api/plantas')
            .then(res => res.json())
            .then(plantas => {
                const otPlanta = document.getElementById('ot-select-planta');
                otPlanta.innerHTML = '<option value="">-- Selecciona Planta --</option>';
                plantas.forEach(p => {
                    otPlanta.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
                });
                
                // Clear and disable downstream selectors
                document.getElementById('ot-select-edificio').innerHTML = '<option value="">Selecciona planta...</option>';
                document.getElementById('ot-select-edificio').disabled = true;
                document.getElementById('ot-select-ubicacion').innerHTML = '<option value="">Selecciona edificio...</option>';
                document.getElementById('ot-select-ubicacion').disabled = true;
                document.getElementById('ot-select-activo').innerHTML = '<option value="">Selecciona ubicación...</option>';
                document.getElementById('ot-select-activo').disabled = true;
                
                // Load technicians in assignment dropdown
                const otTecnico = document.getElementById('ot-tecnico');
                otTecnico.innerHTML = '<option value="">No Asignado</option>';
                techniciansList.forEach(t => {
                    otTecnico.innerHTML += `<option value="${t.id}">${t.nombre} (${t.especialidad})</option>`;
                });

                // Load checklists in template selector dropdown
                fetch('/api/plantillas')
                    .then(res => res.json())
                    .then(plantillas => {
                        const otSelectPlantilla = document.getElementById('ot-select-plantilla');
                        otSelectPlantilla.innerHTML = '<option value="">-- Sin plantilla / Pauta estándar --</option>';
                        plantillas.forEach(p => {
                            otSelectPlantilla.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
                        });
                    })
                    .catch(err => console.error('Error al cargar plantillas:', err));
                
                otModal.style.display = 'flex';
            });
    });

    closeOtModal.addEventListener('click', () => {
        otModal.style.display = 'none';
    });

    // Dynamically update building, location and asset dropdowns in OT Form
    document.getElementById('ot-select-planta').addEventListener('change', (e) => {
        const plantaId = e.target.value;
        const bSelect = document.getElementById('ot-select-edificio');
        const uSelect = document.getElementById('ot-select-ubicacion');
        const aSelect = document.getElementById('ot-select-activo');
        
        bSelect.innerHTML = '<option value="">Selecciona edificio...</option>';
        bSelect.disabled = true;
        uSelect.innerHTML = '<option value="">Selecciona edificio...</option>';
        uSelect.disabled = true;
        aSelect.innerHTML = '<option value="">Selecciona ubicación...</option>';
        aSelect.disabled = true;

        if (!plantaId) return;

        fetch(`/api/plantas/${plantaId}/edificios`)
            .then(res => res.json())
            .then(edificios => {
                bSelect.disabled = false;
                bSelect.innerHTML = '<option value="">-- Selecciona --</option>';
                edificios.forEach(b => {
                    bSelect.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
                });
            });
    });

    document.getElementById('ot-select-edificio').addEventListener('change', (e) => {
        const edificioId = e.target.value;
        const uSelect = document.getElementById('ot-select-ubicacion');
        const aSelect = document.getElementById('ot-select-activo');

        uSelect.innerHTML = '<option value="">Selecciona ubicación...</option>';
        uSelect.disabled = true;
        aSelect.innerHTML = '<option value="">Selecciona ubicación...</option>';
        aSelect.disabled = true;

        if (!edificioId) return;

        fetch(`/api/edificios/${edificioId}/ubicaciones`)
            .then(res => res.json())
            .then(ubicaciones => {
                uSelect.disabled = false;
                uSelect.innerHTML = '<option value="">-- Selecciona --</option>';
                ubicaciones.forEach(u => {
                    uSelect.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
                });
            });
    });

    document.getElementById('ot-select-ubicacion').addEventListener('change', (e) => {
        const ubicacionId = e.target.value;
        const aSelect = document.getElementById('ot-select-activo');

        aSelect.innerHTML = '<option value="">Selecciona activo...</option>';
        aSelect.disabled = true;

        if (!ubicacionId) return;

        fetch(`/api/activos?ubicacion_id=${ubicacionId}`)
            .then(res => res.json())
            .then(activos => {
                aSelect.disabled = false;
                aSelect.innerHTML = '<option value="">-- Selecciona Activo (Opcional) --</option>';
                activos.forEach(a => {
                    aSelect.innerHTML += `<option value="${a.id}">${a.nombre}</option>`;
                });
            });
    });

    otForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const plantaId = parseInt(document.getElementById('ot-select-planta').value);
        const edificioId = parseInt(document.getElementById('ot-select-edificio').value);
        const ubicacionId = parseInt(document.getElementById('ot-select-ubicacion').value);
        const activoId = document.getElementById('ot-select-activo').value ? parseInt(document.getElementById('ot-select-activo').value) : null;
        
        const tipo = document.getElementById('ot-tipo').value;
        const prioridad = document.getElementById('ot-prioridad').value;
        const descripcion = document.getElementById('ot-descripcion').value.trim();
        const tecnicoId = document.getElementById('ot-tecnico').value ? parseInt(document.getElementById('ot-tecnico').value) : null;
        const plantillaIdVal = document.getElementById('ot-select-plantilla').value;
        const plantillaId = plantillaIdVal ? parseInt(plantillaIdVal) : null;

        const payload = {
            descripcion,
            tipo,
            estado: tecnicoId ? 'En Proceso' : 'Pendiente',
            prioridad,
            reportado_por: 'Administración',
            planta_id: plantaId,
            edificio_id: edificioId,
            ubicacion_id: ubicacionId,
            activo_id: activoId,
            tecnico_id: tecnicoId,
            plantilla_id: plantillaId
        };

        fetch('/api/ordenes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al crear orden de trabajo');
            return res.json();
        })
        .then(data => {
            otModal.style.display = 'none';
            otForm.reset();
            loadKPIs();
            loadWorkOrders();
        })
        .catch(err => alert(err.message));
    });

    // --- 10. REGISTER NEW ASSET MODAL ---
    btnCreateActivo.addEventListener('click', () => {
        if (!selectedUbicacionId) return;
        document.getElementById('asset-location-id').value = selectedUbicacionId;
        assetModal.style.display = 'flex';
    });

    closeAssetModal.addEventListener('click', () => {
        assetModal.style.display = 'none';
    });

    assetForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('asset-name').value.trim();
        const tipo = document.getElementById('asset-tipo').value;
        const marca = document.getElementById('asset-marca').value.trim() || null;
        const modelo = document.getElementById('asset-modelo').value.trim() || null;
        const serie = document.getElementById('asset-serie').value.trim() || null;
        const uId = parseInt(document.getElementById('asset-location-id').value);

        const payload = {
            nombre: name,
            tipo,
            marca,
            modelo,
            numero_serie: serie,
            estado: 'Operativo',
            ubicacion_id: uId
        };

        fetch('/api/activos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al registrar activo');
            return res.json();
        })
        .then(data => {
            assetModal.style.display = 'none';
            assetForm.reset();
            loadAssets();
            loadKPIs();
        })
        .catch(err => alert(err.message));
    });

    // --- 11. ADD COMPONENT (DESPIECE) MODAL ---
    btnAddComponent.addEventListener('click', () => {
        if (!selectedActivoId) return;
        document.getElementById('component-asset-id').value = selectedActivoId;
        componentModal.style.display = 'flex';
    });

    closeComponentModal.addEventListener('click', () => {
        componentModal.style.display = 'none';
    });

    componentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('component-name').value.trim();
        const marca = document.getElementById('component-marca').value.trim() || null;
        const modelo = document.getElementById('component-modelo').value.trim() || null;
        const nParte = document.getElementById('component-nparte').value.trim() || null;
        const activeId = parseInt(document.getElementById('component-asset-id').value);

        const payload = {
            nombre: name,
            marca,
            modelo,
            numero_serie: nParte,
            estado: 'Operativo',
            activo_id: activeId
        };

        fetch('/api/componentes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al registrar componente');
            return res.json();
        })
        .then(data => {
            componentModal.style.display = 'none';
            componentForm.reset();
            // Refresh drawer contents
            openAssetDrawer(activeId);
        })
        .catch(err => alert(err.message));
    });

    // --- 12. DIRECT HIERARCHY LOCATION CREATION MODAL ---
    function openLocationModalDirect(edificioId) {
        // We reuse the location addition workflow
        // We can just open a prompt or prompt dynamically to save file space and time
        const name = prompt("Introduce el nombre de la nueva ubicación / sala:");
        if (!name || name.trim() === "") return;

        fetch('/api/ubicaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: name.trim(),
                edificio_id: edificioId
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al guardar la ubicación');
            return res.json();
        })
        .then(data => {
            alert(`Ubicación "${data.nombre}" creada con éxito.`);
            // Reload parent building's location tree
            const locContainer = document.getElementById(`building-locations-${edificioId}`);
            loadLocations(edificioId, locContainer);
        })
        .catch(err => alert(err.message));
    }

    // --- EXCEL EXPORT & IMPORT EVENTS ---
    const btnExportOtsExcel = document.getElementById('btn-export-ots-excel');
    const btnExportActivosExcel = document.getElementById('btn-export-activos-excel');
    const excelImportFile = document.getElementById('excel-import-file');

    if (btnExportOtsExcel) {
        btnExportOtsExcel.addEventListener('click', () => {
            window.open('/api/excel/exportar/ordenes', '_blank');
        });
    }

    if (btnExportActivosExcel) {
        btnExportActivosExcel.addEventListener('click', () => {
            window.open('/api/excel/exportar/activos', '_blank');
        });
    }

    if (excelImportFile) {
        excelImportFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('file', file);
            
            const originalLabel = document.querySelector('label[for="excel-import-file"]').innerHTML;
            document.querySelector('label[for="excel-import-file"]').innerHTML = '<span>⏳</span> Subiendo...';
            
            fetch('/api/excel/importar/activos', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) return res.json().then(data => { throw new Error(data.detail || 'Error al importar Excel') });
                return res.json();
            })
            .then(data => {
                alert(`¡Éxito! ${data.message}`);
                excelImportFile.value = '';
                loadKPIs();
                loadHierarchy();
                loadWorkOrders();
                loadAssets();
            })
            .catch(err => {
                alert(`Error de Importación: ${err.message}`);
                excelImportFile.value = '';
            })
            .finally(() => {
                document.querySelector('label[for="excel-import-file"]').innerHTML = originalLabel;
            });
        });
    }

    // --- INITIALIZE APPLICATION ---
    loadKPIs();
    loadHierarchy();
    loadWorkOrders();
    loadTechniciansForAssign();
});
