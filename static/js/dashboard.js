document.addEventListener('DOMContentLoaded', () => {
    // State Variables
    let selectedPlantaId = null;
    let selectedEdificioId = null;
    let selectedUbicacionId = null;
    let selectedActivoId = null;
    let activeTab = 'ots'; // 'ots', 'activos', or 'ubicaciones'
    let techniciansList = [];
    let loadedWorkOrdersList = [];
    let currentSelectedPlantName = null;
    let allLoadedOts = [];

    // DOM Elements
    const kpiTotalOts = document.getElementById('kpi-total-ots');
    const kpiCreadas = document.getElementById('kpi-creadas');
    const kpiAsignadas = document.getElementById('kpi-assigned') || document.getElementById('kpi-asignadas');
    const kpiProgramadas = document.getElementById('kpi-programadas');
    const kpiRealizadas = document.getElementById('kpi-realizadas');
    const kpiActivos = document.getElementById('kpi-activos');
    
    const cardKpiTotalOts = document.getElementById('card-kpi-total-ots');
    const cardKpiCreadas = document.getElementById('card-kpi-creadas');
    const cardKpiAsignadas = document.getElementById('card-kpi-asignadas');
    const cardKpiProgramadas = document.getElementById('card-kpi-programadas');
    const cardKpiRealizadas = document.getElementById('card-kpi-realizadas');
    const cardKpiActivos = document.getElementById('card-kpi-activos');
    
    const hierarchyTree = document.getElementById('hierarchy-tree');
    
    const tabBtnOts = document.getElementById('tab-btn-ots');
    const tabBtnActivos = document.getElementById('tab-btn-activos');
    const tabBtnUbicaciones = document.getElementById('tab-btn-ubicaciones');
    const tabOts = document.getElementById('tab-ots');
    const tabActivos = document.getElementById('tab-activos');
    const tabUbicaciones = document.getElementById('tab-ubicaciones');
    
    const plantSummaryView = document.getElementById('plant-summary-view');
    const plantDetailView = document.getElementById('plant-detail-view');
    const plantOtGrid = document.getElementById('plant-ot-grid');
    const btnBackToPlants = document.getElementById('btn-back-to-plants');
    const plantDetailTitle = document.getElementById('plant-detail-title');

    // Plant count selector mappings
    const plantCounts = {
        'Santa Adela': {
            corrective: document.getElementById('plant-corrective-santa-adela'),
            preventive: document.getElementById('plant-preventive-santa-adela'),
            total: document.getElementById('plant-total-santa-adela')
        },
        'La Divisa': {
            corrective: document.getElementById('plant-corrective-la-divisa'),
            preventive: document.getElementById('plant-preventive-la-divisa'),
            total: document.getElementById('plant-total-la-divisa')
        },
        'Sta. A. 10.000': {
            corrective: document.getElementById('plant-corrective-sta-a-10000'),
            preventive: document.getElementById('plant-preventive-sta-a-10000'),
            total: document.getElementById('plant-total-sta-a-10000')
        }
    };
    
    const otGrid = document.getElementById('ot-grid');
    const filterOtState = document.getElementById('filter-ot-state');
    const btnCreateOt = document.getElementById('btn-create-ot');
    
    const activoGrid = document.getElementById('activo-grid');
    const filterActivoState = document.getElementById('filter-activo-state');
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

    // Complete OT Modal
    const otCompleteModal = document.getElementById('ot-complete-modal');
    const otCompleteForm = document.getElementById('ot-complete-form');
    const closeOtCompleteModal = document.getElementById('close-ot-complete-modal');
    const otCompleteId = document.getElementById('ot-complete-id');
    const otCompleteComments = document.getElementById('ot-complete-comments');

    // Edit Modals (Asset and Component lifecycle)
    const assetEditModal = document.getElementById('asset-edit-modal');
    const assetEditForm = document.getElementById('asset-edit-form');
    const closeAssetEditModal = document.getElementById('close-asset-edit-modal');
    const btnEditAsset = document.getElementById('btn-edit-asset');
    
    const componentEditModal = document.getElementById('component-edit-modal');
    const componentEditForm = document.getElementById('component-edit-form');
    const closeComponentEditModal = document.getElementById('close-component-edit-modal');

    let currentAssetData = null;

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
    const btnCreateOtForAsset = document.getElementById('btn-create-ot-for-asset');

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
        tabBtnUbicaciones.style.borderBottomColor = 'transparent';
        tabOts.style.display = 'block';
        tabActivos.style.display = 'none';
        tabUbicaciones.style.display = 'none';
        loadWorkOrders();
    });

    tabBtnActivos.addEventListener('click', () => {
        activeTab = 'activos';
        tabBtnActivos.style.borderBottomColor = 'var(--accent-color)';
        tabBtnOts.style.borderBottomColor = 'transparent';
        tabBtnUbicaciones.style.borderBottomColor = 'transparent';
        tabActivos.style.display = 'block';
        tabOts.style.display = 'none';
        tabUbicaciones.style.display = 'none';
        loadAssets();
    });

    tabBtnUbicaciones.addEventListener('click', () => {
        activeTab = 'ubicaciones';
        tabBtnUbicaciones.style.borderBottomColor = 'var(--accent-color)';
        tabBtnOts.style.borderBottomColor = 'transparent';
        tabBtnActivos.style.borderBottomColor = 'transparent';
        tabUbicaciones.style.display = 'block';
        tabOts.style.display = 'none';
        tabActivos.style.display = 'none';
        
        // Reset sub-view to plants summary by default
        plantSummaryView.style.display = 'block';
        plantDetailView.style.display = 'none';
        currentSelectedPlantName = null;
        
        loadPlantSummaries();
    });

    // --- 1.5. KPI INTERACTION ---
    if (cardKpiTotalOts) {
        cardKpiTotalOts.addEventListener('click', () => {
            filterOtState.value = '';
            filterOtState.dispatchEvent(new Event('change'));
            tabBtnOts.click();
        });
    }

    if (cardKpiCreadas) {
        cardKpiCreadas.addEventListener('click', () => {
            filterOtState.value = 'CREADA';
            filterOtState.dispatchEvent(new Event('change'));
            tabBtnOts.click();
        });
    }

    if (cardKpiAsignadas) {
        cardKpiAsignadas.addEventListener('click', () => {
            filterOtState.value = 'ASIGNADA';
            filterOtState.dispatchEvent(new Event('change'));
            tabBtnOts.click();
        });
    }

    if (cardKpiProgramadas) {
        cardKpiProgramadas.addEventListener('click', () => {
            filterOtState.value = 'PROGRAMADA';
            filterOtState.dispatchEvent(new Event('change'));
            tabBtnOts.click();
        });
    }

    if (cardKpiRealizadas) {
        cardKpiRealizadas.addEventListener('click', () => {
            filterOtState.value = 'REALIZADA';
            filterOtState.dispatchEvent(new Event('change'));
            tabBtnOts.click();
        });
    }

    if (cardKpiActivos) {
        cardKpiActivos.addEventListener('click', () => {
            filterActivoState.value = 'Operativo';
            filterActivoState.dispatchEvent(new Event('change'));
            tabBtnActivos.click();
        });
    }

    // --- 2. LOAD KPIS ---
    function loadKPIs() {
        fetch('/api/dashboard/stats')
            .then(res => res.json())
            .then(data => {
                const kpis = data.kpis;
                if (kpiTotalOts) kpiTotalOts.textContent = kpis.total_ots;
                if (kpiCreadas) kpiCreadas.textContent = kpis.creadas;
                if (kpiAsignadas) kpiAsignadas.textContent = kpis.asignadas;
                if (kpiProgramadas) kpiProgramadas.textContent = kpis.programadas;
                if (kpiRealizadas) kpiRealizadas.textContent = kpis.realizadas;
                if (kpiActivos) kpiActivos.innerHTML = `${kpis.activos_operativos} <span style="font-size: 1rem; color: var(--text-muted);">/ ${kpis.total_activos}</span>`;
            })
            .catch(err => console.error('Error al cargar KPIs:', err));
    }

    // --- 3. LOAD HIERARCHY TREE & SEARCH ---
    let locationsSearchList = [];

    function preloadSearchList() {
        fetch('/api/search/locations')
            .then(res => res.json())
            .then(data => {
                locationsSearchList = data;
            })
            .catch(err => console.error('Error preloading search list:', err));
    }
    preloadSearchList();

    function getSelectedPlantaNombre() {
        if (!selectedPlantaId || locationsSearchList.length === 0) return null;
        const found = locationsSearchList.find(u => u.planta_id === selectedPlantaId);
        return found ? found.planta_nombre : null;
    }

    function updateSearchPlantaIndicator() {
        const indicator = document.getElementById('search-planta-indicator');
        if (!indicator) return;

        if (selectedPlantaId) {
            const plantaNombre = getSelectedPlantaNombre() || 'Planta Seleccionada';
            indicator.innerHTML = `📍 Filtrando en: <strong>${plantaNombre}</strong><br><span id="btn-clear-search-planta" style="color: var(--accent-color); cursor: pointer; text-decoration: underline; font-size: 0.65rem;">Buscar en todas las plantas</span>`;
            indicator.style.display = 'block';

            const btnClear = document.getElementById('btn-clear-search-planta');
            if (btnClear) {
                btnClear.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedPlantaId = null;
                    selectedEdificioId = null;
                    selectedUbicacionId = null;
                    
                    // Reset active styles
                    document.querySelectorAll('.hierarchy-header').forEach(h => h.classList.remove('active'));
                    document.querySelectorAll('.sub-item').forEach(s => s.classList.remove('active'));
                    currentLocationLabel.textContent = '📍 Selecciona una ubicación para ver sus detalles';
                    btnCreateActivo.disabled = true;

                    // Update indicator
                    updateSearchPlantaIndicator();

                    // Refresh main screen data
                    loadKPIs();
                    loadWorkOrders();
                    loadAssets();

                    // Re-trigger filtering
                    hierarchySearchInput.dispatchEvent(new Event('input'));
                });
            }
        } else {
            indicator.style.display = 'none';
            indicator.innerHTML = '';
        }
    }

    const hierarchySearchInput = document.getElementById('hierarchy-search');
    if (hierarchySearchInput) {
        hierarchySearchInput.addEventListener('input', () => {
            const query = hierarchySearchInput.value.trim().toLowerCase();
            
            // If empty, show full tree and hide indicator
            if (query.length === 0) {
                const indicator = document.getElementById('search-planta-indicator');
                if (indicator) indicator.style.display = 'none';
                loadHierarchy();
                return;
            }

            // Update the plant filter indicator UI
            updateSearchPlantaIndicator();

            const cleanQuery = query.replace(/[^a-z0-9]/g, '');
            
            let filtered = [];
            if (cleanQuery === '') {
                // Fallback to literal search if only symbols are typed (e.g. "[", "#")
                filtered = locationsSearchList.filter(u => {
                    if (selectedPlantaId && u.planta_id !== selectedPlantaId) {
                        return false;
                    }
                    return u.nombre.toLowerCase().includes(query) || 
                           u.planta_nombre.toLowerCase().includes(query) || 
                           u.edificio_nombre.toLowerCase().includes(query);
                });
            } else {
                filtered = locationsSearchList.filter(u => {
                    // Filter by plant context if selected
                    if (selectedPlantaId && u.planta_id !== selectedPlantaId) {
                        return false;
                    }

                    const cleanName = u.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanPlanta = u.planta_nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanEdificio = u.edificio_nombre.toLowerCase().replace(/[^a-z0-9]/g, '');

                    // Match location, plant, or building name
                    if (cleanName.includes(cleanQuery) || cleanPlanta.includes(cleanQuery) || cleanEdificio.includes(cleanQuery)) {
                        return true;
                    }

                    // Match asset names
                    if (u.activos && u.activos.some(act => act.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery))) {
                        return true;
                    }

                    return false;
                });
            }

            renderSearchResults(filtered);
        });
    }

    // --- Smart Location Search in OT Form ---
    const otSearchInput = document.getElementById('ot-search-location');
    const otSearchResults = document.getElementById('ot-search-location-results');

    if (otSearchInput && otSearchResults) {
        otSearchInput.addEventListener('input', () => {
            const query = otSearchInput.value.trim().toLowerCase();
            if (!query) {
                otSearchResults.style.display = 'none';
                otSearchResults.innerHTML = '';
                return;
            }

            const cleanQuery = query.replace(/[^a-z0-9]/g, '');
            let filtered = [];

            if (cleanQuery === '') {
                filtered = locationsSearchList.filter(u => {
                    return u.nombre.toLowerCase().includes(query) || 
                           u.planta_nombre.toLowerCase().includes(query) || 
                           u.edificio_nombre.toLowerCase().includes(query);
                });
            } else {
                filtered = locationsSearchList.filter(u => {
                    const cleanName = u.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanPlanta = u.planta_nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanEdificio = u.edificio_nombre.toLowerCase().replace(/[^a-z0-9]/g, '');

                    if (cleanName.includes(cleanQuery) || cleanPlanta.includes(cleanQuery) || cleanEdificio.includes(cleanQuery)) {
                        return true;
                    }

                    if (u.activos && u.activos.some(act => act.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery))) {
                        return true;
                    }
                    return false;
                });
            }

            // Render results
            if (filtered.length === 0) {
                otSearchResults.innerHTML = '<div style="padding: 0.5rem 1rem; color: var(--text-muted); font-size: 0.85rem;">No se encontraron ubicaciones</div>';
            } else {
                otSearchResults.innerHTML = '';
                filtered.slice(0, 10).forEach(u => {
                    const item = document.createElement('div');
                    item.className = 'search-result-dropdown-item';
                    
                    let matchingAsset = '';
                    if (query && u.activos) {
                        const foundAsset = u.activos.find(act => act.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery));
                        if (foundAsset) {
                            matchingAsset = `<div class="result-active-badge">⚡ Equipo coincidente: <strong>${foundAsset}</strong></div>`;
                        }
                    }

                    item.innerHTML = `
                        <div style="font-weight: 600; color: var(--text-main);">${u.nombre}</div>
                        <div class="result-path">📍 ${u.planta_nombre} &gt; ${u.edificio_nombre}</div>
                        ${matchingAsset}
                    `;
                    
                    item.addEventListener('click', () => {
                        let assetName = null;
                        if (query && u.activos) {
                            assetName = u.activos.find(act => act.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery));
                        }
                        
                        prefillOTFormLocationAndAsset(u.planta_id, u.edificio_id, u.id, assetName);
                        
                        otSearchInput.value = u.nombre;
                        otSearchResults.style.display = 'none';
                    });
                    otSearchResults.appendChild(item);
                });
            }
            otSearchResults.style.display = 'block';
        });

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!otSearchInput.contains(e.target) && !otSearchResults.contains(e.target)) {
                otSearchResults.style.display = 'none';
            }
        });
    }

    function prefillOTFormLocationAndAsset(plantaId, edificioId, ubicacionId, assetName = null) {
        const otPlanta = document.getElementById('ot-select-planta');
        const otEdificio = document.getElementById('ot-select-edificio');
        const otUbicacion = document.getElementById('ot-select-ubicacion');
        const otActivo = document.getElementById('ot-select-activo');

        otPlanta.value = plantaId;

        fetch(`/api/plantas/${plantaId}/edificios`)
            .then(res => res.json())
            .then(edificios => {
                otEdificio.disabled = false;
                otEdificio.innerHTML = '<option value="">-- Selecciona --</option>';
                edificios.forEach(b => {
                    otEdificio.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
                });
                otEdificio.value = edificioId;

                return fetch(`/api/edificios/${edificioId}/ubicaciones`);
            })
            .then(res => res.json())
            .then(ubicaciones => {
                otUbicacion.disabled = false;
                otUbicacion.innerHTML = '<option value="">-- Selecciona --</option>';
                ubicaciones.forEach(u => {
                    otUbicacion.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
                });
                otUbicacion.value = ubicacionId;

                return fetch(`/api/activos?ubicacion_id=${ubicacionId}`);
            })
            .then(res => res.json())
            .then(activos => {
                otActivo.disabled = false;
                otActivo.innerHTML = '<option value="">-- Selecciona Activo (Opcional) --</option>';
                const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo');
                activeActivos.forEach(a => {
                    otActivo.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
                });
                
                if (assetName) {
                    const matchedAsset = activeActivos.find(a => a.nombre === assetName);
                    if (matchedAsset) {
                        otActivo.value = matchedAsset.id;
                    } else {
                        otActivo.value = '';
                    }
                } else {
                    otActivo.value = '';
                }
            })
            .catch(err => console.error('Error pre-filling dropdowns:', err));
    }

    function renderSearchResults(results) {
        hierarchyTree.innerHTML = '';
        if (results.length === 0) {
            hierarchyTree.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.75rem; text-align: center;">No se encontraron ubicaciones</p>';
            return;
        }

        results.forEach(u => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.15rem;">
                    🏢 ${u.planta_nombre} &gt; 📦 ${u.edificio_nombre}
                </div>
                <div style="font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 0.35rem;">
                    📍 ${u.nombre}
                </div>
                ${u.activos.length > 0 ? `
                    <div style="font-size: 0.75rem; color: var(--accent-color); margin-top: 0.2rem; display: flex; align-items: center; gap: 0.25rem;">
                        <span>⚡</span> <span style="font-style: italic;">${u.activos.join(', ')}</span>
                    </div>
                ` : ''}
            `;

            if (selectedUbicacionId === u.id) {
                item.classList.add('active');
            }

            item.addEventListener('click', () => {
                selectedPlantaId = u.planta_id;
                selectedEdificioId = u.edificio_id;
                selectedUbicacionId = u.id;

                document.querySelectorAll('.search-result-item').forEach(s => s.classList.remove('active'));
                item.classList.add('active');

                currentLocationLabel.textContent = `📍 Ubicación seleccionada: ${u.nombre}`;
                btnCreateActivo.disabled = false;

                loadAssets();
                loadWorkOrders();
            });

            hierarchyTree.appendChild(item);
        });
    }

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
                        
                        if (!isVisible) {
                            // Close other plants visually
                            document.querySelectorAll('.hierarchy-content').forEach(c => {
                                c.style.display = 'none';
                            });
                            document.querySelectorAll('.hierarchy-header .arrow').forEach(a => {
                                a.textContent = '▶';
                            });
                            
                            // Open this plant
                            content.style.display = 'block';
                            header.querySelector('.arrow').textContent = '▼';
                            loadBuildings(p.id, content, p.nombre);
                        } else {
                            // Close this plant
                            content.style.display = 'none';
                            header.querySelector('.arrow').textContent = '▶';
                        }
                        
                        selectedPlantaId = p.id;
                        selectedEdificioId = null;
                        selectedUbicacionId = null;
                        
                        // Remove active styling from all, add to this
                        document.querySelectorAll('.hierarchy-header').forEach(h => h.classList.remove('active'));
                        document.querySelectorAll('.sub-item').forEach(s => s.classList.remove('active'));
                        header.classList.add('active');
                        
                        // Update views
                        loadWorkOrders();
                        loadAssets();
                    });
                });
            })
            .catch(err => console.error('Error al cargar jerarquía:', err));
    }

    function loadBuildings(plantaId, containerElement, plantaNombre) {
        fetch(`/api/plantas/${plantaId}/edificios`)
            .then(res => res.json())
            .then(edificios => {
                containerElement.innerHTML = '';
                edificios.forEach(e => {
                    const activeOtsCount = allLoadedOts.filter(ot => 
                        ot.edificio_nombre === e.nombre && 
                        ot.planta_nombre === plantaNombre && 
                        ot.estado !== 'REALIZADA' && 
                        ot.estado !== 'Resuelta' &&
                        ot.estado !== 'Cancelada'
                    ).length;

                    const buildingItem = document.createElement('div');
                    buildingItem.className = 'building-item';
                    buildingItem.style.margin = '0.4rem 0';
                    buildingItem.innerHTML = `
                        <div class="sub-item" data-edificio-id="${e.id}" data-edificio-nombre="${e.nombre}" style="font-weight: 500; cursor: pointer; padding: 0.4rem 0.5rem; display: flex; justify-content: space-between;">
                            <span>📦 ${e.nombre} <span class="building-ot-count" data-building-name="${e.nombre}" data-plant-name="${plantaNombre}" style="font-weight: normal; color: var(--text-muted); font-size: 0.8rem; margin-left: 0.25rem;">(${activeOtsCount})</span></span>
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
                    locItem.setAttribute('data-ubicacion-nombre', u.nombre);
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

    // --- 3.5. RENDER WORK ORDERS ---
    function renderWorkOrders(filteredOts, targetGrid) {
        targetGrid.innerHTML = '';
        if (filteredOts.length === 0) {
            targetGrid.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">No se encontraron órdenes de trabajo.</p>';
            return;
        }

        filteredOts.forEach(ot => {
            const isCreated = ot.estado === 'CREADA';
            const isAssigned = ot.estado === 'ASIGNADA';
            const isScheduled = ot.estado === 'PROGRAMADA';
            const isDone = ot.estado === 'REALIZADA' || ot.estado === 'Resuelta';

            let statusLabel = 'Creada';
            let statusClass = 'status-created';

            if (isDone) {
                statusLabel = 'Realizada';
                statusClass = 'status-done';
            } else if (ot.fecha_inicio) {
                if (ot.estado_ejecucion === 'PAUSADA' || ot.estado_ejecucion === 'DETENIDA') {
                    statusLabel = 'Pausada';
                    statusClass = 'status-scheduled';
                } else {
                    statusLabel = 'Iniciada';
                    statusClass = 'status-progress';
                }
            } else if (isScheduled) {
                statusLabel = 'Programada';
                statusClass = 'status-scheduled';
            } else if (isAssigned) {
                statusLabel = 'Asignada';
                statusClass = 'status-assigned';
            } else if (isCreated) {
                statusLabel = 'Creada';
                statusClass = 'status-created';
            } else {
                statusLabel = ot.estado;
                statusClass = 'status-created';
            }

            // Format scheduled date
            let progDateStr = 'Pendiente';
            let progColor = 'var(--text-muted)';
            if (ot.fecha_programada) {
                const pDate = new Date(ot.fecha_programada);
                progDateStr = pDate.toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                if (ot.fecha_programada.includes('T')) {
                    const timePart = ot.fecha_programada.substring(11, 16);
                    if (timePart !== '00:00') {
                        progDateStr += ` a las ${timePart}`;
                    }
                }
                progColor = 'var(--warning)';
            }

            // Format start date/time
            let startTimeFormatted = '';
            if (ot.fecha_inicio) {
                const sDate = new Date(ot.fecha_inicio);
                const day = String(sDate.getDate()).padStart(2, '0');
                const month = String(sDate.getMonth() + 1).padStart(2, '0');
                const hrs = String(sDate.getHours()).padStart(2, '0');
                const mins = String(sDate.getMinutes()).padStart(2, '0');
                startTimeFormatted = `${day}/${month} a las ${hrs}:${mins}`;
            }

            let completionDateStr = '';
            if (ot.fecha_resolucion) {
                const dateObj = new Date(ot.fecha_resolucion);
                completionDateStr = ` el ${dateObj.toLocaleDateString()}`;
            }

            // Build assign/reassign button
            let assignBtnHtml = '';
            if (!isDone) {
                if (ot.tecnico_nombre) {
                    assignBtnHtml = `<button class="btn-secondary btn-assign" data-ot-id="${ot.id}" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; margin-left: 0.5rem; cursor: pointer; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-color); line-height: 1;">Reasignar</button>`;
                } else {
                    assignBtnHtml = `<button class="btn-primary btn-assign" data-ot-id="${ot.id}" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; margin-left: 0.5rem; cursor: pointer; border-radius: 4px; border: 1px solid var(--primary-color); line-height: 1;">Asignar</button>`;
                }
            }

            // Build program/reprogram button
            let programBtnHtml = '';
            if (!isDone) {
                if (ot.fecha_programada) {
                    programBtnHtml = `<button class="btn-secondary btn-assign" data-ot-id="${ot.id}" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; margin-left: 0.5rem; cursor: pointer; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-color); line-height: 1;">Reprogramar</button>`;
                } else {
                    programBtnHtml = `<button class="btn-secondary btn-assign" data-ot-id="${ot.id}" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; margin-left: 0.5rem; cursor: pointer; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-color); line-height: 1;">Programar</button>`;
                }
            }

            // Build gestion HTML (with Iniciar button or start details + action buttons)
            let gestionContentHtml = '';
            if (isDone) {
                gestionContentHtml = `<span style="color: var(--success); font-weight: 500;">✓ Realizada${completionDateStr}</span>`;
                if (ot.fecha_inicio) {
                    gestionContentHtml += ` <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">(Iniciada: ${startTimeFormatted})</span>`;
                }
            } else {
                if (ot.fecha_inicio) {
                    if (ot.estado_ejecucion === 'PAUSADA' || ot.estado_ejecucion === 'DETENIDA') {
                        gestionContentHtml = `
                            <span style="color: var(--warning); font-weight: 500;">Pausada (Iniciada el ${startTimeFormatted})</span>
                            <button class="btn-resume" data-ot-id="${ot.id}" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; margin-left: 0.5rem; cursor: pointer; border-radius: 4px; background: var(--accent-color); color: white; border: none; line-height: 1;">Retomar</button>
                            <button class="btn-complete-direct" data-ot-id="${ot.id}" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; margin-left: 0.25rem; cursor: pointer; border-radius: 4px; background: var(--success); color: white; border: none; line-height: 1;">Terminar</button>
                        `;
                    } else {
                        gestionContentHtml = `
                            <span style="color: #38bdf8; font-weight: 500;">Iniciada el ${startTimeFormatted}</span>
                            <button class="btn-pause" data-ot-id="${ot.id}" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; margin-left: 0.5rem; cursor: pointer; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-color); line-height: 1;">Detener</button>
                            <button class="btn-complete-direct" data-ot-id="${ot.id}" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; margin-left: 0.25rem; cursor: pointer; border-radius: 4px; background: var(--success); color: white; border: none; line-height: 1;">Terminar</button>
                        `;
                    }
                } else {
                    gestionContentHtml = `<button class="btn-primary btn-start" data-ot-id="${ot.id}" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer; line-height: 1;">Iniciar</button>`;
                }
            }

            let checklistBtn = '';
            if (isDone && ot.plantilla_id) {
                checklistBtn = `
                    <div style="margin-top: 0.4rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.4rem; text-align: left;">
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
                <h4 class="entity-title" style="font-weight: bold;"><span style="font-weight: normal;">#OT-${ot.id}</span> - ${ot.tipo}</h4>
                <div class="entity-subtitle" style="font-weight: bold; color: var(--text-color); margin-bottom: 0.5rem;">${ot.planta_nombre} / ${ot.edificio_nombre} ${ot.ubicacion_nombre ? '/ ' + ot.ubicacion_nombre : ''}</div>
                <p style="font-size:0.85rem; background:rgba(0,0,0,0.1); padding:0.5rem; border-radius:6px; margin-bottom:0.4rem; color:#cbd5e1;">${ot.descripcion}</p>
                
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem; display: flex; align-items: center; flex-wrap: wrap;">
                    Asignado a: <strong style="color: var(--text-color); margin-left: 0.25rem;">${ot.tecnico_nombre || 'Sin asignar'}</strong> ${assignBtnHtml}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem; display: flex; align-items: center; flex-wrap: wrap;">
                    Prog: <strong style="color: ${progColor}; margin-left: 0.25rem;">${progDateStr}</strong> ${programBtnHtml}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">
                    Gestión: <span>${gestionContentHtml}</span>
                </div>
                
                ${checklistBtn}
                
                <div style="margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span>Reportado por: <strong style="color: var(--text-color);">${ot.reportado_por || 'Sistema'}</strong></span>
                    <span>Creación: ${new Date(ot.fecha_creacion).toLocaleDateString()}</span>
                </div>
            `;
            targetGrid.appendChild(card);

            card.querySelectorAll('.btn-assign').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openAssignModalDialog(ot.id);
                });
            });

            card.querySelectorAll('.btn-start').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    startWorkOrder(ot.id);
                });
            });

            card.querySelectorAll('.btn-pause').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    pauseWorkOrder(ot.id);
                });
            });

            card.querySelectorAll('.btn-resume').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    resumeWorkOrder(ot.id);
                });
            });

            card.querySelectorAll('.btn-complete-direct').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    completeWorkOrderDirect(ot.id);
                });
            });

            // Checklist trigger bound relative to card DOM
            card.querySelectorAll('.btn-view-checklist').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const container = card.querySelector(`#checklist-results-${ot.id}`);
                    const isVisible = container.style.display === 'flex' || container.style.display === 'block';
                    
                    if (isVisible) {
                        container.style.display = 'none';
                        btn.textContent = 'Ver Checklist de Inspección';
                    } else {
                        container.style.display = 'flex';
                        container.style.flexDirection = 'column';
                        container.innerHTML = '<span style="color:var(--text-muted);">Cargando...</span>';
                        btn.textContent = 'Ocultar Checklist';
                        
                        fetch(`/api/ordenes/${ot.id}/respuestas`)
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
        });
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
                    const bEl = document.querySelector(`[data-edificio-id="${selectedEdificioId}"]`);
                    const bName = bEl ? bEl.getAttribute('data-edificio-nombre') : '';
                    filteredOts = ots.filter(ot => ot.edificio_nombre === bName);
                } else if (selectedUbicacionId) {
                    const uEl = document.querySelector(`[data-ubicacion-id="${selectedUbicacionId}"]`);
                    const uName = uEl ? uEl.getAttribute('data-ubicacion-nombre') : '';
                    filteredOts = ots.filter(ot => ot.ubicacion_nombre === uName);
                }

                // Add or update to allLoadedOts
                ots.forEach(ot => {
                    if (!allLoadedOts.some(o => o.id === ot.id)) {
                        allLoadedOts.push(ot);
                    } else {
                        const idx = allLoadedOts.findIndex(o => o.id === ot.id);
                        allLoadedOts[idx] = ot;
                    }
                });

                loadedWorkOrdersList = filteredOts;
                renderWorkOrders(filteredOts, otGrid);

                // Update location summaries and detail panel reactively
                loadPlantSummaries();
            })
            .catch(err => console.error('Error al cargar OTs:', err));
    }

    // --- 4.5. LOAD PLANT SUMMARIES & DETAILS ---
    function loadPlantSummaries() {
        fetch('/api/ordenes')
            .then(res => res.json())
            .then(ots => {
                allLoadedOts = ots;
                
                const counts = {
                    'Santa Adela': { corrective: 0, preventive: 0, total: 0 },
                    'La Divisa': { corrective: 0, preventive: 0, total: 0 },
                    'Sta. A. 10.000': { corrective: 0, preventive: 0, total: 0 }
                };

                ots.forEach(ot => {
                    const plant = ot.planta_nombre;
                    if (counts[plant] !== undefined) {
                        counts[plant].total++;
                        if (ot.tipo === 'Correctiva') {
                            counts[plant].corrective++;
                        } else if (ot.tipo === 'Preventiva') {
                            counts[plant].preventive++;
                        }
                    }
                });

                for (const plant in counts) {
                    const c = counts[plant];
                    const selectors = plantCounts[plant];
                    if (selectors) {
                        if (selectors.corrective) selectors.corrective.textContent = `${c.corrective} OTs`;
                        if (selectors.preventive) selectors.preventive.textContent = `${c.preventive} OTs`;
                        if (selectors.total) selectors.total.textContent = `${c.total} OTs`;
                    }
                }

                // If currently viewing a plant's details, refresh that list as well
                if (plantDetailView && plantDetailView.style.display === 'block' && currentSelectedPlantName) {
                    renderPlantDetail(currentSelectedPlantName);
                }

                // Update building counts in the sidebar
                updateBuildingOtCounts();
            })
            .catch(err => console.error('Error cargando resúmenes de planta:', err));
    }

    function updateBuildingOtCounts() {
        document.querySelectorAll('.building-ot-count').forEach(span => {
            const buildingName = span.getAttribute('data-building-name');
            const plantName = span.getAttribute('data-plant-name');
            const count = allLoadedOts.filter(ot => 
                ot.edificio_nombre === buildingName && 
                ot.planta_nombre === plantName && 
                ot.estado !== 'REALIZADA' && 
                ot.estado !== 'Resuelta' &&
                ot.estado !== 'Cancelada'
            ).length;
            span.textContent = `(${count})`;
        });
    }

    function renderPlantDetail(plantName) {
        currentSelectedPlantName = plantName;
        if (plantDetailTitle) {
            plantDetailTitle.textContent = `Órdenes de Trabajo en ${plantName}`;
        }
        
        const filteredOts = allLoadedOts.filter(ot => ot.planta_nombre === plantName);
        
        if (plantOtGrid) {
            renderWorkOrders(filteredOts, plantOtGrid);
        }
    }

    // Click handlers for plant overview cards
    document.querySelectorAll('.plant-kpi-card').forEach(card => {
        card.addEventListener('click', () => {
            const plantName = card.getAttribute('data-planta-nombre');
            if (plantSummaryView) plantSummaryView.style.display = 'none';
            if (plantDetailView) plantDetailView.style.display = 'block';
            renderPlantDetail(plantName);
        });
    });

    // Back button listener
    if (btnBackToPlants) {
        btnBackToPlants.addEventListener('click', () => {
            currentSelectedPlantName = null;
            if (plantDetailView) plantDetailView.style.display = 'none';
            if (plantSummaryView) plantSummaryView.style.display = 'block';
            loadPlantSummaries();
        });
    }

    filterOtState.addEventListener('change', loadWorkOrders);
    filterActivoState.addEventListener('change', loadAssets);

    // --- 5. LOAD ASSETS ---
    const typeNorm = {
        'climatizacion': 'Climatización',
        'climatización': 'Climatización',
        'gasfiteria': 'Gasfitería',
        'gasfitería': 'Gasfitería',
        'electricidad': 'Electricidad',
        'dispensadores': 'Dispensadores',
        'mobiliario': 'Mobiliario',
        'quincalleria': 'Quincallería',
        'quincallería': 'Quincallería'
    };
    function normalizeType(t) {
        if (!t) return 'Otros';
        const clean = t.trim().toLowerCase();
        return typeNorm[clean] || (t.charAt(0).toUpperCase() + t.slice(1));
    }
    const typeColors = {
        'Climatización': '#3b82f6', // Accent blue
        'Gasfitería': '#10b981', // Success green
        'Electricidad': '#f59e0b', // Warning yellow
        'Dispensadores': '#a855f7', // Purple
        'Mobiliario': '#ec4899', // Pink
        'Quincallería': '#64748b' // Slate/grey
    };
    function getDotColor(type) {
        return typeColors[type] || '#6b7280'; // Default gray
    }
    const typeOrder = ['Climatización', 'Gasfitería', 'Electricidad', 'Dispensadores', 'Mobiliario', 'Quincallería'];

    function loadAssets() {
        let url = '/api/activos';
        const params = [];
        if (selectedUbicacionId) {
            params.push(`ubicacion_id=${selectedUbicacionId}`);
        } else if (selectedEdificioId) {
            params.push(`edificio_id=${selectedEdificioId}`);
        } else if (selectedPlantaId) {
            params.push(`planta_id=${selectedPlantaId}`);
        }
        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        activoGrid.className = 'grid-container';
        activoGrid.innerHTML = '<p style="color: var(--text-muted);">Cargando activos...</p>';

        fetch(url)
            .then(res => res.json())
            .then(activos => {
                // Filter by state if selected
                const filterState = filterActivoState.value;
                let filteredActivos = activos;
                if (filterState) {
                    if (filterState === 'Inactivo') {
                        filteredActivos = activos.filter(a => a.estado === 'Inactivo' || a.estado === 'Reemplazado' || a.estado === 'Eliminado sin Reemplazo');
                    } else {
                        filteredActivos = activos.filter(a => a.estado === filterState);
                    }
                }

                if (filteredActivos.length === 0) {
                    activoGrid.className = 'grid-container';
                    activoGrid.innerHTML = '<p style="color: var(--text-muted);">No hay activos registrados que coincidan con este filtro.</p>';
                    return;
                }

                // Group assets by type
                const grouped = {};
                filteredActivos.forEach(a => {
                    const normType = normalizeType(a.tipo);
                    if (!grouped[normType]) {
                        grouped[normType] = [];
                    }
                    grouped[normType].push(a);
                });

                // Sort types
                const sortedTypes = Object.keys(grouped).sort((a, b) => {
                    const idxA = typeOrder.indexOf(a);
                    const idxB = typeOrder.indexOf(b);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    if (idxA !== -1) return -1;
                    if (idxB !== -1) return 1;
                    return a.localeCompare(b);
                });

                activoGrid.className = 'assets-columns-container';
                activoGrid.innerHTML = '';

                sortedTypes.forEach(type => {
                    const column = document.createElement('div');
                    column.className = 'assets-type-column';

                    const header = document.createElement('div');
                    header.className = 'assets-type-header';
                    header.innerHTML = `
                        <div>
                            <span class="assets-type-dot" style="background-color: ${getDotColor(type)};"></span>
                            <span>${type}</span>
                        </div>
                        <span class="assets-type-count">${grouped[type].length}</span>
                    `;
                    column.appendChild(header);

                    const cardsContainer = document.createElement('div');
                    cardsContainer.className = 'assets-type-cards';

                    grouped[type].forEach(a => {
                        const isOk = a.estado === 'Operativo';
                        const isInactive = a.estado === 'Reemplazado' || a.estado === 'Eliminado sin Reemplazo';
                        const isRepair = a.estado === 'En Reparación';
                        
                        let cardClass = `entity-card status-${isOk ? 'ok' : 'issue'}`;
                        let statusBadgeClass = isOk ? 'status-ok' : 'status-issue';
                        
                        if (isInactive) {
                            cardClass = 'entity-card status-inactive';
                            statusBadgeClass = 'status-inactive';
                        } else if (isRepair) {
                            cardClass = 'entity-card status-repair';
                            statusBadgeClass = 'status-repair';
                        }

                        const card = document.createElement('div');
                        card.className = cardClass;
                        card.innerHTML = `
                            <h4 class="entity-title" style="margin-bottom:0.25rem; font-size:0.95rem;">${a.nombre}</h4>
                            <div class="entity-meta">
                                <div class="meta-row">
                                    <span style="font-size:0.8rem; color: var(--text-muted);">Marca/Mod: <strong>${a.marca || 'S/M'} / ${a.modelo || 'S/M'}</strong></span>
                                </div>
                                <div class="meta-row" style="justify-content: space-between; margin-top: 0.5rem; align-items: center;">
                                    <span class="status-badge ${statusBadgeClass}" style="padding: 0.15rem 0.45rem; font-size: 0.75rem;">${a.estado}</span>
                                    <span style="font-size: 0.75rem; color: var(--accent-color); font-weight: 600;">Ficha &gt;</span>
                                </div>
                            </div>
                        `;
                        cardsContainer.appendChild(card);

                        card.addEventListener('click', () => {
                            openAssetDrawer(a.id);
                        });
                    });

                    column.appendChild(cardsContainer);
                    activoGrid.appendChild(column);
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
                currentAssetData = data;
                drawerAssetName.textContent = `${data.nombre} (ACT-${data.id})`;
                drawerAssetMarca.textContent = data.marca || 'Sin Marca';
                drawerAssetModelo.textContent = data.modelo || 'Sin Modelo';
                drawerAssetSerie.textContent = data.numero_serie || 'S/N';
                
                // Color code state
                let stateClass = 'status-badge status-issue';
                if (data.estado === 'Operativo') {
                    stateClass = 'status-badge status-ok';
                } else if (data.estado === 'Reemplazado' || data.estado === 'Eliminado sin Reemplazo') {
                    stateClass = 'status-badge status-inactive';
                } else if (data.estado === 'En Reparación') {
                    stateClass = 'status-badge status-repair';
                }
                drawerAssetEstado.className = stateClass;
                drawerAssetEstado.textContent = data.estado;
                
                drawerAssetPlanta.textContent = data.planta_nombre || 'N/A';
                drawerAssetEdificio.textContent = data.edificio_nombre || 'N/A';
                drawerAssetUbicacion.textContent = data.ubicacion_nombre || 'N/A';
                
                // Render Components (Despiece)
                drawerComponentList.innerHTML = '';
                if (data.componentes.length === 0) {
                    drawerComponentList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0;">No se ha registrado despiece de partes para este activo.</p>';
                } else {
                    data.componentes.forEach(c => {
                        let compStateClass = 'status-badge ' + (c.estado === 'Operativo' ? 'status-ok' : 'status-issue');
                        if (c.estado === 'En Reparación') compStateClass = 'status-badge status-repair';

                        const compRow = document.createElement('div');
                        compRow.className = 'component-item';
                        compRow.innerHTML = `
                            <div class="component-info" style="flex: 1;">
                                <h4>${c.nombre} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal; margin-left: 0.5rem;">[PZ-${c.id}]</span></h4>
                                <p>${c.marca || 'S/M'} - ${c.modelo || 'S/M'} ${c.numero_serie ? ' / Serie: ' + c.numero_serie : ''}</p>
                            </div>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <span class="${compStateClass}">${c.estado}</span>
                                <button class="btn-edit-comp-trigger btn-secondary" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--accent-color); cursor: pointer;">⚙️ Reemplazar</button>
                            </div>
                        `;
                        drawerComponentList.appendChild(compRow);
                        
                        compRow.querySelector('.btn-edit-comp-trigger').addEventListener('click', (e) => {
                            e.stopPropagation();
                            openComponentEditModal(c);
                        });
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

    // Helper to open New OT Modal pre-filled for a specific asset
    function openNewOTModalForAsset(plantaId, edificioId, ubicacionId, activoId) {
        // Close asset drawer
        assetDrawer.classList.remove('open');

        // Clear search inputs
        const otSearchInput = document.getElementById('ot-search-location');
        const otSearchResults = document.getElementById('ot-search-location-results');
        if (otSearchInput) otSearchInput.value = '';
        if (otSearchResults) {
            otSearchResults.style.display = 'none';
            otSearchResults.innerHTML = '';
        }

        const otPlanta = document.getElementById('ot-select-planta');
        const otEdificio = document.getElementById('ot-select-edificio');
        const otUbicacion = document.getElementById('ot-select-ubicacion');
        const otActivo = document.getElementById('ot-select-activo');

        // Load plants
        fetch('/api/plantas')
            .then(res => res.json())
            .then(plantas => {
                otPlanta.innerHTML = '<option value="">-- Selecciona Planta --</option>';
                plantas.forEach(p => {
                    otPlanta.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
                });
                otPlanta.value = plantaId;

                // Load buildings for this planta
                return fetch(`/api/plantas/${plantaId}/edificios`);
            })
            .then(res => res.json())
            .then(edificios => {
                otEdificio.disabled = false;
                otEdificio.innerHTML = '<option value="">-- Selecciona --</option>';
                edificios.forEach(b => {
                    otEdificio.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
                });
                otEdificio.value = edificioId;

                // Load locations for this building
                return fetch(`/api/edificios/${edificioId}/ubicaciones`);
            })
            .then(res => res.json())
            .then(ubicaciones => {
                otUbicacion.disabled = false;
                otUbicacion.innerHTML = '<option value="">-- Selecciona --</option>';
                ubicaciones.forEach(u => {
                    otUbicacion.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
                });
                otUbicacion.value = ubicacionId;

                // Load assets for this location
                return fetch(`/api/activos?ubicacion_id=${ubicacionId}`);
            })
            .then(res => res.json())
            .then(activos => {
                otActivo.disabled = false;
                otActivo.innerHTML = '<option value="">-- Selecciona Activo (Opcional) --</option>';
                const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo');
                activeActivos.forEach(a => {
                    otActivo.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
                });
                otActivo.value = activoId;

                // Load technicians in assignment dropdown
                const otTecnico = document.getElementById('ot-tecnico');
                otTecnico.innerHTML = '<option value="">No Asignado</option>';
                techniciansList.forEach(t => {
                    otTecnico.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                });

                // Load checklists in template selector dropdown
                return fetch('/api/plantillas');
            })
            .then(res => res.json())
            .then(plantillas => {
                const otSelectPlantilla = document.getElementById('ot-select-plantilla');
                otSelectPlantilla.innerHTML = '<option value="">-- Sin plantilla / Pauta estándar --</option>';
                plantillas.forEach(p => {
                    otSelectPlantilla.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
                });

                // Show modal!
                otModal.style.display = 'flex';
            })
            .catch(err => console.error('Error pre-filling OT modal for asset:', err));
    }

    btnCreateOtForAsset.addEventListener('click', () => {
        if (currentAssetData && currentAssetData.planta_id && currentAssetData.edificio_id && currentAssetData.ubicacion_id) {
            openNewOTModalForAsset(
                currentAssetData.planta_id,
                currentAssetData.edificio_id,
                currentAssetData.ubicacion_id,
                currentAssetData.id
            );
        } else {
            alert('No se pudo cargar la ubicación jerárquica del activo.');
        }
    });

    // --- 6.1 EDIT ASSET AND COMPONENT LIFE CYCLE LOGIC ---
    function openComponentEditModal(c) {
        const editTitle = document.getElementById('edit-comp-title');
        if (editTitle) {
            editTitle.textContent = `Editar / Reemplazar Componente (PZ-${c.id})`;
        }
        document.getElementById('edit-comp-id').value = c.id;
        document.getElementById('edit-comp-asset-id').value = c.activo_id;
        document.getElementById('edit-comp-name').value = c.nombre;
        document.getElementById('edit-comp-marca').value = c.marca || '';
        document.getElementById('edit-comp-modelo').value = c.modelo || '';
        document.getElementById('edit-comp-nparte').value = c.numero_serie || '';
        document.getElementById('edit-comp-estado').value = c.estado;
        componentEditModal.style.display = 'flex';
    }

    closeComponentEditModal.addEventListener('click', () => {
        componentEditModal.style.display = 'none';
    });

    componentEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const compId = parseInt(document.getElementById('edit-comp-id').value);
        const assetId = parseInt(document.getElementById('edit-comp-asset-id').value);
        const name = document.getElementById('edit-comp-name').value.trim();
        const marca = document.getElementById('edit-comp-marca').value.trim() || null;
        const modelo = document.getElementById('edit-comp-modelo').value.trim() || null;
        const serie = document.getElementById('edit-comp-nparte').value.trim() || null;
        const estado = document.getElementById('edit-comp-estado').value;

        const payload = {
            id: compId,
            nombre: name,
            marca: marca,
            modelo: modelo,
            numero_serie: serie,
            estado: estado,
            activo_id: assetId
        };

        fetch(`/api/componentes/${compId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al actualizar componente');
            return res.json();
        })
        .then(data => {
            componentEditModal.style.display = 'none';
            openAssetDrawer(assetId);
        })
        .catch(err => alert(err.message));
    });

    // New Technical Edit Modal Elements
    const assetTechEditModal = document.getElementById('asset-tech-edit-modal');
    const assetTechEditForm = document.getElementById('asset-tech-edit-form');
    const closeAssetTechEditModal = document.getElementById('close-asset-tech-edit-modal');
    const btnEditTechSheet = document.getElementById('btn-edit-tech-sheet');

    btnEditAsset.addEventListener('click', () => {
        if (!currentAssetData) return;
        document.getElementById('edit-asset-id').value = currentAssetData.id;
        document.getElementById('edit-asset-name').value = currentAssetData.nombre;
        document.getElementById('edit-asset-tipo').value = currentAssetData.tipo;
        document.getElementById('edit-asset-marca').value = currentAssetData.marca || '';
        document.getElementById('edit-asset-modelo').value = currentAssetData.modelo || '';
        document.getElementById('edit-asset-serie').value = currentAssetData.numero_serie || '';
        document.getElementById('edit-asset-estado').value = currentAssetData.estado;
        document.getElementById('edit-asset-location-id').value = currentAssetData.ubicacion_id || '';

        // Populate read-only labels in the state change modal
        document.getElementById('lbl-edit-asset-name').textContent = currentAssetData.nombre;
        document.getElementById('lbl-edit-asset-specs').textContent = `${currentAssetData.marca || 'S/M'} / ${currentAssetData.modelo || 'S/M'}`;
        document.getElementById('lbl-edit-asset-serie').textContent = currentAssetData.numero_serie || 'S/N';

        assetEditModal.style.display = 'flex';
    });

    closeAssetEditModal.addEventListener('click', () => {
        assetEditModal.style.display = 'none';
    });

    assetEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const assetId = parseInt(document.getElementById('edit-asset-id').value);
        const name = document.getElementById('edit-asset-name').value.trim();
        const tipo = document.getElementById('edit-asset-tipo').value;
        const marca = document.getElementById('edit-asset-marca').value.trim() || null;
        const modelo = document.getElementById('edit-asset-modelo').value.trim() || null;
        const serie = document.getElementById('edit-asset-serie').value.trim() || null;
        const estado = document.getElementById('edit-asset-estado').value;
        const uId = document.getElementById('edit-asset-location-id').value ? parseInt(document.getElementById('edit-asset-location-id').value) : null;

        const payload = {
            id: assetId,
            nombre: name,
            tipo: tipo,
            marca: marca,
            modelo: modelo,
            numero_serie: serie,
            estado: estado,
            ubicacion_id: uId
        };

        fetch(`/api/activos/${assetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al actualizar estado del activo');
            return res.json();
        })
        .then(data => {
            assetEditModal.style.display = 'none';
            loadAssets();
            loadKPIs();
            
            // Check if user selected Reemplazado. If so, prompt to register the replacing asset!
            if (estado === 'Reemplazado') {
                setTimeout(() => {
                    const confirmReplacement = confirm(`El activo ha sido marcado como "Reemplazado". ¿Deseas registrar de inmediato el nuevo activo que lo reemplazará en esta misma ubicación?`);
                    if (confirmReplacement) {
                        // Open the "Registrar Nuevo Activo" modal prefilled with location, name, type
                        document.getElementById('asset-location-id').value = uId || '';
                        document.getElementById('asset-name').value = name; // prefill with old name
                        document.getElementById('asset-tipo').value = tipo; // prefill with old type
                        document.getElementById('asset-marca').value = ''; // clear brand for new one
                        document.getElementById('asset-modelo').value = ''; // clear model for new one
                        document.getElementById('asset-serie').value = ''; // clear serial for new one
                        
                        // Show modal
                        assetModal.style.display = 'flex';
                    } else {
                        openAssetDrawer(assetId);
                    }
                }, 100);
            } else {
                openAssetDrawer(assetId);
            }
        })
        .catch(err => alert(err.message));
    });

    // --- Technical Specifications Edit Handlers (Restricted) ---
    btnEditTechSheet.addEventListener('click', () => {
        if (!currentAssetData) return;

        const clave = prompt("La modificación de datos críticos de la ficha técnica requiere privilegios de Administrador. Ingrese la clave de autorización:");
        if (clave === null) return; // User cancelled

        if (clave === 'admin' || clave === '1234') {
            document.getElementById('tech-edit-asset-id').value = currentAssetData.id;
            document.getElementById('tech-edit-asset-name').value = currentAssetData.nombre;
            document.getElementById('tech-edit-asset-tipo').value = currentAssetData.tipo;
            document.getElementById('tech-edit-asset-marca').value = currentAssetData.marca || '';
            document.getElementById('tech-edit-asset-modelo').value = currentAssetData.modelo || '';
            document.getElementById('tech-edit-asset-serie').value = currentAssetData.numero_serie || '';
            document.getElementById('tech-edit-asset-estado').value = currentAssetData.estado;
            document.getElementById('tech-edit-asset-location-id').value = currentAssetData.ubicacion_id || '';

            assetTechEditModal.style.display = 'flex';
        } else {
            alert("Acceso denegado: Clave de Administrador incorrecta.");
        }
    });

    closeAssetTechEditModal.addEventListener('click', () => {
        assetTechEditModal.style.display = 'none';
    });

    assetTechEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const assetId = parseInt(document.getElementById('tech-edit-asset-id').value);
        const name = document.getElementById('tech-edit-asset-name').value.trim();
        const tipo = document.getElementById('tech-edit-asset-tipo').value;
        const marca = document.getElementById('tech-edit-asset-marca').value.trim() || null;
        const modelo = document.getElementById('tech-edit-asset-modelo').value.trim() || null;
        const serie = document.getElementById('tech-edit-asset-serie').value.trim() || null;
        const estado = document.getElementById('tech-edit-asset-estado').value;
        const uId = document.getElementById('tech-edit-asset-location-id').value ? parseInt(document.getElementById('tech-edit-asset-location-id').value) : null;

        const payload = {
            id: assetId,
            nombre: name,
            tipo: tipo,
            marca: marca,
            modelo: modelo,
            numero_serie: serie,
            estado: estado,
            ubicacion_id: uId
        };

        fetch(`/api/activos/${assetId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al actualizar ficha técnica');
            return res.json();
        })
        .then(data => {
            assetTechEditModal.style.display = 'none';
            loadAssets();
            loadKPIs();
            openAssetDrawer(assetId);
        })
        .catch(err => alert(err.message));
    });

    // --- 7. LOAD TECHNICIANS FOR SELECTS ---
    function loadTechniciansForAssign() {
        fetch('/api/tecnicos')
            .then(res => res.json())
            .then(tecnicos => {
                techniciansList = tecnicos;
                assignSelectTecnico.innerHTML = '<option value="">-- Selecciona Técnico --</option>';
                tecnicos.forEach(t => {
                    assignSelectTecnico.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
                });
            })
            .catch(err => console.error(err));
    }

    // --- 8. ASSIGN TECHNICIAN MODAL ACTIONS ---
    function openAssignModalDialog(otId) {
        assignOtId.value = otId;
        const ot = allLoadedOts.find(o => o.id === parseInt(otId)) || loadedWorkOrdersList.find(o => o.id === parseInt(otId));
        
        const dateInput = document.getElementById('assign-fecha-programada');
        const timeInput = document.getElementById('assign-hora-programada');
        if (ot) {
            assignSelectTecnico.value = ot.tecnico_id || '';
            if (ot.fecha_programada) {
                dateInput.value = ot.fecha_programada.substring(0, 10);
                if (ot.fecha_programada.includes('T')) {
                    timeInput.value = ot.fecha_programada.substring(11, 16);
                } else {
                    timeInput.value = '';
                }
            } else {
                dateInput.value = '';
                timeInput.value = '';
            }
        } else {
            assignSelectTecnico.value = '';
            dateInput.value = '';
            timeInput.value = '';
        }
        assignModal.style.display = 'flex';
    }

    closeAssignModal.addEventListener('click', () => {
        assignModal.style.display = 'none';
    });

    assignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otId = assignOtId.value;
        const techId = parseInt(assignSelectTecnico.value) || null;
        const fechaProgramadaVal = document.getElementById('assign-fecha-programada').value || null;
        const horaProgramadaVal = document.getElementById('assign-hora-programada').value || '';

        let fullFechaProgramada = fechaProgramadaVal;
        if (fechaProgramadaVal) {
            fullFechaProgramada = fechaProgramadaVal + 'T' + (horaProgramadaVal || '00:00') + ':00';
        }

        const ot = allLoadedOts.find(o => o.id === parseInt(otId)) || loadedWorkOrdersList.find(o => o.id === parseInt(otId));
        if (ot && ot.fecha_inicio && fullFechaProgramada) {
            const startDt = new Date(ot.fecha_inicio);
            const progDt = new Date(fullFechaProgramada);
            if (progDt > startDt) {
                alert("La fecha programada no puede ser posterior a la fecha y hora de inicio de los trabajos.");
                return;
            }
        }

        // Calcular estado mapeado
        let targetState = 'CREADA';
        if (techId) {
            targetState = fechaProgramadaVal ? 'PROGRAMADA' : 'ASIGNADA';
        }

        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tecnico_id: techId,
                fecha_programada: fullFechaProgramada,
                estado: targetState
            })
        })
        .then(res => {
            if (!res.ok) return res.json().then(data => { throw new Error(data.detail || 'Error al asignar técnico') });
            return res.json();
        })
        .then(() => {
            assignModal.style.display = 'none';
            loadKPIs();
            loadWorkOrders();
        })
        .catch(err => alert(err.message));
    });

    function startWorkOrder(otId) {
        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fecha_inicio: new Date().toISOString()
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al iniciar la orden de trabajo');
            return res.json();
        })
        .then(() => {
            alert('Orden de trabajo iniciada con éxito.');
            loadKPIs();
            loadWorkOrders();
        })
        .catch(err => alert(err.message));
    }

    function pauseWorkOrder(otId) {
        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estado_ejecucion: 'PAUSADA'
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al detener la orden de trabajo');
            return res.json();
        })
        .then(() => {
            loadKPIs();
            loadWorkOrders();
        })
        .catch(err => alert(err.message));
    }

    function resumeWorkOrder(otId) {
        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estado_ejecucion: 'EN_PROCESO'
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al retomar la orden de trabajo');
            return res.json();
        })
        .then(() => {
            loadKPIs();
            loadWorkOrders();
        })
        .catch(err => alert(err.message));
    }

    function completeWorkOrderDirect(otId) {
        otCompleteId.value = otId;
        otCompleteComments.value = '';
        otCompleteModal.style.display = 'flex';
    }

    closeOtCompleteModal.addEventListener('click', () => {
        otCompleteModal.style.display = 'none';
    });

    otCompleteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otId = otCompleteId.value;
        const comments = otCompleteComments.value;

        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estado: 'REALIZADA',
                estado_ejecucion: 'REALIZADA',
                comentarios_tecnicos: comments
            })
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al terminar la orden de trabajo');
            return res.json();
        })
        .then(() => {
            otCompleteModal.style.display = 'none';
            loadKPIs();
            loadWorkOrders();
        })
        .catch(err => alert(err.message));
    });

    // --- 9. MANUAL OT CREATION MODAL ---
    btnCreateOt.addEventListener('click', () => {
        // Clear search inputs
        const otSearchInput = document.getElementById('ot-search-location');
        const otSearchResults = document.getElementById('ot-search-location-results');
        if (otSearchInput) otSearchInput.value = '';
        if (otSearchResults) {
            otSearchResults.style.display = 'none';
            otSearchResults.innerHTML = '';
        }

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
                    otTecnico.innerHTML += `<option value="${t.id}">${t.nombre}</option>`;
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
                const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo');
                activeActivos.forEach(a => {
                    aSelect.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
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

        const fechaProgramadaVal = document.getElementById('ot-fecha-programada').value || null;
        const horaProgramadaVal = document.getElementById('ot-hora-programada') ? document.getElementById('ot-hora-programada').value : '';
        
        let fullFechaProgramada = fechaProgramadaVal;
        if (fechaProgramadaVal) {
            fullFechaProgramada = fechaProgramadaVal + 'T' + (horaProgramadaVal || '00:00') + ':00';
        }

        const payload = {
            descripcion,
            tipo,
            estado: tecnicoId ? (fechaProgramadaVal ? 'PROGRAMADA' : 'ASIGNADA') : 'CREADA',
            prioridad,
            reportado_por: 'Administración',
            planta_id: plantaId,
            edificio_id: edificioId,
            ubicacion_id: ubicacionId,
            activo_id: activoId,
            tecnico_id: tecnicoId,
            plantilla_id: plantillaId,
            fecha_programada: fullFechaProgramada
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
            preloadSearchList();
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
            preloadSearchList();
        })
        .catch(err => alert(err.message));
    }

    // --- EXCEL EXPORT & IMPORT EVENTS ---
    const btnExportOtsExcel = document.getElementById('btn-export-ots-excel');
    const btnExportActivosExcel = document.getElementById('btn-export-activos-excel');
    const excelImportUnifiedFile = document.getElementById('excel-import-unified-file');

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

    if (excelImportUnifiedFile) {
        excelImportUnifiedFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('file', file);
            
            const originalLabel = document.querySelector('label[for="excel-import-unified-file"]').innerHTML;
            document.querySelector('label[for="excel-import-unified-file"]').innerHTML = '<span>⏳</span> Subiendo...';
            
            fetch('/api/excel/importar-unificado', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) return res.json().then(data => { throw new Error(data.detail || 'Error al procesar carga masiva') });
                return res.json();
            })
            .then(data => {
                alert(`¡Carga Masiva Exitosa!\n${data.message}`);
                excelImportUnifiedFile.value = '';
                
                // Refresh all views
                loadKPIs();
                loadHierarchy();
                loadWorkOrders();
                loadAssets();
                preloadSearchList();
                
                // If asset drawer is open, refresh it in case its components were modified
                if (assetDrawer && assetDrawer.classList.contains('open') && selectedActivoId) {
                    openAssetDrawer(selectedActivoId);
                }
            })
            .catch(err => {
                alert(`Error de Importación: ${err.message}`);
                excelImportUnifiedFile.value = '';
            })
            .finally(() => {
                document.querySelector('label[for="excel-import-unified-file"]').innerHTML = originalLabel;
            });
        });
    }

    // --- INITIALIZE APPLICATION ---
    loadKPIs();
    loadHierarchy();
    loadWorkOrders();
    loadAssets();
    loadTechniciansForAssign();
});
