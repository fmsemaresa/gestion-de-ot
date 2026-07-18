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
    let currentPlantViewMode = 'flat'; // 'flat', 'building', or 'type'
    let currentOtViewMode = 'flat'; // 'flat', 'building', 'type', or 'calendar'
    let calendarYear = new Date().getFullYear();
    let calendarMonth = new Date().getMonth();
    let customChecklistItems = [];
    let editCustomChecklistItems = [];
    let calendarViewSubMode = 'month'; // 'day', 'week', 'month'
    let calendarCurrentDate = new Date();

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
    const tabBtnKpis = document.getElementById('tab-btn-kpis');
    const tabOts = document.getElementById('tab-ots');
    const tabActivos = document.getElementById('tab-activos');
    const tabUbicaciones = document.getElementById('tab-ubicaciones');
    const tabKpis = document.getElementById('tab-kpis');
    
    const plantSummaryView = document.getElementById('plant-summary-view');
    const plantDetailView = document.getElementById('plant-detail-view');
    const plantOtGrid = document.getElementById('plant-ot-grid');
    const btnBackToPlants = document.getElementById('btn-back-to-plants');
    const plantDetailTitle = document.getElementById('plant-detail-title');
    const btnPlantViewFlat = document.getElementById('btn-plant-view-flat');
    const btnPlantViewBuilding = document.getElementById('btn-plant-view-building');
    const btnPlantViewType = document.getElementById('btn-plant-view-type');
    const btnOtViewFlat = document.getElementById('btn-ot-view-flat');
    const btnOtViewBuilding = document.getElementById('btn-ot-view-building');
    const btnOtViewType = document.getElementById('btn-ot-view-type');
    const btnOtViewCalendar = document.getElementById('btn-ot-view-calendar');

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
    const searchOt = document.getElementById('search-ot');
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
    const assignSelectTecnicosContainer = document.getElementById('assign-select-tecnicos-container');
    const assignOtId = document.getElementById('assign-ot-id');

    // Complete OT Modal
    const otCompleteModal = document.getElementById('ot-complete-modal');
    const otCompleteForm = document.getElementById('ot-complete-form');
    const closeOtCompleteModal = document.getElementById('close-ot-complete-modal');
    const otCompleteId = document.getElementById('ot-complete-id');
    const otCompleteComments = document.getElementById('ot-complete-comments');
    let shouldCreateAnotherOtAfterComplete = false;

    // Edit Modals (Asset and Component lifecycle)
    const assetEditModal = document.getElementById('asset-edit-modal');
    const assetEditForm = document.getElementById('asset-edit-form');
    const closeAssetEditModal = document.getElementById('close-asset-edit-modal');
    const btnEditAsset = document.getElementById('btn-edit-asset');
    
    const componentEditModal = document.getElementById('component-edit-modal');
    const componentEditForm = document.getElementById('component-edit-form');
    const closeComponentEditModal = document.getElementById('close-component-edit-modal');

    // Edit OT Modal
    const editOtModal = document.getElementById('edit-ot-modal');
    const editOtForm = document.getElementById('edit-ot-form');
    const closeEditOtModal = document.getElementById('close-edit-ot-modal');
    let initialEditSnapshot = null;

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

    // OT Drawer
    const otDrawer = document.getElementById('ot-drawer');
    const closeOtDrawer = document.getElementById('close-ot-drawer');
    const drawerOtTitle = document.getElementById('drawer-ot-title');
    const drawerOtPlanta = document.getElementById('drawer-ot-planta');
    const drawerOtEdificio = document.getElementById('drawer-ot-edificio');
    const drawerOtUbicacion = document.getElementById('drawer-ot-ubicacion');
    const drawerOtUbicacionContainer = document.getElementById('drawer-ot-ubicacion-container');
    const drawerOtEstado = document.getElementById('drawer-ot-estado');
    const drawerOtActionsContainer = document.getElementById('drawer-ot-actions-container');
    const drawerOtPrioridad = document.getElementById('drawer-ot-prioridad');
    const drawerOtReportado = document.getElementById('drawer-ot-reportado');
    const drawerOtCreacion = document.getElementById('drawer-ot-creacion');
    const drawerOtTecnico = document.getElementById('drawer-ot-tecnico');
    const drawerOtProgramada = document.getElementById('drawer-ot-programada');
    const drawerOtDescripcion = document.getElementById('drawer-ot-descripcion');
    const drawerOtComponentsSection = document.getElementById('drawer-ot-components-section');
    const drawerOtComponentsList = document.getElementById('drawer-ot-components-list');
    const drawerOtChecklistSection = document.getElementById('drawer-ot-checklist-section');
    const drawerOtChecklistResults = document.getElementById('drawer-ot-checklist-results');
    const drawerOtPhotosSection = document.getElementById('drawer-ot-photos-section');
    const drawerOtPhotosContainer = document.getElementById('drawer-ot-photos-container');
    const drawerOtComentariosSection = document.getElementById('drawer-ot-comentarios-section');
    const drawerOtComentariosList = document.getElementById('drawer-ot-comentarios-list');
    const drawerOtResolucionSection = document.getElementById('drawer-ot-resolucion-section');
    const drawerOtResolucion = document.getElementById('drawer-ot-resolucion');

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
        tabBtnKpis.style.borderBottomColor = 'transparent';
        tabOts.style.display = 'block';
        tabActivos.style.display = 'none';
        tabUbicaciones.style.display = 'none';
        tabKpis.style.display = 'none';
        loadWorkOrders();
    });

    tabBtnActivos.addEventListener('click', () => {
        activeTab = 'activos';
        tabBtnActivos.style.borderBottomColor = 'var(--accent-color)';
        tabBtnOts.style.borderBottomColor = 'transparent';
        tabBtnUbicaciones.style.borderBottomColor = 'transparent';
        tabBtnKpis.style.borderBottomColor = 'transparent';
        tabActivos.style.display = 'block';
        tabOts.style.display = 'none';
        tabUbicaciones.style.display = 'none';
        tabKpis.style.display = 'none';
        loadAssets();
    });

    tabBtnUbicaciones.addEventListener('click', () => {
        activeTab = 'ubicaciones';
        tabBtnUbicaciones.style.borderBottomColor = 'var(--accent-color)';
        tabBtnOts.style.borderBottomColor = 'transparent';
        tabBtnActivos.style.borderBottomColor = 'transparent';
        tabBtnKpis.style.borderBottomColor = 'transparent';
        tabUbicaciones.style.display = 'block';
        tabOts.style.display = 'none';
        tabActivos.style.display = 'none';
        tabKpis.style.display = 'none';
        
        // Reset sub-view to plants summary by default
        plantSummaryView.style.display = 'block';
        plantDetailView.style.display = 'none';
        currentSelectedPlantName = null;
        
        loadPlantSummaries();
    });

    tabBtnKpis.addEventListener('click', () => {
        activeTab = 'kpis';
        tabBtnKpis.style.borderBottomColor = 'var(--accent-color)';
        tabBtnOts.style.borderBottomColor = 'transparent';
        tabBtnActivos.style.borderBottomColor = 'transparent';
        tabBtnUbicaciones.style.borderBottomColor = 'transparent';
        tabKpis.style.display = 'block';
        tabOts.style.display = 'none';
        tabActivos.style.display = 'none';
        tabUbicaciones.style.display = 'none';
        
        loadKpisDashboard();
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
                    const matchName = u.nombre.toLowerCase().includes(query) || 
                                      u.planta_nombre.toLowerCase().includes(query) || 
                                      u.edificio_nombre.toLowerCase().includes(query);
                    const matchMeta = (u.codigo && u.codigo.toLowerCase().includes(query)) ||
                                      (u.uso && u.uso.toLowerCase().includes(query)) ||
                                      (u.cargo && u.cargo.toLowerCase().includes(query));
                    const matchOcupante = u.ocupantes && u.ocupantes.some(o => o.nombre.toLowerCase().includes(query));
                    
                    return matchName || matchMeta || matchOcupante;
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

                    // Match metadata (codigo, uso, cargo)
                    const cleanCodigo = u.codigo ? u.codigo.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                    const cleanUso = u.uso ? u.uso.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                    const cleanCargo = u.cargo ? u.cargo.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                    
                    if (cleanCodigo.includes(cleanQuery) || cleanUso.includes(cleanQuery) || cleanCargo.includes(cleanQuery)) {
                        return true;
                    }

                    // Match occupants
                    if (u.ocupantes && u.ocupantes.some(o => o.nombre.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery))) {
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
                    const matchName = u.nombre.toLowerCase().includes(query) || 
                                      u.planta_nombre.toLowerCase().includes(query) || 
                                      u.edificio_nombre.toLowerCase().includes(query);
                    const matchMeta = (u.codigo && u.codigo.toLowerCase().includes(query)) ||
                                      (u.uso && u.uso.toLowerCase().includes(query)) ||
                                      (u.cargo && u.cargo.toLowerCase().includes(query));
                    const matchOcupante = u.ocupantes && u.ocupantes.some(o => o.nombre.toLowerCase().includes(query));
                    
                    return matchName || matchMeta || matchOcupante;
                });
            } else {
                filtered = locationsSearchList.filter(u => {
                    const cleanName = u.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanPlanta = u.planta_nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanEdificio = u.edificio_nombre.toLowerCase().replace(/[^a-z0-9]/g, '');

                    if (cleanName.includes(cleanQuery) || cleanPlanta.includes(cleanQuery) || cleanEdificio.includes(cleanQuery)) {
                        return true;
                    }

                    const cleanCodigo = u.codigo ? u.codigo.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                    const cleanUso = u.uso ? u.uso.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                    const cleanCargo = u.cargo ? u.cargo.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                    
                    if (cleanCodigo.includes(cleanQuery) || cleanUso.includes(cleanQuery) || cleanCargo.includes(cleanQuery)) {
                        return true;
                    }

                    if (u.ocupantes && u.ocupantes.some(o => o.nombre.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery))) {
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
        resetOtComponents();
        
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
                const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo' && a.estado !== 'Limpieza DB');
                activeActivos.forEach(a => {
                    otActivo.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
                });
                
                if (assetName) {
                    const matchedAsset = activeActivos.find(a => a.nombre === assetName);
                    if (matchedAsset) {
                        otActivo.value = matchedAsset.id;
                        otActivo.dispatchEvent(new Event('change'));
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
            
            let occupantsHtml = '';
            if (u.ocupantes && u.ocupantes.length > 0) {
                const names = u.ocupantes.map(o => o.nombre).join(', ');
                occupantsHtml = `
                    <div style="font-size: 0.72rem; color: var(--success); margin-top: 0.15rem; display: flex; align-items: center; gap: 0.25rem;">
                        <span>👤</span> <span>Ocupantes: <strong>${names}</strong></span>
                    </div>
                `;
            }

            item.innerHTML = `
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.15rem;">
                    🏢 ${u.planta_nombre} &gt; 📦 ${u.edificio_nombre}
                </div>
                <div style="font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 0.35rem;">
                    📍 ${u.nombre}
                </div>
                ${occupantsHtml}
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
                        ot.edificio_id == e.id && 
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
                    
                    let displayName = u.nombre;
                    if (u.ocupantes && u.ocupantes.length > 0) {
                        const names = u.ocupantes.map(o => o.nombre).join(', ');
                        displayName = `${u.nombre} (${names})`;
                    }
                    
                    locItem.setAttribute('data-ubicacion-nombre', displayName);
                    locItem.innerHTML = `<span>📍 ${displayName}</span>`;
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
                const hours = String(pDate.getHours()).padStart(2, '0');
                const minutes = String(pDate.getMinutes()).padStart(2, '0');
                const timePart = `${hours}:${minutes}`;
                if (timePart !== '00:00') {
                    progDateStr += ` a las ${timePart}`;
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
                if (ot.comentarios_tecnicos) {
                    gestionContentHtml += `<br><span style="font-size: 0.8rem; color: var(--success); display: block; margin-top: 0.2rem;"><strong>Cierre:</strong> ${ot.comentarios_tecnicos}</span>`;
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

            // Build fotos gallery HTML for admin
            let fotosGalleryHtml = '';
            if (ot.fotos && ot.fotos.length > 0) {
                fotosGalleryHtml = `
                    <div style="margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem;">
                        <strong style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Fotos de Respaldo:</strong>
                        <div style="display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.25rem;">
                            ${ot.fotos.map(f => `
                                <div style="flex: 0 0 60px; cursor: pointer;" onclick="window.open('${f.url_foto}', '_blank')">
                                    <img src="${f.url_foto}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);" title="${f.comentario || ''}">
                                    ${f.comentario ? `<div style="font-size: 0.6rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60px; margin-top: 0.1rem;">${f.comentario}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            // Build comentarios avance HTML for admin
            let comentariosAvanceHtml = '';
            if (ot.comentarios_avance && ot.comentarios_avance.length > 0) {
                comentariosAvanceHtml = `
                    <div style="margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem; text-align: left;">
                        <strong style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 0.25rem;">Bitácora de Notas:</strong>
                        <div style="display: flex; flex-direction: column; gap: 0.35rem; max-height: 120px; overflow-y: auto; background: rgba(0,0,0,0.15); padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);">
                            ${ot.comentarios_avance.map(c => {
                                const cDate = new Date(c.fecha_creacion);
                                const timeStr = cDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                                const dateStr = cDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
                                return `
                                    <div style="font-size: 0.75rem; line-height: 1.3;">
                                        <span style="color: var(--accent-color); font-weight: 600;">${c.autor}</span> 
                                        <span style="color: var(--text-muted); font-size: 0.65rem;">(${dateStr} ${timeStr}):</span>
                                        <span style="color: #cbd5e1;">${c.comentario}</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            // Render components worked on
            let componentsHtml = '';
            if (ot.componentes_trabajados && ot.componentes_trabajados.length > 0) {
                componentsHtml = `
                    <div style="font-size: 0.8rem; background: rgba(59, 130, 246, 0.08); border-left: 2px solid var(--accent-color); padding: 0.35rem 0.5rem; border-radius: 4px; margin-bottom: 0.4rem; text-align: left;">
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

            const card = document.createElement('div');
            card.className = `entity-card priority-${ot.prioridad.toLowerCase()}`;
            card.innerHTML = `
                <div class="card-tag ${statusClass}">${statusLabel}</div>
                <h4 class="entity-title" style="font-weight: bold;"><span style="font-weight: normal;">#OT-${ot.id}</span> - ${ot.tipo}</h4>
                <div class="entity-subtitle" style="font-weight: bold; color: var(--text-color); margin-bottom: 0.5rem;">${ot.planta_nombre} / ${ot.edificio_nombre} ${ot.ubicacion_nombre ? '/ ' + ot.ubicacion_nombre : ''}</div>
                <p style="font-size:0.85rem; background:rgba(0,0,0,0.1); padding:0.5rem; border-radius:6px; margin-bottom:0.4rem; color:#cbd5e1;">${ot.descripcion}</p>
                ${componentsHtml}
                
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
                ${fotosGalleryHtml}
                ${comentariosAvanceHtml}
                
                <div style="margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span>Reportado por: <strong style="color: var(--text-color);">${ot.reportado_por || 'Sistema'}</strong></span>
                    <span>Creación: ${new Date(ot.fecha_creacion).toLocaleDateString()}</span>
                </div>
            `;
            targetGrid.appendChild(card);

            card.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('img') || e.target.closest('.btn-view-checklist')) {
                    return;
                }
                openEditOTModal(ot.id);
            });

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
    function sortOts(otArray) {
        if (!otArray) return [];
        const priorityWeight = {
            'alta': 1,
            'media': 2,
            'baja': 3
        };
        return otArray.sort((a, b) => {
            const pA = priorityWeight[(a.prioridad || 'media').toLowerCase()] || 2;
            const pB = priorityWeight[(b.prioridad || 'media').toLowerCase()] || 2;
            if (pA !== pB) return pA - pB;
            return new Date(a.fecha_creacion || 0) - new Date(b.fecha_creacion || 0);
        });
    }

    function loadWorkOrders() {
        if (activeTab === 'kpis') {
            loadKpisDashboard();
            return;
        }
        let url = '/api/ordenes';
        const params = [`_t=${Date.now()}`];
        
        const filterState = filterOtState.value;
        if (filterState) params.push(`estado=${filterState}`);
        
        if (selectedPlantaId && !selectedEdificioId) {
            params.push(`planta_id=${selectedPlantaId}`);
        }
        
        url += '?' + params.join('&');

        otGrid.innerHTML = '<p style="color: var(--text-muted);">Cargando órdenes de trabajo...</p>';

        fetch(url)
            .then(res => res.json())
            .then(ots => {
                // Filter OTs in javascript for edificio_id or ubicacion_id
                let filteredOts = ots;
                if (selectedEdificioId && !selectedUbicacionId) {
                    filteredOts = ots.filter(ot => ot.edificio_id == selectedEdificioId);
                } else if (selectedUbicacionId) {
                    filteredOts = ots.filter(ot => ot.ubicacion_id == selectedUbicacionId);
                }

                // Apply dynamic multi-word text search if query exists
                const searchQuery = searchOt ? searchOt.value.trim().toLowerCase() : '';
                if (searchQuery) {
                    const queryWords = searchQuery.split(/\s+/).filter(w => w.length > 0);
                    if (queryWords.length > 0) {
                        filteredOts = filteredOts.filter(ot => {
                            return queryWords.every(word => {
                                const otIdStr = `ot-${ot.id}`.toLowerCase();
                                const otIdNumStr = String(ot.id);
                                const desc = (ot.descripcion || '').toLowerCase();
                                const tipo = (ot.tipo || '').toLowerCase();
                                const estado = (ot.estado || '').toLowerCase();
                                const prioridad = (ot.prioridad || '').toLowerCase();
                                const reportado = (ot.reportado_por || '').toLowerCase();
                                const edificio = (ot.edificio_nombre || '').toLowerCase();
                                const ubicacion = (ot.ubicacion_nombre || '').toLowerCase();
                                const planta = (ot.planta_nombre || '').toLowerCase();
                                
                                const tecnicos = (ot.tecnicos || []).map(t => t.nombre.toLowerCase()).join(' ');
                                const tecnico_solo = ot.tecnico_nombre ? ot.tecnico_nombre.toLowerCase() : '';
                                const plantilla = ot.plantilla_nombre ? ot.plantilla_nombre.toLowerCase() : '';
                                
                                return otIdStr.includes(word) ||
                                       otIdNumStr === word ||
                                       desc.includes(word) ||
                                       tipo.includes(word) ||
                                       estado.includes(word) ||
                                       prioridad.includes(word) ||
                                       reportado.includes(word) ||
                                       edificio.includes(word) ||
                                       ubicacion.includes(word) ||
                                       planta.includes(word) ||
                                       tecnicos.includes(word) ||
                                       tecnico_solo.includes(word) ||
                                       plantilla.includes(word);
                            });
                        });
                    }
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
                sortOts(allLoadedOts);

                filteredOts = sortOts(filteredOts);
                loadedWorkOrdersList = filteredOts;
                
                if (otGrid) {
                    if (currentOtViewMode === 'flat') {
                        otGrid.style.display = 'grid';
                        otGrid.style.flexDirection = '';
                        otGrid.style.gap = '1.25rem';
                        otGrid.style.overflowX = '';
                        renderWorkOrders(filteredOts, otGrid);
                    } else if (currentOtViewMode === 'type') {
                        otGrid.style.display = 'flex';
                        otGrid.style.flexDirection = 'row';
                        otGrid.style.gap = '1.25rem';
                        otGrid.style.overflowX = 'auto';
                        renderTypeGroupedView(filteredOts, otGrid);
                    } else if (currentOtViewMode === 'building') {
                        otGrid.style.display = 'flex';
                        otGrid.style.flexDirection = 'column';
                        otGrid.style.gap = '2rem';
                        otGrid.style.overflowX = '';
                        renderBuildingGroupedView(filteredOts, otGrid);
                    } else if (currentOtViewMode === 'calendar') {
                        otGrid.style.display = 'flex';
                        otGrid.style.flexDirection = 'column';
                        otGrid.style.gap = '1.5rem';
                        otGrid.style.overflowX = 'hidden';
                        renderCalendarView(filteredOts, otGrid);
                    }
                }
                
                // Update location summaries and detail panel reactively
                loadPlantSummaries();

                // If OT drawer is open, refresh it in case it was modified
                if (otDrawer && otDrawer.classList.contains('open') && currentOpenOtId) {
                    openOtDrawer(currentOpenOtId);
                }
            })
            .catch(err => console.error('Error al cargar OTs:', err));
    }

    // --- 4.5. LOAD PLANT SUMMARIES & DETAILS ---
    function loadPlantSummaries() {
        fetch(`/api/ordenes?_t=${Date.now()}`)
            .then(res => res.json())
            .then(ots => {
                allLoadedOts = sortOts(ots);
                
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

    function getSpecializationIcon(type) {
        switch (type) {
            case 'Climatización': return '❄️';
            case 'Gasfitería': return '💧';
            case 'Electricidad': return '⚡';
            case 'Dispensadores': return '🧻';
            case 'Mobiliario': return '🪑';
            case 'Quincallería': return '🔑';
            default: return '📦';
        }
    }

    function setActiveViewButton(activeBtn) {
        const buttons = [
            { btn: btnPlantViewFlat, mode: 'flat' },
            { btn: btnPlantViewBuilding, mode: 'building' },
            { btn: btnPlantViewType, mode: 'type' }
        ];
        buttons.forEach(item => {
            if (item.btn) {
                if (item.btn === activeBtn) {
                    item.btn.style.background = 'var(--accent-color)';
                    item.btn.style.color = 'white';
                } else {
                    item.btn.style.background = 'transparent';
                    item.btn.style.color = 'var(--text-muted)';
                }
            }
        });
    }

    function setActiveOtViewButton(activeBtn) {
        const buttons = [
            { btn: btnOtViewFlat, mode: 'flat' },
            { btn: btnOtViewBuilding, mode: 'building' },
            { btn: btnOtViewType, mode: 'type' },
            { btn: btnOtViewCalendar, mode: 'calendar' }
        ];
        buttons.forEach(item => {
            if (item.btn) {
                if (item.btn === activeBtn) {
                    item.btn.style.background = 'var(--accent-color)';
                    item.btn.style.color = 'white';
                } else {
                    item.btn.style.background = 'transparent';
                    item.btn.style.color = 'var(--text-muted)';
                }
            }
        });
    }

    function resolveColorToHex(colorStr) {
        if (!colorStr) return null;
        const parts = colorStr.split(':');
        const type = parts[0];
        if (type === 'rgb' && parts[1]) {
            let hex = parts[1];
            if (hex.length === 8) {
                if (hex.toLowerCase().startsWith('ff')) {
                    hex = hex.substring(2);
                } else {
                    hex = hex.substring(2);
                }
            }
            return `#${hex}`;
        }
        if (type === 'theme') {
            const themeIdx = parseInt(parts[1]);
            const themeColors = [
                '#FFFFFF', // 0: White
                '#000000', // 1: Black
                '#E7E6E6', // 2: Gray
                '#44546A', // 3: Dark Blue
                '#5B9BD5', // 4: Blue
                '#ED7D31', // 5: Orange
                '#A5A5A5', // 6: Gray
                '#FFC000', // 7: Gold/Yellow
                '#4472C4', // 8: Blue
                '#70AD47'  // 9: Green
            ];
            return themeColors[themeIdx] || '#808080';
        }
        if (type === 'indexed') {
            const idx = parseInt(parts[1]);
            const indexedColors = {
                1: '#000000', 2: '#FFFFFF', 3: '#FF0000', 4: '#00FF00',
                5: '#0000FF', 6: '#FFFF00', 7: '#FF00FF', 8: '#00FFFF',
                9: '#800000', 10: '#008000', 11: '#000080', 12: '#808000',
                13: '#800080', 14: '#008080', 15: '#C0C0C0', 16: '#808080',
                22: '#FFC7CE', 42: '#C6EFCE', 43: '#FFEB9C'
            };
            return indexedColors[idx] || '#808080';
        }
        return null;
    }

    function getColorsBreakdown(typeOts) {
        const counts = {};
        let noColorCount = 0;
        
        typeOts.forEach(ot => {
            const rawColor = ot.activo_color || ot.ubicacion_color;
            const hex = resolveColorToHex(rawColor);
            if (hex) {
                counts[hex] = (counts[hex] || 0) + 1;
            } else {
                noColorCount++;
            }
        });
        
        return { counts, noColorCount };
    }

    function generateColorsBadgeHtml(typeOts, badgeBgColor) {
        const breakdown = getColorsBreakdown(typeOts);
        
        let html = `<div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap;">`;
        
        // Main total badge
        html += `
            <span style="background: ${badgeBgColor}; color: white; font-size: 0.75rem; padding: 0.15rem 0.45rem; border-radius: 20px; font-weight: 700;">
                ${typeOts.length}
            </span>
        `;
        
        // Color items
        for (const [hex, count] of Object.entries(breakdown.counts)) {
            html += `
                <span style="display: inline-flex; align-items: center; gap: 0.2rem; background: rgba(255,255,255,0.06); padding: 0.15rem 0.35rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); font-size: 0.7rem; font-weight: 600; color: var(--text-main);" title="Color Excel">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${hex}; box-shadow: 0 0 4px ${hex};"></span>
                    <span>${count}</span>
                </span>
            `;
        }
        
        // No color count
        if (breakdown.noColorCount > 0) {
            html += `
                <span style="display: inline-flex; align-items: center; gap: 0.2rem; background: rgba(255,255,255,0.03); padding: 0.15rem 0.35rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); font-size: 0.7rem; font-weight: 500; color: var(--text-muted);" title="Sin color">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: var(--text-muted); opacity: 0.35;"></span>
                    <span>${breakdown.noColorCount}</span>
                </span>
            `;
        }
        
        html += `</div>`;
        return html;
    }

    function renderTypeGroupedView(ots, targetGrid) {
        targetGrid.innerHTML = '';
        const types = ['Climatización', 'Gasfitería', 'Electricidad', 'Dispensadores', 'Mobiliario', 'Quincallería', 'Otros'];
        
        types.forEach(type => {
            const typeOts = ots.filter(ot => {
                const normalized = normalizeType(ot.activo_tipo);
                if (type === 'Otros') {
                    return normalized === 'Otros' || !types.includes(normalized);
                }
                return normalized === type;
            });
            
            const col = document.createElement('div');
            col.className = 'kanban-column';
            col.style.flex = '1';
            col.style.minWidth = '290px';
            col.style.maxWidth = '360px';
            col.style.background = 'rgba(19, 27, 46, 0.4)';
            col.style.border = '1px solid var(--border-color)';
            col.style.borderRadius = '10px';
            col.style.padding = '1rem';
            col.style.display = 'flex';
            col.style.flexDirection = 'column';
            col.style.gap = '0.75rem';
            
            const header = document.createElement('h3');
            header.style.fontSize = '1rem';
            header.style.fontWeight = '600';
            header.style.marginBottom = '0.5rem';
            header.style.borderBottom = `2px solid ${typeColors[type] || 'var(--border-color)'}`;
            header.style.paddingBottom = '0.5rem';
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.alignItems = 'center';
            header.style.color = 'var(--text-main)';
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = `${getSpecializationIcon(type)} ${type}`;
            
            const badgeContainer = document.createElement('div');
            badgeContainer.innerHTML = generateColorsBadgeHtml(typeOts, typeColors[type] || 'var(--border-color)');
            
            header.appendChild(titleSpan);
            header.appendChild(badgeContainer);
            col.appendChild(header);
            
            const cardsContainer = document.createElement('div');
            cardsContainer.style.display = 'flex';
            cardsContainer.style.flexDirection = 'column';
            cardsContainer.style.gap = '0.75rem';
            cardsContainer.style.maxHeight = '70vh';
            cardsContainer.style.overflowY = 'auto';
            cardsContainer.style.paddingRight = '0.25rem';
            
            col.appendChild(cardsContainer);
            targetGrid.appendChild(col);
            
            renderWorkOrders(typeOts, cardsContainer);
        });
    }

    function renderBuildingGroupedView(ots, targetGrid) {
        targetGrid.innerHTML = '';
        if (ots.length === 0) {
            targetGrid.innerHTML = '<p style="color: var(--text-muted); padding: 1rem;">No se encontraron órdenes de trabajo.</p>';
            return;
        }

        const buildingNames = [...new Set(ots.map(ot => ot.edificio_nombre || 'Sin Edificio'))].sort();
        
        buildingNames.forEach(bName => {
            const buildingOts = ots.filter(ot => (ot.edificio_nombre || 'Sin Edificio') === bName);
            
            const section = document.createElement('div');
            section.className = 'building-section';
            section.style.background = 'rgba(19, 27, 46, 0.2)';
            section.style.border = '1px solid var(--border-color)';
            section.style.borderRadius = '12px';
            section.style.padding = '1.25rem';
            section.style.display = 'flex';
            section.style.flexDirection = 'column';
            section.style.gap = '1rem';
            section.style.width = '100%';
            
            const header = document.createElement('h3');
            header.style.color = 'var(--accent-color)';
            header.style.fontSize = '1.15rem';
            header.style.fontWeight = '600';
            header.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
            header.style.paddingBottom = '0.5rem';
            header.style.display = 'flex';
            header.style.alignItems = 'center';
            header.style.gap = '0.5rem';
            header.style.margin = '0';
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = `🏢 ${bName}`;
            
            const badge = document.createElement('span');
            badge.style.fontSize = '0.85rem';
            badge.style.color = 'var(--text-muted)';
            badge.style.fontWeight = 'normal';
            badge.textContent = `(${buildingOts.length} OT${buildingOts.length === 1 ? '' : 's'})`;
            
            header.appendChild(nameSpan);
            header.appendChild(badge);
            section.appendChild(header);
            
            const colsContainer = document.createElement('div');
            colsContainer.style.display = 'flex';
            colsContainer.style.gap = '1rem';
            colsContainer.style.overflowX = 'auto';
            colsContainer.style.paddingBottom = '0.5rem';
            colsContainer.style.alignItems = 'flex-start';
            
            const types = ['Climatización', 'Gasfitería', 'Electricidad', 'Dispensadores', 'Mobiliario', 'Quincallería', 'Otros'];
            
            types.forEach(type => {
                const typeOts = buildingOts.filter(ot => {
                    const normalized = normalizeType(ot.activo_tipo);
                    if (type === 'Otros') {
                        return normalized === 'Otros' || !types.includes(normalized);
                    }
                    return normalized === type;
                });
                
                if (typeOts.length > 0) {
                    const col = document.createElement('div');
                    col.style.flex = '0 0 280px';
                    col.style.background = 'rgba(255, 255, 255, 0.02)';
                    col.style.border = '1px solid var(--border-color)';
                    col.style.borderRadius = '8px';
                    col.style.padding = '0.75rem';
                    col.style.display = 'flex';
                    col.style.flexDirection = 'column';
                    col.style.gap = '0.75rem';
                    
                    const colHeader = document.createElement('h4');
                    colHeader.style.fontSize = '0.9rem';
                    colHeader.style.fontWeight = '600';
                    colHeader.style.borderBottom = `2px solid ${typeColors[type] || 'var(--border-color)'}`;
                    colHeader.style.paddingBottom = '0.4rem';
                    colHeader.style.margin = '0';
                    colHeader.style.display = 'flex';
                    colHeader.style.justifyContent = 'space-between';
                    colHeader.style.alignItems = 'center';
                    
                    const colTitleSpan = document.createElement('span');
                    colTitleSpan.textContent = `${getSpecializationIcon(type)} ${type}`;
                    
                    const badgeContainer = document.createElement('div');
                    badgeContainer.innerHTML = generateColorsBadgeHtml(typeOts, typeColors[type] || 'var(--border-color)');
                    
                    colHeader.appendChild(colTitleSpan);
                    colHeader.appendChild(badgeContainer);
                    col.appendChild(colHeader);
                    
                    const cardsContainer = document.createElement('div');
                    cardsContainer.style.display = 'flex';
                    cardsContainer.style.flexDirection = 'column';
                    cardsContainer.style.gap = '0.75rem';
                    
                    col.appendChild(cardsContainer);
                    colsContainer.appendChild(col);
                    
                    renderWorkOrders(typeOts, cardsContainer);
                }
            });
            
            section.appendChild(colsContainer);
            targetGrid.appendChild(section);
        });
    }

    let currentOpenOtId = null;

    function openOtDrawer(otId) {
        // Close asset drawer if open
        assetDrawer.classList.remove('open');

        // Show loading state or clear previous content
        drawerOtTitle.textContent = `Cargando OT #${otId}...`;
        drawerOtPlanta.textContent = '-';
        drawerOtEdificio.textContent = '-';
        drawerOtUbicacion.textContent = '-';
        drawerOtEstado.textContent = '-';
        drawerOtEstado.className = 'status-badge';
        drawerOtDescripcion.textContent = '';
        drawerOtPrioridad.textContent = '-';
        drawerOtReportado.textContent = '-';
        drawerOtCreacion.textContent = '-';
        drawerOtTecnico.textContent = '-';
        drawerOtProgramada.textContent = '-';
        drawerOtActionsContainer.innerHTML = '';
        drawerOtComponentsSection.style.display = 'none';
        drawerOtChecklistSection.style.display = 'none';
        drawerOtPhotosSection.style.display = 'none';
        drawerOtComentariosSection.style.display = 'none';
        drawerOtResolucionSection.style.display = 'none';
        drawerOtResolucion.textContent = '';

        otDrawer.classList.add('open');
        currentOpenOtId = otId;

        // Fetch fresh details from API
        fetch(`/api/ordenes/${otId}?_t=${Date.now()}`)
            .then(res => {
                if (!res.ok) throw new Error("No se pudo cargar la orden");
                return res.json();
            })
            .then(ot => {
                drawerOtTitle.innerHTML = `<span style="font-weight: normal;">#OT-${ot.id}</span> - ${ot.tipo}`;
                drawerOtPlanta.textContent = ot.planta_nombre || 'N/A';
                drawerOtEdificio.textContent = ot.edificio_nombre || 'N/A';
                
                if (ot.ubicacion_nombre) {
                    drawerOtUbicacionContainer.style.display = 'inline-flex';
                    drawerOtUbicacion.textContent = ot.ubicacion_nombre;
                } else {
                    drawerOtUbicacionContainer.style.display = 'none';
                }

                // Status formatting
                let statusLabel = 'Creada';
                let statusClass = 'status-created';
                const isDone = ot.estado === 'REALIZADA' || ot.estado === 'Resuelta';
                const isScheduled = ot.estado === 'PROGRAMADA';
                const isAssigned = ot.estado === 'ASIGNADA';
                const isCreated = ot.estado === 'CREADA';

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

                drawerOtEstado.className = `status-badge ${statusClass}`;
                drawerOtEstado.textContent = statusLabel;

                // Priority
                drawerOtPrioridad.textContent = ot.prioridad || 'Media';
                drawerOtReportado.textContent = ot.reportado_por || 'Sistema';
                
                // Creation Date
                drawerOtCreacion.textContent = new Date(ot.fecha_creacion).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });

                // Tech assigned
                drawerOtTecnico.textContent = ot.tecnico_nombre || 'Sin Asignar';

                // Programmed Date
                let progDateStr = 'Pendiente';
                if (ot.fecha_programada) {
                    const pDate = new Date(ot.fecha_programada);
                    progDateStr = pDate.toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                    const hours = String(pDate.getHours()).padStart(2, '0');
                    const minutes = String(pDate.getMinutes()).padStart(2, '0');
                    const timePart = `${hours}:${minutes}`;
                    if (timePart !== '00:00') {
                        progDateStr += ` a las ${timePart}`;
                    }
                }
                drawerOtProgramada.textContent = progDateStr;

                // Description
                drawerOtDescripcion.textContent = ot.descripcion || 'Sin descripción';

                // Technical Comments / Resolution Notes
                if (ot.comentarios_tecnicos) {
                    drawerOtResolucionSection.style.display = 'block';
                    drawerOtResolucion.textContent = ot.comentarios_tecnicos;
                } else {
                    drawerOtResolucionSection.style.display = 'none';
                    drawerOtResolucion.textContent = '';
                }

                // Actions
                let actionsHtml = '';
                if (!isDone) {
                    const assignLabel = ot.tecnico_nombre ? '🔧 Reasignar / Programar' : '👤 Asignar Técnico';
                    actionsHtml += `
                        <button class="btn-primary" id="drawer-ot-btn-assign" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; background: var(--accent-color); border: 1px solid var(--accent-color); color: white; cursor: pointer; border-radius: 4px; display: flex; align-items: center; gap: 0.25rem;">
                            ${assignLabel}
                        </button>
                    `;
                    
                    if (ot.fecha_inicio) {
                        if (ot.estado_ejecucion === 'PAUSADA' || ot.estado_ejecucion === 'DETENIDA') {
                            actionsHtml += `
                                <button class="btn-primary" id="drawer-ot-btn-resume" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; background: var(--accent-color); border: none; color: white; cursor: pointer; border-radius: 4px; margin-left: 0.25rem;">Retomar</button>
                                <button class="btn-primary" id="drawer-ot-btn-complete" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; background: var(--success); border: none; color: white; cursor: pointer; border-radius: 4px; margin-left: 0.25rem;">Terminar</button>
                            `;
                        } else {
                            actionsHtml += `
                                <button class="btn-secondary" id="drawer-ot-btn-pause" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-color); cursor: pointer; border-radius: 4px; margin-left: 0.25rem;">Pausar</button>
                                <button class="btn-primary" id="drawer-ot-btn-complete" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; background: var(--success); border: none; color: white; cursor: pointer; border-radius: 4px; margin-left: 0.25rem;">Terminar</button>
                            `;
                        }
                    } else {
                        actionsHtml += `
                            <button class="btn-primary" id="drawer-ot-btn-start" style="padding: 0.35rem 0.6rem; font-size: 0.75rem; background: var(--accent-color); border: none; color: white; cursor: pointer; border-radius: 4px; margin-left: 0.25rem;">Iniciar Trabajos</button>
                        `;
                    }
                }
                drawerOtActionsContainer.innerHTML = actionsHtml;

                // Event Listeners for actions
                const btnAssign = document.getElementById('drawer-ot-btn-assign');
                if (btnAssign) {
                    btnAssign.addEventListener('click', () => {
                        openAssignModalDialog(ot.id);
                    });
                }
                const btnStart = document.getElementById('drawer-ot-btn-start');
                if (btnStart) {
                    btnStart.addEventListener('click', () => {
                        startWorkOrder(ot.id);
                    });
                }
                const btnPause = document.getElementById('drawer-ot-btn-pause');
                if (btnPause) {
                    btnPause.addEventListener('click', () => {
                        pauseWorkOrder(ot.id);
                    });
                }
                const btnResume = document.getElementById('drawer-ot-btn-resume');
                if (btnResume) {
                    btnResume.addEventListener('click', () => {
                        resumeWorkOrder(ot.id);
                    });
                }
                const btnComplete = document.getElementById('drawer-ot-btn-complete');
                if (btnComplete) {
                    btnComplete.addEventListener('click', () => {
                        completeWorkOrderDirect(ot.id);
                    });
                }

                // Components Worked (Despieces)
                if (ot.componentes_trabajados && ot.componentes_trabajados.length > 0) {
                    drawerOtComponentsSection.style.display = 'block';
                    drawerOtComponentsList.innerHTML = `
                        <ul style="margin: 0; padding-left: 1rem; list-style-type: disc; display: flex; flex-direction: column; gap: 0.35rem;">
                            ${ot.componentes_trabajados.map(comp => `
                                <li style="font-size: 0.85rem; color: var(--text-main);">
                                    <strong>${comp.nombre}</strong>
                                    ${comp.comentario ? `<span style="color: #cbd5e1; font-style: italic;"> - "${comp.comentario}"</span>` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    `;
                } else {
                    drawerOtComponentsSection.style.display = 'none';
                }

                // Checklist results
                if (isDone && ot.plantilla_id) {
                    drawerOtChecklistSection.style.display = 'block';
                    drawerOtChecklistResults.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Cargando respuestas...</span>';
                    
                    fetch(`/api/ordenes/${ot.id}/respuestas`)
                        .then(res => res.json())
                        .then(respuestas => {
                            if (respuestas.length === 0) {
                                drawerOtChecklistResults.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem;">Sin respuestas registradas.</span>';
                                return;
                            }
                            drawerOtChecklistResults.innerHTML = '';
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
                                
                                drawerOtChecklistResults.innerHTML += `
                                    <div style="border-bottom:1px solid rgba(255,255,255,0.03); padding-bottom:0.4rem; margin-bottom:0.4rem; font-size:0.85rem;">
                                        <div style="font-weight: 600; color: #94a3b8; font-size: 0.8rem;">${r.texto_pregunta}</div>
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.2rem;">
                                            <div>${valStr}</div>
                                            ${r.observacion ? `<span style="font-size:0.78rem; color:var(--warning); font-style:italic;">"${r.observacion}"</span>` : ''}
                                        </div>
                                    </div>
                                `;
                            });
                        })
                        .catch(err => {
                            drawerOtChecklistResults.innerHTML = `<span style="color:var(--danger); font-size:0.85rem;">Error: ${err.message}</span>`;
                        });
                } else {
                    drawerOtChecklistSection.style.display = 'none';
                }

                // Backup Photos
                if (ot.fotos && ot.fotos.length > 0) {
                    drawerOtPhotosSection.style.display = 'block';
                    drawerOtPhotosContainer.innerHTML = ot.fotos.map(f => `
                        <div style="flex: 0 0 80px; cursor: pointer; position: relative;" onclick="window.open('${f.url_foto}', '_blank')">
                            <img src="${f.url_foto}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" title="${f.comentario || ''}">
                            ${f.comentario ? `<div style="font-size: 0.65rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; margin-top: 0.15rem;">${f.comentario}</div>` : ''}
                        </div>
                    `).join('');
                } else {
                    drawerOtPhotosSection.style.display = 'none';
                }

                // Notes Diary
                if (ot.comentarios_avance && ot.comentarios_avance.length > 0) {
                    drawerOtComentariosSection.style.display = 'block';
                    drawerOtComentariosList.innerHTML = ot.comentarios_avance.map(c => {
                        const cDate = new Date(c.fecha_creacion);
                        const timeStr = cDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
                        const dateStr = cDate.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
                        return `
                            <div style="font-size: 0.85rem; line-height: 1.4; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 0.4rem; margin-bottom: 0.2rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.15rem;">
                                    <strong style="color: var(--accent-color);">${c.autor}</strong>
                                    <span style="color: var(--text-muted); font-size: 0.7rem;">${dateStr} ${timeStr}</span>
                                </div>
                                <div style="color: #cbd5e1;">${c.comentario}</div>
                            </div>
                        `;
                    }).join('');
                } else {
                    drawerOtComentariosSection.style.display = 'none';
                }
            })
            .catch(err => {
                drawerOtTitle.textContent = "Error";
                console.error(err);
            });
    }

    function renderCalendarView(filteredOts, targetGrid) {
        targetGrid.innerHTML = '';
        
        // Define calendar layout container
        const layout = document.createElement('div');
        layout.className = 'calendar-layout-container';
        
        // Month names in Spanish
        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        
        // Day names in Spanish
        const dayNames = [
            "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
        ];
        
        // Split OTs: scheduled vs unscheduled
        const unscheduledOts = filteredOts.filter(ot => !ot.fecha_programada);
        const scheduledOts = filteredOts.filter(ot => ot.fecha_programada);

        // Priority weights helper
        const getPriorityWeight = (priority) => {
            const p = (priority || '').toLowerCase();
            if (p === 'alta') return 3;
            if (p === 'media') return 2;
            if (p === 'baja') return 1;
            return 0;
        };

        const layoutEvents = (dayOts) => {
            const startHour = 8;
            const endHour = 20;
            const totalMinutes = (endHour - startHour) * 60; // 720 minutes
            
            const timedEvents = [];
            dayOts.forEach(ot => {
                const pDate = new Date(ot.fecha_programada);
                const isAllDay = pDate.getHours() === 0 && pDate.getMinutes() === 0 && pDate.getSeconds() === 0;
                
                if (!isAllDay) {
                    const startMin = (pDate.getHours() - startHour) * 60 + pDate.getMinutes();
                    let endMin = startMin + 60; // default 1 hour duration
                    
                    if (ot.fecha_fin_programada) {
                        const pDateEnd = new Date(ot.fecha_fin_programada);
                        endMin = (pDateEnd.getHours() - startHour) * 60 + pDateEnd.getMinutes();
                    }
                    
                    const clampedStart = Math.max(0, Math.min(totalMinutes - 30, startMin));
                    const clampedEnd = Math.max(clampedStart + 30, Math.min(totalMinutes, endMin));
                    
                    timedEvents.push({
                        ot,
                        startMin: clampedStart,
                        endMin: clampedEnd,
                        col: 0,
                        totalCols: 1
                    });
                }
            });
            
            if (timedEvents.length === 0) return [];
            
            // Sort by start time, then duration descending
            timedEvents.sort((a, b) => a.startMin - b.startMin || (b.endMin - b.startMin) - (a.endMin - a.startMin));
            
            // Assign columns greedily
            const columns = [];
            timedEvents.forEach(evt => {
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                    const lastEvt = columns[i][columns[i].length - 1];
                    if (lastEvt.endMin <= evt.startMin) {
                        columns[i].push(evt);
                        evt.col = i;
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    columns.push([evt]);
                    evt.col = columns.length - 1;
                }
            });
            
            // Determine maximum overlapping column count for each event
            timedEvents.forEach(evt => {
                const overlapping = timedEvents.filter(other => 
                    other.startMin < evt.endMin && other.endMin > evt.startMin
                );
                const maxCol = Math.max(...overlapping.map(o => o.col), 0);
                evt.totalCols = maxCol + 1;
            });
            
            return timedEvents;
        };

        // 1. Sidebar (Unscheduled OTs)
        let sidebarOtsHtml = '';
        if (unscheduledOts.length === 0) {
            sidebarOtsHtml = '<p style="color: var(--text-muted); font-size: 0.85rem; padding: 0.5rem 0; text-align: center;">No hay órdenes sin programar.</p>';
        } else {
            unscheduledOts.forEach(ot => {
                sidebarOtsHtml += `
                    <div class="unscheduled-ot-card priority-${ot.prioridad.toLowerCase()}" data-ot-id="${ot.id}">
                        <div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 0.25rem;">#OT-${ot.id}</div>
                        <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.25rem;">${ot.tipo}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ot.descripcion || 'Sin descripción'}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.7rem; color: var(--text-muted);">${ot.planta_nombre}</span>
                            <button class="btn-primary btn-schedule-ot" data-ot-id="${ot.id}" style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border-radius: 4px; border: none; cursor: pointer; line-height: 1;">Programar</button>
                        </div>
                    </div>
                `;
            });
        }

        const sidebarHtml = `
            <div class="calendar-sidebar">
                <div class="calendar-sidebar-title">
                    <span>📋 Sin Programar</span>
                    <span class="badge" style="background: var(--bg-primary); padding: 0.15rem 0.4rem; border-radius: 10px; font-size: 0.75rem;">${unscheduledOts.length}</span>
                </div>
                <div class="unscheduled-ots-container">
                    ${sidebarOtsHtml}
                </div>
            </div>
        `;

        // Compute title based on sub-view mode
        let titleText = '';
        if (calendarViewSubMode === 'month') {
            titleText = `${monthNames[calendarMonth]} ${calendarYear}`;
        } else if (calendarViewSubMode === 'week') {
            const currentDayOfWeek = calendarCurrentDate.getDay();
            const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
            const mondayDate = new Date(calendarCurrentDate);
            mondayDate.setDate(calendarCurrentDate.getDate() + distanceToMonday);
            
            const weekDays = [];
            for (let i = 0; i < 6; i++) {
                const d = new Date(mondayDate);
                d.setDate(mondayDate.getDate() + i);
                weekDays.push(d);
            }
            
            const startDay = weekDays[0].getDate();
            const startMonthName = monthNames[weekDays[0].getMonth()];
            const endDay = weekDays[5].getDate();
            const endMonthName = monthNames[weekDays[5].getMonth()];
            const weekYear = weekDays[5].getFullYear();
            titleText = `Semana del ${startDay} de ${startMonthName} al ${endDay} de ${endMonthName}, ${weekYear}`;
        } else if (calendarViewSubMode === 'day') {
            const dayName = dayNames[calendarCurrentDate.getDay()];
            const dayNum = calendarCurrentDate.getDate();
            const monthName = monthNames[calendarCurrentDate.getMonth()];
            const yearNum = calendarCurrentDate.getFullYear();
            titleText = `${dayName} ${dayNum} de ${monthName}, ${yearNum}`;
        }

        // 2. Main Calendar Grid Area
        const mainAreaHtml = `
            <div class="calendar-main-area">
                <div class="calendar-navbar" style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <button class="btn-secondary" id="calendar-prev-month" style="padding: 0.4rem 0.6rem; cursor: pointer; background: transparent; border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-main);">◀</button>
                        <button class="btn-secondary" id="calendar-today" style="padding: 0.4rem 0.75rem; cursor: pointer; background: transparent; border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-main); font-weight: 500;">Hoy</button>
                        <button class="btn-secondary" id="calendar-next-month" style="padding: 0.4rem 0.6rem; cursor: pointer; background: transparent; border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-main);">▶</button>
                    </div>
                    <span class="calendar-nav-title" id="calendar-month-title" style="font-weight: bold; font-size: 1.1rem; color: var(--text-main);">${titleText}</span>
                    <div class="calendar-view-toggles" style="display: flex; gap: 0.25rem; background: var(--bg-primary); padding: 0.25rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <button class="btn-calendar-toggle ${calendarViewSubMode === 'day' ? 'active' : ''}" id="calendar-view-day" style="padding: 0.35rem 0.7rem; border: none; background: ${calendarViewSubMode === 'day' ? 'var(--bg-card)' : 'transparent'}; border-radius: 6px; color: var(--text-main); cursor: pointer; font-size: 0.85rem; font-weight: 600; box-shadow: ${calendarViewSubMode === 'day' ? 'var(--shadow-sm)' : 'none'};">Día</button>
                        <button class="btn-calendar-toggle ${calendarViewSubMode === 'week' ? 'active' : ''}" id="calendar-view-week" style="padding: 0.35rem 0.7rem; border: none; background: ${calendarViewSubMode === 'week' ? 'var(--bg-card)' : 'transparent'}; border-radius: 6px; color: var(--text-main); cursor: pointer; font-size: 0.85rem; font-weight: 600; box-shadow: ${calendarViewSubMode === 'week' ? 'var(--shadow-sm)' : 'none'};">Semana</button>
                        <button class="btn-calendar-toggle ${calendarViewSubMode === 'month' ? 'active' : ''}" id="calendar-view-month" style="padding: 0.35rem 0.7rem; border: none; background: ${calendarViewSubMode === 'month' ? 'var(--bg-card)' : 'transparent'}; border-radius: 6px; color: var(--text-main); cursor: pointer; font-size: 0.85rem; font-weight: 600; box-shadow: ${calendarViewSubMode === 'month' ? 'var(--shadow-sm)' : 'none'};">Mes</button>
                    </div>
                </div>
                <div class="calendar-grid-wrapper">
                    <div class="calendar-days-header" id="calendar-grid-days-header" style="${(calendarViewSubMode === 'day' || calendarViewSubMode === 'week') ? 'display: none;' : ''}">
                        <div>Lun</div>
                        <div>Mar</div>
                        <div>Mié</div>
                        <div>Jue</div>
                        <div>Vie</div>
                        <div>Sáb</div>
                    </div>
                    <div class="calendar-grid" id="calendar-grid-cells">
                        <!-- cells will go here -->
                    </div>
                </div>
            </div>
        `;

        layout.innerHTML = sidebarHtml + mainAreaHtml;
        targetGrid.appendChild(layout);

        const cellsContainer = document.getElementById('calendar-grid-cells');

        // 3. Render content based on active sub-view mode
        if (calendarViewSubMode === 'month') {
            cellsContainer.style.display = 'grid';
            cellsContainer.style.gridTemplateColumns = 'repeat(6, minmax(0, 1fr))';
            cellsContainer.style.flexDirection = '';
            cellsContainer.style.gap = '';
            cellsContainer.style.alignItems = '';
            cellsContainer.parentElement.style.display = '';

            const daysHeader = document.getElementById('calendar-grid-days-header');
            if (daysHeader) {
                daysHeader.style.display = 'grid';
                daysHeader.style.gridTemplateColumns = 'repeat(6, minmax(0, 1fr))';
            }

            const allCandidates = [];
            let firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
            let startColumnIndex = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
            let totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
            let totalDaysInPrevMonth = new Date(calendarYear, calendarMonth, 0).getDate();

            // Prev Month padding
            for (let i = startColumnIndex - 1; i >= 0; i--) {
                const prevMonth = calendarMonth === 0 ? 11 : calendarMonth - 1;
                const prevYear = calendarMonth === 0 ? calendarYear - 1 : calendarYear;
                const prevDay = totalDaysInPrevMonth - i;
                
                const today = new Date();
                const isToday = today.getDate() === prevDay && today.getMonth() === prevMonth && today.getFullYear() === prevYear;

                allCandidates.push({
                    day: prevDay,
                    month: prevMonth,
                    year: prevYear,
                    isCurrentMonth: false,
                    isToday: isToday
                });
            }

            // Current Month
            for (let d = 1; d <= totalDaysInMonth; d++) {
                const today = new Date();
                const isToday = today.getDate() === d && today.getMonth() === calendarMonth && today.getFullYear() === calendarYear;

                allCandidates.push({
                    day: d,
                    month: calendarMonth,
                    year: calendarYear,
                    isCurrentMonth: true,
                    isToday: isToday
                });
            }

            // Next Month padding
            let nextMonthDaysCount = 42 - allCandidates.length;
            for (let d = 1; d <= nextMonthDaysCount; d++) {
                const nextMonth = calendarMonth === 11 ? 0 : calendarMonth + 1;
                const nextYear = calendarMonth === 11 ? calendarYear + 1 : calendarYear;
                
                const today = new Date();
                const isToday = today.getDate() === d && today.getMonth() === nextMonth && today.getFullYear() === nextYear;

                allCandidates.push({
                    day: d,
                    month: nextMonth,
                    year: nextYear,
                    isCurrentMonth: false,
                    isToday: isToday
                });
            }

            // Filter out Sundays to render Monday to Saturday only
            const cells = allCandidates.filter(cell => {
                const d = new Date(cell.year, cell.month, cell.day);
                return d.getDay() !== 0;
            });

            // Render cells
            cells.forEach(cell => {
                const cellDiv = document.createElement('div');
                let cellClass = 'calendar-day-cell';
                if (!cell.isCurrentMonth) cellClass += ' other-month';
                if (cell.isToday) cellClass += ' today';
                cellDiv.className = cellClass;
                
                const cellDateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                cellDiv.dataset.date = cellDateStr;

                const dayOts = scheduledOts.filter(ot => {
                    const pDate = new Date(ot.fecha_programada);
                    return pDate.getFullYear() === cell.year &&
                           pDate.getMonth() === cell.month &&
                           pDate.getDate() === cell.day;
                });

                let otTagsHtml = '';
                dayOts.forEach(ot => {
                    const pDate = new Date(ot.fecha_programada);
                    let timeStr = '';
                    if (pDate.getHours() !== 0 || pDate.getMinutes() !== 0) {
                        timeStr = ` <span style="font-weight: 600; font-size: 0.75rem; opacity: 0.85;">(${String(pDate.getHours()).padStart(2, '0')}:${String(pDate.getMinutes()).padStart(2, '0')})</span>`;
                    }
                    otTagsHtml += `
                        <div class="calendar-ot-tag priority-${ot.prioridad.toLowerCase()}" data-ot-id="${ot.id}">
                            <div class="ot-tag-id">#OT-${ot.id}${timeStr}</div>
                            <div class="ot-tag-desc">${ot.tipo}: ${ot.descripcion || ''}</div>
                        </div>
                    `;
                });

                cellDiv.innerHTML = `
                    <span class="day-number-label">${cell.day}</span>
                    <div class="calendar-ot-list">
                        ${otTagsHtml}
                    </div>
                `;
                
                cellsContainer.appendChild(cellDiv);

                // Click listener on cell for new OT
                cellDiv.addEventListener('click', (e) => {
                    if (e.target.closest('.calendar-ot-tag') || e.target.closest('.day-number-label')) return;
                    openNewOTModal(cellDateStr);
                });

                // day label button to switch to day view
                const dayLabel = cellDiv.querySelector('.day-number-label');
                if (dayLabel) {
                    dayLabel.style.cursor = 'pointer';
                    dayLabel.addEventListener('click', (e) => {
                        e.stopPropagation();
                        calendarCurrentDate = new Date(cell.year, cell.month, cell.day);
                        calendarViewSubMode = 'day';
                        loadWorkOrders();
                    });
                }
            });

        } else if (calendarViewSubMode === 'week') {
            cellsContainer.style.display = 'block';
            cellsContainer.style.flexDirection = '';
            cellsContainer.style.gap = '';
            cellsContainer.style.alignItems = '';
            cellsContainer.parentElement.style.display = '';

            const currentDayOfWeek = calendarCurrentDate.getDay();
            const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
            const mondayDate = new Date(calendarCurrentDate);
            mondayDate.setDate(calendarCurrentDate.getDate() + distanceToMonday);

            const weekDays = [];
            for (let i = 0; i < 6; i++) { // Monday to Saturday (6 days)
                const d = new Date(mondayDate);
                d.setDate(mondayDate.getDate() + i);
                weekDays.push(d);
            }

            const headersListHtml = [];
            const allDayColsHtml = [];
            const timedColsHtml = [];
            
            weekDays.forEach(d => {
                const isToday = d.getDate() === new Date().getDate() && 
                                d.getMonth() === new Date().getMonth() && 
                                d.getFullYear() === new Date().getFullYear();
                                
                const cellDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                
                const dayOts = scheduledOts.filter(ot => {
                    const pDate = new Date(ot.fecha_programada);
                    return pDate.getFullYear() === d.getFullYear() &&
                           pDate.getMonth() === d.getMonth() &&
                           pDate.getDate() === d.getDate();
                });
                
                const allDayOts = dayOts.filter(ot => {
                    const pDate = new Date(ot.fecha_programada);
                    return pDate.getHours() === 0 && pDate.getMinutes() === 0 && pDate.getSeconds() === 0;
                });
                
                const timedLayoutEvents = layoutEvents(dayOts);
                const formattedDayName = dayNames[d.getDay()].substring(0, 3);
                
                // 1. Header Box
                headersListHtml.push(`
                    <div style="flex: 1; min-width: 140px; text-align: center; padding: 0.5rem; border-right: 1px solid var(--border-color); background: ${isToday ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)'}; box-sizing: border-box; ${isToday ? 'border-bottom: 2px solid var(--primary-color);' : ''}">
                        <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted);">${formattedDayName}</div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: ${isToday ? 'var(--primary-color)' : 'var(--text-main)'};">${d.getDate()}</div>
                    </div>
                `);
                
                // 2. All Day Box
                let allDayHtml = '';
                if (allDayOts.length > 0) {
                    allDayOts.forEach(ot => {
                        allDayHtml += `
                            <div class="calendar-ot-tag priority-${ot.prioridad.toLowerCase()}" data-ot-id="${ot.id}" style="margin: 2px 0;">
                                <div class="ot-tag-id">#OT-${ot.id}</div>
                                <div class="ot-tag-desc">${ot.tipo}: ${ot.descripcion || ''}</div>
                            </div>
                        `;
                    });
                } else {
                    allDayHtml = `<div style="font-size: 0.65rem; color: var(--text-muted); font-style: italic; text-align: center; padding: 4px 0;">Sin programar</div>`;
                }
                
                allDayColsHtml.push(`
                    <div style="flex: 1; min-width: 140px; padding: 4px; border-right: 1px solid var(--border-color); background: var(--bg-card); box-sizing: border-box;">
                        ${allDayHtml}
                    </div>
                `);
                
                // 3. Timed Events Column
                let timedOtsHtml = '';
                timedLayoutEvents.forEach(evt => {
                    const ot = evt.ot;
                    const top = evt.startMin;
                    const height = evt.endMin - evt.startMin;
                    const width = (1 / evt.totalCols) * 100;
                    const left = (evt.col / evt.totalCols) * 100;
                    
                    const pDate = new Date(ot.fecha_programada);
                    const startStr = String(pDate.getHours()).padStart(2, '0') + ':' + String(pDate.getMinutes()).padStart(2, '0');
                    let endStr = '';
                    if (ot.fecha_fin_programada) {
                        const pDateEnd = new Date(ot.fecha_fin_programada);
                        endStr = ' - ' + String(pDateEnd.getHours()).padStart(2, '0') + ':' + String(pDateEnd.getMinutes()).padStart(2, '0');
                    }
                    
                    timedOtsHtml += `
                        <div class="calendar-absolute-ot priority-${ot.prioridad.toLowerCase()}" data-ot-id="${ot.id}" 
                             style="top: ${top}px; height: ${height}px; left: calc(${left}% + 1px); width: calc(${width}% - 2px);">
                            <div class="ot-abs-id">#OT-${ot.id} <span style="font-weight: normal; font-size: 0.6rem; opacity: 0.85;">(${startStr}${endStr})</span></div>
                            <div class="ot-abs-desc">${ot.tipo}: ${ot.descripcion || ''}</div>
                        </div>
                    `;
                });
                
                timedColsHtml.push(`
                    <div class="calendar-timeline-col" data-date="${cellDateStr}">
                        <div class="calendar-events-overlay">
                            ${timedOtsHtml}
                        </div>
                    </div>
                `);
            });
            
            // Build hour labels
            let hourLabelsHtml = '';
            for (let h = 8; h < 20; h++) {
                const label = String(h).padStart(2, '0') + ':00';
                hourLabelsHtml += `<div class="calendar-timeline-hour-label">${label}</div>`;
            }
            
            let gridLinesHtml = '';
            for (let h = 8; h <= 20; h++) {
                gridLinesHtml += `<div class="calendar-grid-line"></div>`;
            }
            
            // Weekly html structure
            const weeklyViewHtml = `
                <div style="display: flex; flex-direction: column; width: 100%; margin-top: 0.5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm);">
                    <!-- Row 1: Headers -->
                    <div style="display: flex; border-bottom: 1px solid var(--border-color);">
                        <div style="width: 60px; flex-shrink: 0; border-right: 1px solid var(--border-color); background: var(--bg-secondary);"></div>
                        <div style="flex: 1; display: flex; overflow-x: auto;">
                            ${headersListHtml.join('')}
                        </div>
                    </div>
                    
                    <!-- Row 2: All Day Section -->
                    <div style="display: flex; border-bottom: 1px solid var(--border-color); min-height: 45px;">
                        <div style="width: 60px; flex-shrink: 0; border-right: 1px solid var(--border-color); background: var(--bg-secondary); padding: 6px; font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-align: center; text-transform: uppercase; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">Todo el día</div>
                        <div style="flex: 1; display: flex; overflow-x: auto;">
                            ${allDayColsHtml.join('')}
                        </div>
                    </div>
                    
                    <!-- Row 3: Hourly Grid -->
                    <div style="display: flex; height: 720px; overflow-y: auto; position: relative;">
                        <!-- Time labels sidebar -->
                        <div class="calendar-timeline-hours">
                            ${hourLabelsHtml}
                        </div>
                        <!-- Day columns and overlays -->
                        <div style="flex: 1; display: flex; position: relative; overflow-x: auto;">
                            <div class="calendar-grid-lines">
                                ${gridLinesHtml}
                            </div>
                            ${timedColsHtml.join('')}
                        </div>
                    </div>
                </div>
            `;
            
            cellsContainer.innerHTML = weeklyViewHtml;

            // Bind click to open edit OT modal for absolute events
            cellsContainer.querySelectorAll('.calendar-absolute-ot').forEach(tag => {
                tag.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const otId = tag.dataset.otId;
                    openEditOTModal(otId);
                });
            });

            // Bind click to open edit OT modal for all-day tags
            cellsContainer.querySelectorAll('.calendar-ot-tag').forEach(tag => {
                tag.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const otId = tag.dataset.otId;
                    openEditOTModal(otId);
                });
            });

            // Bind click to create OT on grid click
            cellsContainer.querySelectorAll('.calendar-events-overlay').forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    if (e.target.closest('.calendar-absolute-ot')) return;
                    
                    const rect = overlay.getBoundingClientRect();
                    const clickY = e.clientY - rect.top;
                    const clickedMinutes = Math.floor(clickY);
                    const clickedHours = 8 + Math.floor(clickedMinutes / 60);
                    const formatHour = String(clickedHours).padStart(2, '0') + ':00';
                    
                    const parentCol = overlay.closest('.calendar-timeline-col');
                    const colDateStr = parentCol.dataset.date;
                    
                    openNewOTModal(colDateStr, formatHour);
                });
            });

        } else if (calendarViewSubMode === 'day') {
            cellsContainer.style.display = 'block';
            cellsContainer.style.flexDirection = '';
            cellsContainer.style.gap = '';
            cellsContainer.style.alignItems = '';
            cellsContainer.parentElement.style.display = '';

            const isToday = calendarCurrentDate.getDate() === new Date().getDate() && 
                            calendarCurrentDate.getMonth() === new Date().getMonth() && 
                            calendarCurrentDate.getFullYear() === new Date().getFullYear();

            const formattedDayName = dayNames[calendarCurrentDate.getDay()];
            const headerHtml = `
                <div style="flex: 1; text-align: left; padding: 0.75rem 1.25rem; background: ${isToday ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-secondary)'}; border-bottom: 2px solid ${isToday ? 'var(--primary-color)' : 'var(--border-color)'}; box-sizing: border-box;">
                    <span style="font-size: 1.2rem; font-weight: 700; color: var(--text-main);">${formattedDayName}</span>
                    <span style="font-size: 1.2rem; font-weight: 700; margin-left: 0.25rem; color: var(--primary-color);">${calendarCurrentDate.getDate()} de ${monthNames[calendarCurrentDate.getMonth()]}</span>
                </div>
            `;
            
            const cellDateStr = `${calendarCurrentDate.getFullYear()}-${String(calendarCurrentDate.getMonth() + 1).padStart(2, '0')}-${String(calendarCurrentDate.getDate()).padStart(2, '0')}`;
            const dayOts = scheduledOts.filter(ot => {
                const pDate = new Date(ot.fecha_programada);
                return pDate.getFullYear() === calendarCurrentDate.getFullYear() &&
                       pDate.getMonth() === calendarCurrentDate.getMonth() &&
                       pDate.getDate() === calendarCurrentDate.getDate();
            });
            
            const allDayOts = dayOts.filter(ot => {
                const pDate = new Date(ot.fecha_programada);
                return pDate.getHours() === 0 && pDate.getMinutes() === 0 && pDate.getSeconds() === 0;
            });
            
            const timedLayoutEvents = layoutEvents(dayOts);
            
            let allDayHtml = '';
            if (allDayOts.length > 0) {
                allDayOts.forEach(ot => {
                    allDayHtml += `
                        <div class="calendar-ot-tag priority-${ot.prioridad.toLowerCase()}" data-ot-id="${ot.id}" style="margin: 2px 0; max-width: 350px;">
                            <div class="ot-tag-id">#OT-${ot.id}</div>
                            <div class="ot-tag-desc">${ot.tipo}: ${ot.descripcion || ''}</div>
                        </div>
                    `;
                });
            } else {
                allDayHtml = `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic; padding: 4px 0;">No hay órdenes sin hora asignada.</div>`;
            }
            
            let timedOtsHtml = '';
            timedLayoutEvents.forEach(evt => {
                const ot = evt.ot;
                const top = evt.startMin;
                const height = evt.endMin - evt.startMin;
                const width = (1 / evt.totalCols) * 100;
                const left = (evt.col / evt.totalCols) * 100;
                
                const pDate = new Date(ot.fecha_programada);
                const startStr = String(pDate.getHours()).padStart(2, '0') + ':' + String(pDate.getMinutes()).padStart(2, '0');
                let endStr = '';
                if (ot.fecha_fin_programada) {
                    const pDateEnd = new Date(ot.fecha_fin_programada);
                    endStr = ' - ' + String(pDateEnd.getHours()).padStart(2, '0') + ':' + String(pDateEnd.getMinutes()).padStart(2, '0');
                }
                
                timedOtsHtml += `
                    <div class="calendar-absolute-ot priority-${ot.prioridad.toLowerCase()}" data-ot-id="${ot.id}" 
                         style="top: ${top}px; height: ${height}px; left: calc(${left}% + 1px); width: calc(${width}% - 2px);">
                        <div class="ot-abs-id">#OT-${ot.id} <span style="font-weight: normal; font-size: 0.65rem; opacity: 0.85;">(${startStr}${endStr})</span></div>
                        <div class="ot-abs-desc" style="-webkit-line-clamp: 4;">${ot.tipo}: ${ot.descripcion || ''}</div>
                    </div>
                `;
            });
            
            let hourLabelsHtml = '';
            for (let h = 8; h < 20; h++) {
                const label = String(h).padStart(2, '0') + ':00';
                hourLabelsHtml += `<div class="calendar-timeline-hour-label">${label}</div>`;
            }
            
            let gridLinesHtml = '';
            for (let h = 8; h <= 20; h++) {
                gridLinesHtml += `<div class="calendar-grid-line"></div>`;
            }
            
            const dailyViewHtml = `
                <div style="display: flex; flex-direction: column; width: 100%; margin-top: 0.5rem; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-sm);">
                    <!-- Row 1: Header -->
                    <div style="display: flex; border-bottom: 1px solid var(--border-color);">
                        <div style="width: 60px; flex-shrink: 0; border-right: 1px solid var(--border-color); background: var(--bg-secondary);"></div>
                        <div style="flex: 1;">
                            ${headerHtml}
                        </div>
                    </div>
                    
                    <!-- Row 2: All Day Section -->
                    <div style="display: flex; border-bottom: 1px solid var(--border-color); min-height: 45px;">
                        <div style="width: 60px; flex-shrink: 0; border-right: 1px solid var(--border-color); background: var(--bg-secondary); padding: 6px; font-size: 0.65rem; color: var(--text-muted); font-weight: 700; text-align: center; text-transform: uppercase; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">Todo el día</div>
                        <div style="flex: 1; padding: 8px 1.25rem; background: var(--bg-card); box-sizing: border-box;">
                            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                ${allDayHtml}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Row 3: Hourly Grid -->
                    <div style="display: flex; height: 720px; overflow-y: auto; position: relative;">
                        <!-- Time labels sidebar -->
                        <div class="calendar-timeline-hours">
                            ${hourLabelsHtml}
                        </div>
                        <!-- Day column and overlays -->
                        <div style="flex: 1; display: flex; position: relative;">
                            <div class="calendar-grid-lines">
                                ${gridLinesHtml}
                            </div>
                            <div class="calendar-timeline-col" data-date="${cellDateStr}" style="flex: 1;">
                                <div class="calendar-events-overlay">
                                    ${timedOtsHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            cellsContainer.innerHTML = dailyViewHtml;

            // Bind click to open edit OT modal for absolute events
            cellsContainer.querySelectorAll('.calendar-absolute-ot').forEach(tag => {
                tag.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const otId = tag.dataset.otId;
                    openEditOTModal(otId);
                });
            });

            // Bind click to open edit OT modal for all-day tags
            cellsContainer.querySelectorAll('.calendar-ot-tag').forEach(tag => {
                tag.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const otId = tag.dataset.otId;
                    openEditOTModal(otId);
                });
            });

            // Bind click to create OT on grid click
            cellsContainer.querySelectorAll('.calendar-events-overlay').forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    if (e.target.closest('.calendar-absolute-ot')) return;
                    
                    const rect = overlay.getBoundingClientRect();
                    const clickY = e.clientY - rect.top;
                    const clickedMinutes = Math.floor(clickY);
                    const clickedHours = 8 + Math.floor(clickedMinutes / 60);
                    const formatHour = String(clickedHours).padStart(2, '0') + ':00';
                    
                    const parentCol = overlay.closest('.calendar-timeline-col');
                    const colDateStr = parentCol.dataset.date;
                    
                    openNewOTModal(colDateStr, formatHour);
                });
            });
        }

        // Add view toggles event listeners
        document.getElementById('calendar-view-day').addEventListener('click', () => {
            calendarViewSubMode = 'day';
            loadWorkOrders();
        });
        document.getElementById('calendar-view-week').addEventListener('click', () => {
            calendarViewSubMode = 'week';
            loadWorkOrders();
        });
        document.getElementById('calendar-view-month').addEventListener('click', () => {
            calendarViewSubMode = 'month';
            loadWorkOrders();
        });

        // Add navbar navigation controls listeners
        document.getElementById('calendar-prev-month').addEventListener('click', () => {
            if (calendarViewSubMode === 'month') {
                if (calendarMonth === 0) {
                    calendarMonth = 11;
                    calendarYear--;
                } else {
                    calendarMonth--;
                }
                calendarCurrentDate = new Date(calendarYear, calendarMonth, 1);
            } else if (calendarViewSubMode === 'week') {
                calendarCurrentDate.setDate(calendarCurrentDate.getDate() - 7);
                calendarYear = calendarCurrentDate.getFullYear();
                calendarMonth = calendarCurrentDate.getMonth();
            } else if (calendarViewSubMode === 'day') {
                calendarCurrentDate.setDate(calendarCurrentDate.getDate() - 1);
                calendarYear = calendarCurrentDate.getFullYear();
                calendarMonth = calendarCurrentDate.getMonth();
            }
            loadWorkOrders();
        });

        document.getElementById('calendar-next-month').addEventListener('click', () => {
            if (calendarViewSubMode === 'month') {
                if (calendarMonth === 11) {
                    calendarMonth = 0;
                    calendarYear++;
                } else {
                    calendarMonth++;
                }
                calendarCurrentDate = new Date(calendarYear, calendarMonth, 1);
            } else if (calendarViewSubMode === 'week') {
                calendarCurrentDate.setDate(calendarCurrentDate.getDate() + 7);
                calendarYear = calendarCurrentDate.getFullYear();
                calendarMonth = calendarCurrentDate.getMonth();
            } else if (calendarViewSubMode === 'day') {
                calendarCurrentDate.setDate(calendarCurrentDate.getDate() + 1);
                calendarYear = calendarCurrentDate.getFullYear();
                calendarMonth = calendarCurrentDate.getMonth();
            }
            loadWorkOrders();
        });

        document.getElementById('calendar-today').addEventListener('click', () => {
            calendarCurrentDate = new Date();
            calendarYear = calendarCurrentDate.getFullYear();
            calendarMonth = calendarCurrentDate.getMonth();
            loadWorkOrders();
        });

        // Add details drawer link on OT click
        layout.querySelectorAll('.calendar-ot-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                const otId = tag.dataset.otId;
                openEditOTModal(otId);
            });
        });

        // Add details drawer link on unscheduled card click
        const sidebarContainer = layout.querySelector('.unscheduled-ots-container');
        if (sidebarContainer) {
            sidebarContainer.querySelectorAll('.unscheduled-ot-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    // If schedule button clicked, do not trigger drawer open
                    if (e.target.classList.contains('btn-schedule-ot')) return;
                    const otId = card.dataset.otId;
                    openEditOTModal(otId);
                });
            });

            sidebarContainer.querySelectorAll('.btn-schedule-ot').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const otId = btn.dataset.otId;
                    openAssignModalDialog(otId);
                });
            });
        }
    }

    function loadPlantLocationsDetail(plantaId) {
        const locationsListContainer = document.getElementById('plant-detail-locations-list');
        if (!locationsListContainer) return;

        locationsListContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Cargando ubicaciones...</p>';

        // 1. Fetch buildings for this plant
        fetch(`/api/plantas/${plantaId}/edificios`)
            .then(res => res.json())
            .then(async edificios => {
                locationsListContainer.innerHTML = '';
                if (edificios.length === 0) {
                    locationsListContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Sin edificios registrados.</p>';
                    return;
                }

                // 2. Fetch locations for each building in parallel
                const promises = edificios.map(e => 
                    fetch(`/api/edificios/${e.id}/ubicaciones`)
                        .then(res => res.json())
                        .then(ubicaciones => ({ building: e, locations: ubicaciones }))
                );

                const results = await Promise.all(promises);

                results.forEach(({ building, locations }) => {
                    // Create building section container
                    const bSection = document.createElement('div');
                    bSection.className = 'building-location-group';
                    bSection.style.marginBottom = '1.25rem';
                    bSection.style.display = 'flex';
                    bSection.style.flexDirection = 'column';
                    bSection.style.gap = '0.5rem';

                    // Building header row with "+ Agregar Ubicación" button
                    const bHeader = document.createElement('div');
                    bHeader.style.display = 'flex';
                    bHeader.style.justifyContent = 'space-between';
                    bHeader.style.alignItems = 'center';
                    bHeader.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
                    bHeader.style.paddingBottom = '0.25rem';

                    bHeader.innerHTML = `
                        <strong style="color: var(--accent-color); font-size: 0.9rem; display: flex; align-items: center; gap: 0.25rem;">
                            🏢 ${building.nombre}
                        </strong>
                        <button class="btn-secondary btn-add-loc-trigger" data-building-id="${building.id}" style="padding: 0.2rem 0.45rem; font-size: 0.72rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--accent-color); cursor: pointer; display: flex; align-items: center; gap: 0.2rem;">
                            ➕ Agregar
                        </button>
                    `;
                    bSection.appendChild(bHeader);

                    // Locations list under this building
                    const locsWrapper = document.createElement('div');
                    locsWrapper.style.display = 'flex';
                    locsWrapper.style.flexDirection = 'column';
                    locsWrapper.style.gap = '0.4rem';
                    locsWrapper.style.paddingLeft = '0.5rem';

                    if (locations.length === 0) {
                        locsWrapper.innerHTML = '<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic; padding: 0.2rem 0;">Sin ubicaciones</span>';
                    } else {
                        locations.forEach(u => {
                            const uRow = document.createElement('div');
                            uRow.style.display = 'flex';
                            uRow.style.justifyContent = 'space-between';
                            uRow.style.alignItems = 'center';
                            uRow.style.padding = '0.35rem 0.5rem';
                            uRow.style.borderRadius = '4px';
                            uRow.style.background = 'rgba(255,255,255,0.01)';
                            uRow.style.border = '1px solid rgba(255,255,255,0.02)';

                            // Determine display name (with occupants if any)
                            let displayName = u.nombre;
                            if (u.ocupantes && u.ocupantes.length > 0) {
                                const names = u.ocupantes.map(o => o.nombre).join(', ');
                                displayName = `${u.nombre} <span style="font-size: 0.72rem; color: var(--success); font-weight: normal;">(${names})</span>`;
                            }

                            uRow.innerHTML = `
                                <span style="font-size: 0.8rem; color: var(--text-color); font-weight: 500;">
                                    📍 ${displayName}
                                </span>
                                <div style="display: flex; gap: 0.4rem;">
                                    <button class="btn-secondary btn-edit-loc-trigger" data-loc-id="${u.id}" style="padding: 0.2rem 0.45rem; font-size: 0.72rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-muted); cursor: pointer; display: flex; align-items: center; gap: 0.2rem;">
                                        ✏️ Editar
                                    </button>
                                    <button class="btn-secondary btn-create-ot-loc-trigger" data-plant-id="${plantaId}" data-building-id="${building.id}" data-loc-id="${u.id}" style="padding: 0.2rem 0.45rem; font-size: 0.72rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--accent-color); cursor: pointer; display: flex; align-items: center; gap: 0.2rem;">
                                        🛠️ Crear OT
                                    </button>
                                </div>
                            `;
                            locsWrapper.appendChild(uRow);

                            // Event listener to rename location
                            uRow.querySelector('.btn-edit-loc-trigger').addEventListener('click', (e) => {
                                e.stopPropagation();
                                const newName = prompt("Introduce el nuevo nombre para la ubicación:", u.nombre);
                                if (!newName || newName.trim() === "" || newName.trim() === u.nombre) return;

                                fetch(`/api/ubicaciones/${u.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        id: u.id,
                                        nombre: newName.trim(),
                                        edificio_id: building.id
                                    })
                                })
                                .then(res => {
                                    if (!res.ok) throw new Error('Error al renombrar la ubicación');
                                    return res.json();
                                })
                                .then(data => {
                                    alert(`Ubicación renombrada a "${data.nombre}" con éxito.`);
                                    loadPlantLocationsDetail(plantaId);
                                    preloadSearchList();
                                    loadHierarchy();
                                })
                                .catch(err => alert(err.message));
                            });

                            // Event listener to open OT creation modal pre-selecting this location!
                            uRow.querySelector('.btn-create-ot-loc-trigger').addEventListener('click', (e) => {
                                e.stopPropagation();
                                openNewOTModalForAsset(plantaId, building.id, u.id, null);
                            });
                        });
                    }

                    bSection.appendChild(locsWrapper);
                    locationsListContainer.appendChild(bSection);

                    // Event listener to add location
                    bHeader.querySelector('.btn-add-loc-trigger').addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Call openLocationModalDirect but override reload behavior to update our list!
                        const buildingId = building.id;
                        const name = prompt("Introduce el nombre de la nueva ubicación / sala:");
                        if (!name || name.trim() === "") return;

                        fetch('/api/ubicaciones', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                nombre: name.trim(),
                                edificio_id: buildingId
                            })
                        })
                        .then(res => {
                            if (!res.ok) throw new Error('Error al guardar la ubicación');
                            return res.json();
                        })
                        .then(data => {
                            alert(`Ubicación "${data.nombre}" creada con éxito.`);
                            // Reload local list and search list
                            loadPlantLocationsDetail(plantaId);
                            preloadSearchList();
                            // Also reload main sidebar hierarchy in case it's loaded
                            loadHierarchy();
                        })
                        .catch(err => alert(err.message));
                    });
                });
            })
            .catch(err => {
                console.error(err);
                locationsListContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Error al cargar ubicaciones.</p>';
            });
    }

    function renderPlantDetail(plantName) {
        currentSelectedPlantName = plantName;
        if (plantDetailTitle) {
            plantDetailTitle.textContent = `Órdenes de Trabajo en ${plantName}`;
        }
        
        // Find plant and load locations reactively
        fetch('/api/plantas')
            .then(res => res.json())
            .then(plantas => {
                const targetPlant = plantas.find(p => p.nombre === plantName);
                if (targetPlant) {
                    loadPlantLocationsDetail(targetPlant.id);
                }
            })
            .catch(err => console.error('Error al obtener plantas para vista detalle:', err));
        
        const filteredOts = allLoadedOts.filter(ot => ot.planta_nombre === plantName);
        
        if (plantOtGrid) {
            if (currentPlantViewMode === 'flat') {
                plantOtGrid.style.display = 'grid';
                plantOtGrid.style.flexDirection = '';
                plantOtGrid.style.gap = '1.25rem';
                plantOtGrid.style.overflowX = '';
                renderWorkOrders(filteredOts, plantOtGrid);
            } else if (currentPlantViewMode === 'type') {
                plantOtGrid.style.display = 'flex';
                plantOtGrid.style.flexDirection = 'row';
                plantOtGrid.style.gap = '1.25rem';
                plantOtGrid.style.overflowX = 'auto';
                renderTypeGroupedView(filteredOts, plantOtGrid);
            } else if (currentPlantViewMode === 'building') {
                plantOtGrid.style.display = 'flex';
                plantOtGrid.style.flexDirection = 'column';
                plantOtGrid.style.gap = '2rem';
                plantOtGrid.style.overflowX = '';
                renderBuildingGroupedView(filteredOts, plantOtGrid);
            }
        }
    }

    // Click handlers for plant overview cards
    document.querySelectorAll('.plant-kpi-card').forEach(card => {
        card.addEventListener('click', () => {
            const plantName = card.getAttribute('data-planta-nombre');
            if (plantSummaryView) plantSummaryView.style.display = 'none';
            if (plantDetailView) plantDetailView.style.display = 'block';
            
            if (currentPlantViewMode === 'flat') setActiveViewButton(btnPlantViewFlat);
            else if (currentPlantViewMode === 'building') setActiveViewButton(btnPlantViewBuilding);
            else if (currentPlantViewMode === 'type') setActiveViewButton(btnPlantViewType);
            
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

    // Layout selectors listeners
    if (btnPlantViewFlat) {
        btnPlantViewFlat.addEventListener('click', () => {
            currentPlantViewMode = 'flat';
            setActiveViewButton(btnPlantViewFlat);
            if (currentSelectedPlantName) {
                renderPlantDetail(currentSelectedPlantName);
            }
        });
    }
    if (btnPlantViewBuilding) {
        btnPlantViewBuilding.addEventListener('click', () => {
            currentPlantViewMode = 'building';
            setActiveViewButton(btnPlantViewBuilding);
            if (currentSelectedPlantName) {
                renderPlantDetail(currentSelectedPlantName);
            }
        });
    }
    if (btnPlantViewType) {
        btnPlantViewType.addEventListener('click', () => {
            currentPlantViewMode = 'type';
            setActiveViewButton(btnPlantViewType);
            if (currentSelectedPlantName) {
                renderPlantDetail(currentSelectedPlantName);
            }
        });
    }

    if (btnOtViewFlat) {
        btnOtViewFlat.addEventListener('click', () => {
            currentOtViewMode = 'flat';
            setActiveOtViewButton(btnOtViewFlat);
            loadWorkOrders();
        });
    }
    if (btnOtViewBuilding) {
        btnOtViewBuilding.addEventListener('click', () => {
            currentOtViewMode = 'building';
            setActiveOtViewButton(btnOtViewBuilding);
            loadWorkOrders();
        });
    }
    if (btnOtViewType) {
        btnOtViewType.addEventListener('click', () => {
            currentOtViewMode = 'type';
            setActiveOtViewButton(btnOtViewType);
            loadWorkOrders();
        });
    }
    if (btnOtViewCalendar) {
        btnOtViewCalendar.addEventListener('click', () => {
            currentOtViewMode = 'calendar';
            setActiveOtViewButton(btnOtViewCalendar);
            loadWorkOrders();
        });
    }

    filterOtState.addEventListener('change', loadWorkOrders);
    if (searchOt) {
        searchOt.addEventListener('input', loadWorkOrders);
    }
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

                        let locHierarchyStr = '';
                        if (a.planta_nombre && a.edificio_nombre && a.ubicacion_nombre) {
                            locHierarchyStr = `${a.planta_nombre} / ${a.edificio_nombre} / ${a.ubicacion_nombre}`;
                        } else if (a.edificio_nombre && a.ubicacion_nombre) {
                            locHierarchyStr = `${a.edificio_nombre} / ${a.ubicacion_nombre}`;
                        } else if (a.ubicacion_nombre) {
                            locHierarchyStr = a.ubicacion_nombre;
                        } else {
                            locHierarchyStr = 'Sin ubicación';
                        }

                        const card = document.createElement('div');
                        card.className = cardClass;
                        card.innerHTML = `
                            <h4 class="entity-title" style="margin-bottom:0.15rem; font-size:0.95rem;">${a.nombre}</h4>
                            <div style="font-size:0.72rem; color: var(--text-muted); margin-bottom: 0.4rem; font-style: italic; white-space: normal; word-break: break-word; line-height: 1.2;" title="${locHierarchyStr}">
                                📍 ${locHierarchyStr}
                            </div>
                            <div class="entity-meta">
                                <div class="meta-row">
                                    <span style="font-size:0.8rem; color: var(--text-muted);">Marca/Mod: <strong>${a.marca || 'S/M'} / ${a.modelo || 'S/M'}</strong></span>
                                </div>
                                <div class="meta-row" style="justify-content: space-between; margin-top: 0.5rem; align-items: center;">
                                    <span class="status-badge ${statusBadgeClass}" style="padding: 0.15rem 0.45rem; font-size: 0.75rem;">${a.estado}</span>
                                    <span style="font-size: 0.75rem; color: var(--accent-color); font-weight: 600;">Ficha (${a.cantidad_despiece || 0}) &gt;</span>
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

    if (closeOtDrawer) {
        closeOtDrawer.addEventListener('click', () => {
            otDrawer.classList.remove('open');
        });
    }

    // Helper to open New OT Modal pre-filled for a specific asset
    function openNewOTModalForAsset(plantaId, edificioId, ubicacionId, activoId) {
        resetOtComponents();

        const otUbicacion = document.getElementById('ot-select-ubicacion');
        const otULabel = document.querySelector('label[for="ot-select-ubicacion"]');
        if (otULabel && otUbicacion) {
            otUbicacion.required = false;
            otULabel.innerHTML = 'Ubicación (Opcional)';
        }

        // Close drawers
        assetDrawer.classList.remove('open');
        if (otDrawer) otDrawer.classList.remove('open');

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
                
                if (ubicacionId) {
                    otUbicacion.value = ubicacionId;
                    // Load assets for this location
                    return fetch(`/api/activos?ubicacion_id=${ubicacionId}`);
                } else {
                    otUbicacion.value = '';
                    otActivo.innerHTML = '<option value="">Selecciona ubicación...</option>';
                    otActivo.disabled = true;
                    return [];
                }
            })
            .then(resOrActivos => {
                if (resOrActivos && typeof resOrActivos.json === 'function') {
                    return resOrActivos.json();
                }
                return resOrActivos;
            })
            .then(activos => {
                if (ubicacionId) {
                    otActivo.disabled = false;
                    otActivo.innerHTML = '<option value="">-- Selecciona Activo (Opcional) --</option>';
                    const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo' && a.estado !== 'Limpieza DB');
                    activeActivos.forEach(a => {
                        otActivo.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
                    });
                    otActivo.value = activoId || '';
                    
                    // Trigger change to load components!
                    if (activoId) {
                        otActivo.dispatchEvent(new Event('change'));
                    }
                } else {
                    otActivo.innerHTML = '<option value="">Selecciona ubicación...</option>';
                    otActivo.disabled = true;
                }

                // Load technicians in assignment checkboxes container
                const otTecnicosContainer = document.getElementById('ot-tecnicos-container');
                if (otTecnicosContainer) {
                    otTecnicosContainer.innerHTML = '';
                    techniciansList.forEach(t => {
                        otTecnicosContainer.innerHTML += `
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal; margin-bottom: 0.15rem; cursor: pointer;">
                                <input type="checkbox" name="ot-tecnicos" value="${t.id}">
                                <span>${t.nombre}</span>
                            </label>
                        `;
                    });
                }

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
                        
                        if (uId) {
                            displayAssignedLocationInAssetModal(uId);
                        } else {
                            document.getElementById('asset-assigned-location-container').style.display = 'none';
                        }
                        
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
                if (assignSelectTecnicosContainer) {
                    assignSelectTecnicosContainer.innerHTML = '';
                    tecnicos.forEach(t => {
                        assignSelectTecnicosContainer.innerHTML += `
                            <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal; margin-bottom: 0.15rem; cursor: pointer;">
                                <input type="checkbox" name="assign-tecnicos" value="${t.id}">
                                <span>${t.nombre}</span>
                            </label>
                        `;
                    });
                }
            })
            .catch(err => console.error(err));
    }

    // --- 8. ASSIGN TECHNICIAN MODAL ACTIONS ---
    function openAssignModalDialog(otId) {
        assignOtId.value = otId;
        const ot = allLoadedOts.find(o => o.id === parseInt(otId)) || loadedWorkOrdersList.find(o => o.id === parseInt(otId));
        
        const dateInput = document.getElementById('assign-fecha-programada');
        const timeInput = document.getElementById('assign-hora-programada');
        const timeFinInput = document.getElementById('assign-hora-fin-programada');
        
        // Reset and pre-check checkboxes
        const checkboxes = document.querySelectorAll('input[name="assign-tecnicos"]');
        checkboxes.forEach(cb => {
            cb.checked = false;
            const tid = parseInt(cb.value);
            if (ot) {
                if (ot.tecnico_ids && ot.tecnico_ids.includes(tid)) {
                    cb.checked = true;
                } else if (!ot.tecnico_ids && ot.tecnico_id === tid) {
                    cb.checked = true;
                }
            }
        });

        if (ot) {
            if (ot.fecha_programada) {
                const pDate = new Date(ot.fecha_programada);
                const year = pDate.getFullYear();
                const month = String(pDate.getMonth() + 1).padStart(2, '0');
                const day = String(pDate.getDate()).padStart(2, '0');
                dateInput.value = `${year}-${month}-${day}`;
                
                const hours = String(pDate.getHours()).padStart(2, '0');
                const minutes = String(pDate.getMinutes()).padStart(2, '0');
                timeInput.value = `${hours}:${minutes}`;
            } else {
                dateInput.value = '';
                timeInput.value = '';
            }

            if (ot.fecha_fin_programada) {
                const pDateEnd = new Date(ot.fecha_fin_programada);
                const hoursEnd = String(pDateEnd.getHours()).padStart(2, '0');
                const minutesEnd = String(pDateEnd.getMinutes()).padStart(2, '0');
                timeFinInput.value = `${hoursEnd}:${minutesEnd}`;
            } else {
                timeFinInput.value = '';
            }
        } else {
            dateInput.value = '';
            timeInput.value = '';
            timeFinInput.value = '';
        }
        assignModal.style.display = 'flex';
    }

    closeAssignModal.addEventListener('click', () => {
        assignModal.style.display = 'none';
    });

    assignForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otId = assignOtId.value;
        
        const checkedBoxes = document.querySelectorAll('input[name="assign-tecnicos"]:checked');
        const selectedTechIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
        
        const fechaProgramadaVal = document.getElementById('assign-fecha-programada').value || null;
        const horaProgramadaVal = document.getElementById('assign-hora-programada').value || '';
        const horaFinProgramadaVal = document.getElementById('assign-hora-fin-programada').value || '';

        if (fechaProgramadaVal && horaProgramadaVal && horaFinProgramadaVal) {
            if (horaFinProgramadaVal < horaProgramadaVal) {
                alert("La hora de término no puede ser anterior a la hora de inicio.");
                return;
            }
        }

        let fullFechaProgramada = fechaProgramadaVal;
        if (fechaProgramadaVal) {
            fullFechaProgramada = fechaProgramadaVal + 'T' + (horaProgramadaVal || '00:00') + ':00';
        }

        let fullFechaFinProgramada = null;
        if (fechaProgramadaVal && horaFinProgramadaVal) {
            fullFechaFinProgramada = fechaProgramadaVal + 'T' + horaFinProgramadaVal + ':00';
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
        if (selectedTechIds.length > 0) {
            targetState = fechaProgramadaVal ? 'PROGRAMADA' : 'ASIGNADA';
        }

        fetch(`/api/ordenes/${otId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tecnico_ids: selectedTechIds,
                fecha_programada: fullFechaProgramada,
                fecha_fin_programada: fullFechaFinProgramada,
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

    const btnSubmitOtCompleteAndNew = document.getElementById('btn-submit-ot-complete-and-new');
    if (btnSubmitOtCompleteAndNew) {
        btnSubmitOtCompleteAndNew.addEventListener('click', () => {
            shouldCreateAnotherOtAfterComplete = true;
            otCompleteForm.requestSubmit();
        });
    }

    const btnSubmitOtComplete = document.getElementById('btn-submit-ot-complete');
    if (btnSubmitOtComplete) {
        btnSubmitOtComplete.addEventListener('click', () => {
            shouldCreateAnotherOtAfterComplete = false;
        });
    }

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
        .then((updatedOt) => {
            otCompleteModal.style.display = 'none';
            loadKPIs();
            loadWorkOrders();

            if (shouldCreateAnotherOtAfterComplete) {
                shouldCreateAnotherOtAfterComplete = false;
                if (updatedOt && updatedOt.planta_id && updatedOt.edificio_id) {
                    openNewOTModalForAsset(
                        updatedOt.planta_id,
                        updatedOt.edificio_id,
                        updatedOt.ubicacion_id || null,
                        updatedOt.activo_id || null
                    );
                }
            }
        })
        .catch(err => alert(err.message));
    });    // --- 9. MANUAL OT CREATION MODAL ---
    function updateUbicacionRequirement(isNZ, uSelect, uLabel) {
        if (!uSelect || !uLabel) return;
        uSelect.required = false;
        if (isNZ) {
            uLabel.innerHTML = 'Ubicación (Opcional)';
            uSelect.disabled = false;
            uSelect.innerHTML = '<option value="">-- No requerido para NZ --</option>';
        } else {
            uLabel.innerHTML = 'Ubicación (Opcional)';
        }
    }
    function openNewOTModal(prefilledDate = null, prefilledTime = null) {
        // Clear search inputs
        const otSearchInput = document.getElementById('ot-search-location');
        const otSearchResults = document.getElementById('ot-search-location-results');
        if (otSearchInput) otSearchInput.value = '';
        if (otSearchResults) {
            otSearchResults.style.display = 'none';
            otSearchResults.innerHTML = '';
        }

        resetOtComponents();

        // Reset custom checklist items
        customChecklistItems = [];
        const otNewPointText = document.getElementById('ot-new-point-text');
        const otNewPointType = document.getElementById('ot-new-point-type');
        const otNewPointUnit = document.getElementById('ot-new-point-unit');
        if (otNewPointText) otNewPointText.value = '';
        if (otNewPointType) otNewPointType.value = 'booleano';
        if (otNewPointUnit) {
            otNewPointUnit.value = '';
            otNewPointUnit.style.display = 'none';
        }
        renderCustomChecklistItems();

        const otPlanta = document.getElementById('ot-select-planta');
        const otEdificio = document.getElementById('ot-select-edificio');
        const otUbicacion = document.getElementById('ot-select-ubicacion');
        const otActivo = document.getElementById('ot-select-activo');
        const otULabel = document.querySelector('label[for="ot-select-ubicacion"]');

        // Reset required
        updateUbicacionRequirement(false, otUbicacion, otULabel);

        // Handle date pre-filling
        const otFechaProgramada = document.getElementById('ot-fecha-programada');
        const otHoraProgramada = document.getElementById('ot-hora-programada');
        const otHoraFinProgramada = document.getElementById('ot-hora-fin-programada');
        if (prefilledDate) {
            otFechaProgramada.value = prefilledDate;
            otHoraProgramada.value = prefilledTime || '08:00';
            if (prefilledTime) {
                const parts = prefilledTime.split(':');
                const hour = parseInt(parts[0]);
                const nextHour = (hour + 1) % 24;
                otHoraFinProgramada.value = String(nextHour).padStart(2, '0') + ':' + parts[1];
            } else {
                otHoraFinProgramada.value = '09:00';
            }
        } else {
            otFechaProgramada.value = '';
            otHoraProgramada.value = '';
            otHoraFinProgramada.value = '';
        }        // Clear checklist template selector dropdown
        const otSelectPlantilla = document.getElementById('ot-select-plantilla');
        otSelectPlantilla.innerHTML = '<option value="">Cargando...</option>';

        // Load technicians in assignment checkboxes container
        const otTecnicosContainer = document.getElementById('ot-tecnicos-container');
        if (otTecnicosContainer) {
            otTecnicosContainer.innerHTML = '';
            techniciansList.forEach(t => {
                otTecnicosContainer.innerHTML += `
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal; margin-bottom: 0.15rem; cursor: pointer;">
                        <input type="checkbox" name="ot-tecnicos" value="${t.id}">
                        <span>${t.nombre}</span>
                    </label>
                `;
            });
        }

        // Load checklists in template selector dropdown
        fetch('/api/plantillas')
            .then(res => res.json())
            .then(plantasChecklist => {
                otSelectPlantilla.innerHTML = '<option value="">-- Sin plantilla / Pauta estándar --</option>';
                plantasChecklist.forEach(p => {
                    otSelectPlantilla.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
                });
            })
            .catch(err => console.error('Error al cargar plantillas:', err));

        // Load Plants in form dropdown
        fetch('/api/plantas')
            .then(res => res.json())
            .then(plantas => {
                otPlanta.innerHTML = '<option value="">-- Selecciona Planta --</option>';
                plantas.forEach(p => {
                    otPlanta.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
                });
                
                if (selectedPlantaId) {
                    otPlanta.value = selectedPlantaId;
                    
                    // Load buildings
                    otEdificio.disabled = false;
                    otEdificio.innerHTML = '<option value="">Cargando edificios...</option>';
                    return fetch(`/api/plantas/${selectedPlantaId}/edificios`);
                } else {
                    otEdificio.innerHTML = '<option value="">Selecciona planta...</option>';
                    otEdificio.disabled = true;
                    otUbicacion.innerHTML = '<option value="">Selecciona edificio...</option>';
                    otUbicacion.disabled = true;
                    otActivo.innerHTML = '<option value="">Selecciona ubicación...</option>';
                    otActivo.disabled = true;
                    throw new Error('no_selection'); // break promise chain cleanly
                }
            })
            .then(res => res.json())
            .then(edificios => {
                otEdificio.innerHTML = '<option value="">-- Selecciona --</option>';
                edificios.forEach(b => {
                    otEdificio.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
                });
                
                if (selectedEdificioId) {
                    otEdificio.value = selectedEdificioId;
                    
                    const selectedEd = edificios.find(b => b.id === selectedEdificioId);
                    const isNZ = selectedEd && selectedEd.nombre === 'NZ';
                    const otULabel = document.querySelector('label[for="ot-select-ubicacion"]');
                    if (isNZ) {
                        updateUbicacionRequirement(true, otUbicacion, otULabel);
                        throw new Error('no_selection');
                    } else {
                        updateUbicacionRequirement(false, otUbicacion, otULabel);
                        // Load locations
                        otUbicacion.disabled = false;
                        otUbicacion.innerHTML = '<option value="">Cargando ubicaciones...</option>';
                        return fetch(`/api/edificios/${selectedEdificioId}/ubicaciones`);
                    }
                } else {
                    otUbicacion.innerHTML = '<option value="">Selecciona edificio...</option>';
                    otUbicacion.disabled = true;
                    otActivo.innerHTML = '<option value="">Selecciona ubicación...</option>';
                    otActivo.disabled = true;
                    throw new Error('no_selection');
                }
            })
            .then(res => res.json())
            .then(ubicaciones => {
                otUbicacion.innerHTML = '<option value="">-- Selecciona --</option>';
                ubicaciones.forEach(u => {
                    otUbicacion.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
                });
                
                if (selectedUbicacionId) {
                    otUbicacion.value = selectedUbicacionId;
                    
                    // Load assets
                    otActivo.disabled = false;
                    otActivo.innerHTML = '<option value="">Cargando activos...</option>';
                    return fetch(`/api/activos?ubicacion_id=${selectedUbicacionId}`);
                } else {
                    otActivo.innerHTML = '<option value="">Selecciona ubicación...</option>';
                    otActivo.disabled = true;
                    throw new Error('no_selection');
                }
            })
            .then(res => res.json())
            .then(activos => {
                otActivo.disabled = false;
                otActivo.innerHTML = '<option value="">-- Selecciona Activo (Opcional) --</option>';
                const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo' && a.estado !== 'Limpieza DB');
                activeActivos.forEach(a => {
                    otActivo.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
                });
            })
            .catch(err => {
                if (err.message !== 'no_selection') {
                    console.error('Error pre-filling dropdowns:', err);
                }
            })
            .finally(() => {
                otModal.style.display = 'flex';
            });
    }

    btnCreateOt.addEventListener('click', () => {
        openNewOTModal();
    });
    closeOtModal.addEventListener('click', () => {
        otModal.style.display = 'none';
    });

    function resetOtComponents() {
        const container = document.getElementById('ot-components-container');
        if (container) container.style.display = 'none';
        const listDiv = document.getElementById('ot-components-list');
        if (listDiv) listDiv.innerHTML = '';
    }

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
        resetOtComponents();

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
        const uLabel = document.querySelector('label[for="ot-select-ubicacion"]');

        uSelect.innerHTML = '<option value="">Selecciona ubicación...</option>';
        uSelect.disabled = true;
        aSelect.innerHTML = '<option value="">Selecciona ubicación...</option>';
        aSelect.disabled = true;
        resetOtComponents();

        if (!edificioId) return;

        const isNZ = e.target.options[e.target.selectedIndex].text.trim() === 'NZ';
        updateUbicacionRequirement(isNZ, uSelect, uLabel);

        if (!isNZ) {
            fetch(`/api/edificios/${edificioId}/ubicaciones`)
                .then(res => res.json())
                .then(ubicaciones => {
                    uSelect.disabled = false;
                    uSelect.innerHTML = '<option value="">-- Selecciona --</option>';
                    ubicaciones.forEach(u => {
                        uSelect.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
                    });
                });
        }
    });

    document.getElementById('ot-select-ubicacion').addEventListener('change', (e) => {
        const ubicacionId = e.target.value;
        const aSelect = document.getElementById('ot-select-activo');

        aSelect.innerHTML = '<option value="">Selecciona activo...</option>';
        aSelect.disabled = true;
        resetOtComponents();

        if (!ubicacionId) return;

        fetch(`/api/activos?ubicacion_id=${ubicacionId}`)
            .then(res => res.json())
            .then(activos => {
                aSelect.disabled = false;
                aSelect.innerHTML = '<option value="">-- Selecciona Activo (Opcional) --</option>';
                const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo' && a.estado !== 'Limpieza DB');
                activeActivos.forEach(a => {
                    aSelect.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
                });
            });
    });

    document.getElementById('ot-select-activo').addEventListener('change', (e) => {
        const activoId = e.target.value;
        const container = document.getElementById('ot-components-container');
        const listDiv = document.getElementById('ot-components-list');
        
        listDiv.innerHTML = '';
        container.style.display = 'none';
        
        if (!activoId) return;
        
        fetch(`/api/activos/${activoId}`)
            .then(res => res.json())
            .then(data => {
                if (data.plantilla_id) {
                    document.getElementById('ot-select-plantilla').value = data.plantilla_id;
                }
                if (data.componentes && data.componentes.length > 0) {
                    container.style.display = 'block';
                    data.componentes.forEach(comp => {
                        const itemHtml = `
                            <div class="ot-component-item" style="display: flex; flex-direction: column; gap: 0.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.25rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" id="ot-comp-${comp.id}" class="ot-comp-checkbox" value="${comp.id}" style="width: 16px; height: 16px; cursor: pointer;">
                                    <label for="ot-comp-${comp.id}" style="margin-bottom: 0; cursor: pointer; font-weight: 500; font-size: 0.85rem; color: var(--text-main);">${comp.nombre} (${comp.estado})</label>
                                </div>
                                <div id="ot-comp-comment-container-${comp.id}" style="display: none; padding-left: 1.5rem;">
                                    <input type="text" id="ot-comp-comment-${comp.id}" class="form-control" placeholder="Comentario técnico para este componente..." style="padding: 0.35rem 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                </div>
                            </div>
                        `;
                        listDiv.insertAdjacentHTML('beforeend', itemHtml);
                        
                        const checkbox = document.getElementById(`ot-comp-${comp.id}`);
                        const commentContainer = document.getElementById(`ot-comp-comment-container-${comp.id}`);
                        checkbox.addEventListener('change', () => {
                            if (checkbox.checked) {
                                commentContainer.style.display = 'block';
                            } else {
                                commentContainer.style.display = 'none';
                                document.getElementById(`ot-comp-comment-${comp.id}`).value = '';
                            }
                        });
                    });
                }
            })
            .catch(err => console.error('Error al obtener componentes:', err));
    });

    otForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const plantaId = document.getElementById('ot-select-planta').value ? parseInt(document.getElementById('ot-select-planta').value) : null;
        const edificioId = document.getElementById('ot-select-edificio').value ? parseInt(document.getElementById('ot-select-edificio').value) : null;
        const ubicacionId = document.getElementById('ot-select-ubicacion').value ? parseInt(document.getElementById('ot-select-ubicacion').value) : null;
        const activoId = document.getElementById('ot-select-activo').value ? parseInt(document.getElementById('ot-select-activo').value) : null;
        
        const tipo = document.getElementById('ot-tipo').value;
        const prioridad = document.getElementById('ot-prioridad').value;
        const descripcion = document.getElementById('ot-descripcion').value.trim();
        const checkedTechBoxes = document.querySelectorAll('input[name="ot-tecnicos"]:checked');
        const tecnicoIds = Array.from(checkedTechBoxes).map(cb => parseInt(cb.value));
        const plantillaIdVal = document.getElementById('ot-select-plantilla').value;
        const plantillaId = plantillaIdVal ? parseInt(plantillaIdVal) : null;

        const fechaProgramadaVal = document.getElementById('ot-fecha-programada').value || null;
        const horaProgramadaVal = document.getElementById('ot-hora-programada') ? document.getElementById('ot-hora-programada').value : '';
        const horaFinProgramadaVal = document.getElementById('ot-hora-fin-programada') ? document.getElementById('ot-hora-fin-programada').value : '';

        if (fechaProgramadaVal && horaProgramadaVal && horaFinProgramadaVal) {
            if (horaFinProgramadaVal < horaProgramadaVal) {
                alert("La hora de término no puede ser anterior a la hora de inicio.");
                return;
            }
        }
        
        let fullFechaProgramada = fechaProgramadaVal;
        if (fechaProgramadaVal) {
            fullFechaProgramada = fechaProgramadaVal + 'T' + (horaProgramadaVal || '00:00') + ':00';
        }

        let fullFechaFinProgramada = null;
        if (fechaProgramadaVal && horaFinProgramadaVal) {
            fullFechaFinProgramada = fechaProgramadaVal + 'T' + horaFinProgramadaVal + ':00';
        }

        // Recopilar componentes/despieces seleccionados con sus comentarios individuales
        const componentes_trabajados = [];
        document.querySelectorAll('.ot-comp-checkbox:checked').forEach(cb => {
            const compId = parseInt(cb.value);
            const commentInput = document.getElementById(`ot-comp-comment-${compId}`);
            componentes_trabajados.push({
                componente_id: compId,
                comentario: commentInput ? commentInput.value.trim() || null : null
            });
        });

        const payload = {
            descripcion,
            tipo,
            estado: tecnicoIds.length > 0 ? (fechaProgramadaVal ? 'PROGRAMADA' : 'ASIGNADA') : 'CREADA',
            prioridad,
            reportado_por: 'Administración',
            planta_id: plantaId,
            edificio_id: edificioId,
            ubicacion_id: ubicacionId,
            activo_id: activoId,
            tecnico_id: tecnicoIds.length > 0 ? tecnicoIds[0] : null,
            tecnico_ids: tecnicoIds,
            plantilla_id: plantillaId,
            fecha_programada: fullFechaProgramada,
            fecha_fin_programada: fullFechaFinProgramada,
            componentes_trabajados: componentes_trabajados,
            custom_checklist_items: customChecklistItems
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
            resetOtComponents();
            loadKPIs();
            loadWorkOrders();
        })
        .catch(err => alert(err.message));
    });

    // --- 10. REGISTER NEW ASSET MODAL ---
    function displayAssignedLocationInAssetModal(locationId) {
        const container = document.getElementById('asset-assigned-location-container');
        const nameLabel = document.getElementById('asset-assigned-location-name');
        
        if (!locationId) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        nameLabel.textContent = 'Cargando ubicación...';
        
        fetch(`/api/ubicaciones/${locationId}`)
            .then(res => {
                if (!res.ok) throw new Error('Ubicación no encontrada');
                return res.json();
            })
            .then(loc => {
                const parts = [];
                if (loc.planta_nombre) parts.push(loc.planta_nombre);
                if (loc.edificio_nombre) parts.push(loc.edificio_nombre);
                if (loc.nombre) parts.push(loc.nombre);
                
                nameLabel.textContent = parts.join(' ➔ ');
            })
            .catch(err => {
                console.error(err);
                nameLabel.textContent = 'Ubicación ID: ' + locationId;
            });
    }

    btnCreateActivo.addEventListener('click', () => {
        if (!selectedUbicacionId) return;
        document.getElementById('asset-location-id').value = selectedUbicacionId;
        displayAssignedLocationInAssetModal(selectedUbicacionId);
        assetModal.style.display = 'flex';
    });

    closeAssetModal.addEventListener('click', () => {
        assetModal.style.display = 'none';
        const container = document.getElementById('asset-assigned-location-container');
        if (container) container.style.display = 'none';
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
            const container = document.getElementById('asset-assigned-location-container');
            if (container) container.style.display = 'none';
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
    const excelImportChecklistsFile = document.getElementById('excel-import-checklists-file');

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

    if (excelImportChecklistsFile) {
        excelImportChecklistsFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const formData = new FormData();
            formData.append('file', file);
            
            const label = document.querySelector('label[for="excel-import-checklists-file"]');
            const originalLabel = label.innerHTML;
            label.innerHTML = '<span>⏳</span> Subiendo...';
            
            fetch('/api/excel/importar/checklists', {
                method: 'POST',
                body: formData
            })
            .then(res => {
                if (!res.ok) return res.json().then(data => { throw new Error(data.detail || 'Error al procesar carga de checklists') });
                return res.json();
            })
            .then(data => {
                alert(`¡Carga de Checklists Exitosa!\n${data.message}`);
                excelImportChecklistsFile.value = '';
            })
            .catch(err => {
                alert(`Error de Importación: ${err.message}`);
                excelImportChecklistsFile.value = '';
            })
            .finally(() => {
                label.innerHTML = originalLabel;
            });
        });
    }

    // --- KPIs DASHBOARD LOGIC ---
    function formatDateLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function initKpisFilterEvents() {
        const btn7d = document.getElementById('kpis-preset-7d');
        const btnMonth = document.getElementById('kpis-preset-month');
        const btnPrevMonth = document.getElementById('kpis-preset-prev-month');
        const btnAll = document.getElementById('kpis-preset-all');
        const kpisDateStart = document.getElementById('kpis-date-start');
        const kpisDateEnd = document.getElementById('kpis-date-end');
        
        function setActivePresetBtn(activeBtn) {
            [btn7d, btnMonth, btnPrevMonth, btnAll].forEach(btn => {
                if (btn) {
                    btn.classList.remove('active');
                    btn.style.background = 'transparent';
                    btn.style.color = 'var(--text-muted)';
                }
            });
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.style.background = 'var(--accent-color)';
                activeBtn.style.color = 'white';
            }
        }
        
        if (btn7d) {
            btn7d.addEventListener('click', () => {
                const today = new Date();
                const start = new Date();
                start.setDate(today.getDate() - 6);
                kpisDateStart.value = formatDateLocal(start);
                kpisDateEnd.value = formatDateLocal(today);
                setActivePresetBtn(btn7d);
                loadKpisDashboard();
            });
        }
        
        if (btnMonth) {
            btnMonth.addEventListener('click', () => {
                const today = new Date();
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                kpisDateStart.value = formatDateLocal(start);
                kpisDateEnd.value = formatDateLocal(today);
                setActivePresetBtn(btnMonth);
                loadKpisDashboard();
            });
        }
        
        if (btnPrevMonth) {
            btnPrevMonth.addEventListener('click', () => {
                const today = new Date();
                const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const end = new Date(today.getFullYear(), today.getMonth(), 0);
                kpisDateStart.value = formatDateLocal(start);
                kpisDateEnd.value = formatDateLocal(end);
                setActivePresetBtn(btnPrevMonth);
                loadKpisDashboard();
            });
        }
        
        if (btnAll) {
            btnAll.addEventListener('click', () => {
                kpisDateStart.value = '';
                kpisDateEnd.value = '';
                setActivePresetBtn(btnAll);
                loadKpisDashboard();
            });
        }
        
        [kpisDateStart, kpisDateEnd].forEach(input => {
            if (input) {
                input.addEventListener('change', () => {
                    setActivePresetBtn(null);
                    loadKpisDashboard();
                });
            }
        });
        
        // Initialize default preset: Este Mes
        if (btnMonth) {
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            kpisDateStart.value = formatDateLocal(start);
            kpisDateEnd.value = formatDateLocal(today);
            setActivePresetBtn(btnMonth);
        }
    }

    function loadKpisDashboard() {
        fetch(`/api/ordenes?_t=${Date.now()}`)
            .then(res => res.json())
            .then(ots => {
                calculateAndRenderKpis(ots);
            })
            .catch(err => console.error('Error al cargar KPIs:', err));
    }

    function calculateAndRenderKpis(ots) {
        const startVal = document.getElementById('kpis-date-start').value;
        const endVal = document.getElementById('kpis-date-end').value;
        
        let filtered = ots;
        
        // 1. Filter by hierarchy selections
        if (selectedPlantaId) {
            filtered = filtered.filter(ot => ot.planta_id == selectedPlantaId);
        }
        if (selectedEdificioId) {
            filtered = filtered.filter(ot => ot.edificio_id == selectedEdificioId);
        }
        if (selectedUbicacionId) {
            filtered = filtered.filter(ot => ot.ubicacion_id == selectedUbicacionId);
        }

        // 2. Filter by date range (inclusive)
        if (startVal) {
            const startDate = new Date(startVal + 'T00:00:00');
            filtered = filtered.filter(ot => {
                if (!ot.fecha_creacion) return false;
                const d = new Date(ot.fecha_creacion);
                return d >= startDate;
            });
        }
        if (endVal) {
            const endDate = new Date(endVal + 'T23:59:59');
            filtered = filtered.filter(ot => {
                if (!ot.fecha_creacion) return false;
                const d = new Date(ot.fecha_creacion);
                return d <= endDate;
            });
        }

        // 3. Calculate metrics
        const resolved = filtered.filter(ot => ot.estado === 'REALIZADA');
        const resolutionRate = filtered.length > 0 ? Math.round((resolved.length / filtered.length) * 100) : 0;

        let totalHours = 0;
        let countWithTime = 0;
        resolved.forEach(ot => {
            if (ot.fecha_creacion && ot.fecha_resolucion) {
                const start = new Date(ot.fecha_creacion);
                const end = new Date(ot.fecha_resolucion);
                const diffMs = end - start;
                if (diffMs >= 0) {
                    totalHours += diffMs / (1000 * 60 * 60);
                    countWithTime++;
                }
            }
        });
        const mttr = countWithTime > 0 ? (totalHours / countWithTime).toFixed(1) : '0';

        let onTimeCount = 0;
        let programmedCount = 0;
        resolved.forEach(ot => {
            if (ot.fecha_programada) {
                programmedCount++;
                const progDate = new Date(ot.fecha_programada);
                const resDate = new Date(ot.fecha_resolucion);
                
                const progDay = new Date(progDate.getFullYear(), progDate.getMonth(), progDate.getDate());
                const resDay = new Date(resDate.getFullYear(), resDate.getMonth(), resDate.getDate());
                
                if (resDay <= progDay) {
                    onTimeCount++;
                }
            }
        });
        const onTimeRate = programmedCount > 0 ? Math.round((onTimeCount / programmedCount) * 100) : 0;

        // Populate card metrics
        document.getElementById('kpi-val-total-ots').textContent = filtered.length;
        document.getElementById('kpi-val-resolution-rate').textContent = resolutionRate + '%';
        document.getElementById('kpi-val-resolved-count').textContent = resolved.length;
        document.getElementById('kpi-val-total-resolved-base').textContent = filtered.length;
        document.getElementById('kpi-val-mttr').textContent = mttr + ' hrs';
        document.getElementById('kpi-val-ontime-rate').textContent = programmedCount > 0 ? onTimeRate + '%' : 'N/A';

        // 4. Priorities Chart (Pie / Torta)
        const priorities = { Alta: 0, Media: 0, Baja: 0 };
        filtered.forEach(ot => {
            if (priorities[ot.prioridad] !== undefined) {
                priorities[ot.prioridad]++;
            }
        });
        
        const priorityColors = { Alta: '#ef4444', Media: '#f59e0b', Baja: '#3b82f6' };
        const totalCount = filtered.length;
        
        let pieBackground = 'conic-gradient(rgba(255,255,255,0.05) 0% 100%)';
        if (totalCount > 0) {
            const pctAlta = (priorities.Alta / totalCount) * 100;
            const pctMedia = (priorities.Media / totalCount) * 100;
            
            pieBackground = `conic-gradient(
                ${priorityColors.Alta} 0% ${pctAlta}%,
                ${priorityColors.Media} ${pctAlta}% ${pctAlta + pctMedia}%,
                ${priorityColors.Baja} ${pctAlta + pctMedia}% 100%
            )`;
        }
        
        const pieElement = document.getElementById('kpis-priority-pie');
        if (pieElement) {
            pieElement.style.background = pieBackground;
        }
        
        const legendContainer = document.getElementById('kpis-priority-pie-legend');
        if (legendContainer) {
            legendContainer.innerHTML = '';
            ['Alta', 'Media', 'Baja'].forEach(p => {
                const count = priorities[p];
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                const color = priorityColors[p];
                
                legendContainer.innerHTML += `
                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="width: 10px; height: 10px; border-radius: 50%; background-color: ${color}; display: inline-block;"></span>
                            <span style="font-weight: 500; color: var(--text-main);">${p}</span>
                        </div>
                        <span style="color: var(--text-muted); font-weight: 600;">${count} OTs <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal; margin-left: 0.25rem;">(${pct}%)</span></span>
                    </div>
                `;
            });
        }

        // 5. Maintenance Type Chart
        const types = {};
        filtered.forEach(ot => {
            const t = ot.tipo || 'General';
            if (!types[t]) types[t] = 0;
            types[t]++;
        });
        const typeChart = document.getElementById('kpis-type-chart');
        typeChart.innerHTML = '';
        const typeColors = { Correctiva: '#f97316', Preventiva: '#10b981' };
        
        Object.keys(types).forEach(t => {
            const count = types[t];
            const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
            const color = typeColors[t] || '#6366f1';
            typeChart.innerHTML += `
                <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                        <span style="font-weight: 500;">${t}</span>
                        <span style="color: var(--text-muted);">${count} OTs (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
        });

        // 5.1 Specialty / Asset Type Distribution Table
        const specialties = {};
        filtered.forEach(ot => {
            const spec = normalizeType(ot.activo_tipo);
            if (!specialties[spec]) specialties[spec] = 0;
            specialties[spec]++;
        });
        
        const specialtyTableBody = document.getElementById('kpis-specialty-table-body');
        if (specialtyTableBody) {
            specialtyTableBody.innerHTML = '';
            
            const specialtyColors = {
                'Climatización': '#3b82f6',
                'Gasfitería': '#10b981',
                'Electricidad': '#f59e0b',
                'Dispensadores': '#a855f7',
                'Mobiliario': '#ec4899',
                'Edificación': '#64748b',
                'Otros': '#6b7280'
            };
            
            const sortedSpecs = Object.keys(specialties).sort((a, b) => specialties[b] - specialties[a]);
            
            if (sortedSpecs.length === 0) {
                specialtyTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1rem;">No hay registros en este período.</td></tr>`;
            } else {
                sortedSpecs.forEach(s => {
                    const count = specialties[s];
                    const pct = filtered.length > 0 ? Math.round((count / filtered.length) * 100) : 0;
                    const color = specialtyColors[s] || '#6366f1';
                    
                    specialtyTableBody.innerHTML += `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                            <td style="padding: 0.65rem 0.25rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; color: var(--text-main);">
                                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${color};"></span>
                                ${s}
                            </td>
                            <td style="padding: 0.65rem; text-align: center; font-weight: 600; color: var(--text-main);">${count} OTs</td>
                            <td style="padding: 0.65rem; text-align: right; color: var(--accent-color); font-weight: 500;">${pct}%</td>
                        </tr>
                    `;
                });
            }
        }

        // 6. Technicians Ranking
        const techStats = {};
        resolved.forEach(ot => {
            const name = ot.tecnico_nombre || 'No asignado';
            if (!techStats[name]) {
                techStats[name] = { count: 0, totalHours: 0, timeCount: 0 };
            }
            techStats[name].count++;
            if (ot.fecha_creacion && ot.fecha_resolucion) {
                const start = new Date(ot.fecha_creacion);
                const end = new Date(ot.fecha_resolucion);
                const diffMs = end - start;
                if (diffMs >= 0) {
                    techStats[name].totalHours += diffMs / (1000 * 60 * 60);
                    techStats[name].timeCount++;
                }
            }
        });
        const techList = Object.keys(techStats).map(name => {
            const stat = techStats[name];
            const avgMttr = stat.timeCount > 0 ? (stat.totalHours / stat.timeCount).toFixed(1) : '0';
            return { name, count: stat.count, avgMttr: parseFloat(avgMttr) };
        }).sort((a, b) => b.count - a.count).slice(0, 5);

        const techRanking = document.getElementById('kpis-technicians-ranking');
        techRanking.innerHTML = '';
        if (techList.length === 0) {
            techRanking.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1rem;">No hay registros en este período.</td></tr>`;
        } else {
            techList.forEach(t => {
                techRanking.innerHTML += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <td style="padding: 0.65rem 0.25rem; font-weight: 500;">👤 ${t.name}</td>
                        <td style="padding: 0.65rem; text-align: center; font-weight: 600; color: var(--success);">${t.count}</td>
                        <td style="padding: 0.65rem; text-align: right; color: var(--accent-color);">${t.avgMttr} hrs</td>
                    </tr>
                `;
            });
        }

        // 7. Top Assets with failures (Correctives only)
        const assetStats = {};
        const correctives = filtered.filter(ot => ot.tipo === 'Correctiva' || ot.tipo === 'Correctiva / Emergencia');
        correctives.forEach(ot => {
            const assetName = ot.activo_nombre;
            if (!assetName) return;
            if (!assetStats[assetName]) {
                assetStats[assetName] = { count: 0, location: ot.ubicacion_nombre || ot.edificio_nombre || 'N/A' };
            }
            assetStats[assetName].count++;
        });
        const assetList = Object.keys(assetStats).map(name => {
            return { name, count: assetStats[name].count, location: assetStats[name].location };
        }).sort((a, b) => b.count - a.count).slice(0, 5);

        const assetRanking = document.getElementById('kpis-assets-ranking');
        assetRanking.innerHTML = '';
        if (assetList.length === 0) {
            assetRanking.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1rem;">No hay fallas registradas en este período.</td></tr>`;
        } else {
            assetList.forEach(a => {
                assetRanking.innerHTML += `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <td style="padding: 0.65rem 0.25rem; font-weight: 500; color: var(--text-main);">⚙️ ${a.name}</td>
                        <td style="padding: 0.65rem; color: var(--text-muted);">${a.location}</td>
                        <td style="padding: 0.65rem; text-align: right; font-weight: 600; color: var(--danger);">${a.count}</td>
                    </tr>
                `;
            });
        }
    }

    // --- EDIT OT MODAL FUNCTIONALITY ---
    function getEditFormSnapshot() {
        const componentes = [];
        document.querySelectorAll('.edit-ot-comp-checkbox').forEach(checkbox => {
            if (checkbox.checked) {
                const compId = parseInt(checkbox.value);
                const commentEl = document.getElementById(`edit-ot-comp-comment-${compId}`);
                const comment = commentEl ? commentEl.value.trim() : '';
                componentes.push({ componente_id: compId, comentario: comment });
            }
        });
        componentes.sort((a, b) => a.componente_id - b.componente_id);

        return {
            planta_id: document.getElementById('edit-ot-select-planta').value,
            edificio_id: document.getElementById('edit-ot-select-edificio').value,
            ubicacion_id: document.getElementById('edit-ot-select-ubicacion').value,
            activo_id: document.getElementById('edit-ot-select-activo').value,
            tipo: document.getElementById('edit-ot-tipo').value,
            prioridad: document.getElementById('edit-ot-prioridad').value,
            descripcion: document.getElementById('edit-ot-descripcion').value.trim(),
            tecnico_ids: Array.from(document.querySelectorAll('input[name="edit-ot-tecnicos"]:checked')).map(cb => parseInt(cb.value)),
            fecha_programada: document.getElementById('edit-ot-fecha-programada').value,
            hora_programada: document.getElementById('edit-ot-hora-programada').value,
            hora_fin_programada: document.getElementById('edit-ot-hora-fin-programada').value,
            plantilla_id: document.getElementById('edit-ot-select-plantilla').value,
            estado: document.getElementById('edit-ot-status').value,
            componentes: componentes
        };
    }

    async function openEditOTModal(otId) {
        // Reset edit custom checklist items
        editCustomChecklistItems = [];
        const editOtNewPointText = document.getElementById('edit-ot-new-point-text');
        const editOtNewPointType = document.getElementById('edit-ot-new-point-type');
        const editOtNewPointUnit = document.getElementById('edit-ot-new-point-unit');
        if (editOtNewPointText) editOtNewPointText.value = '';
        if (editOtNewPointType) editOtNewPointType.value = 'booleano';
        if (editOtNewPointUnit) {
            editOtNewPointUnit.value = '';
            editOtNewPointUnit.style.display = 'none';
        }
        renderEditCustomChecklistItems();

        // Fetch OT details
        const res = await fetch(`/api/ordenes/${otId}`);
        if (!res.ok) {
            alert("Error al cargar la orden de trabajo");
            return;
        }
        const ot = await res.json();

        // Set hidden OT ID and title
        document.getElementById('edit-ot-id').value = ot.id;
        document.getElementById('edit-ot-id-title').textContent = ot.id;

        // Clear quick search
        document.getElementById('edit-ot-search-location').value = '';
        document.getElementById('edit-ot-search-location-results').style.display = 'none';

        // Populate simple inputs
        document.getElementById('edit-ot-tipo').value = ot.tipo;
        document.getElementById('edit-ot-prioridad').value = ot.prioridad;
        document.getElementById('edit-ot-status').value = ot.estado;
        document.getElementById('edit-ot-descripcion').value = ot.descripcion;

        // Populate scheduled date & time
        const dateInput = document.getElementById('edit-ot-fecha-programada');
        const timeInput = document.getElementById('edit-ot-hora-programada');
        const timeFinInput = document.getElementById('edit-ot-hora-fin-programada');
        if (ot.fecha_programada) {
            const pDate = new Date(ot.fecha_programada);
            dateInput.value = pDate.toISOString().substring(0, 10);
            timeInput.value = String(pDate.getHours()).padStart(2, '0') + ':' + String(pDate.getMinutes()).padStart(2, '0');
        } else {
            dateInput.value = '';
            timeInput.value = '';
        }

        if (ot.fecha_fin_programada) {
            const pDateEnd = new Date(ot.fecha_fin_programada);
            timeFinInput.value = String(pDateEnd.getHours()).padStart(2, '0') + ':' + String(pDateEnd.getMinutes()).padStart(2, '0');
        } else {
            timeFinInput.value = '';
        }

        // Populate checklists dropdown
        const checklistSelect = document.getElementById('edit-ot-select-plantilla');
        checklistSelect.innerHTML = '<option value="">-- Sin plantilla / Pauta estándar --</option>';
        const pcRes = await fetch('/api/plantillas');
        if (pcRes.ok) {
            const plantillas = await pcRes.json();
            plantillas.forEach(p => {
                checklistSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
            });
        }
        checklistSelect.value = ot.plantilla_id || '';

        // Populate technicians checkboxes
        const editTecnicosContainer = document.getElementById('edit-ot-tecnicos-container');
        if (editTecnicosContainer) {
            editTecnicosContainer.innerHTML = '';
            techniciansList.forEach(t => {
                const checked = (ot.tecnico_ids && ot.tecnico_ids.includes(t.id)) || (!ot.tecnico_ids && ot.tecnico_id === t.id) ? 'checked' : '';
                editTecnicosContainer.innerHTML += `
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal; margin-bottom: 0.15rem; cursor: pointer;">
                        <input type="checkbox" name="edit-ot-tecnicos" value="${t.id}" ${checked}>
                        <span>${t.nombre}</span>
                    </label>
                `;
            });
        }

        // Populate Planta select and trigger chains
        const plantaSelect = document.getElementById('edit-ot-select-planta');
        const edificioSelect = document.getElementById('edit-ot-select-edificio');
        const ubicacionSelect = document.getElementById('edit-ot-select-ubicacion');
        const activoSelect = document.getElementById('edit-ot-select-activo');

        // Load plants
        const plantsRes = await fetch('/api/plantas');
        if (plantsRes.ok) {
            const plantas = await plantsRes.json();
            plantaSelect.innerHTML = '<option value="">-- Selecciona Planta --</option>';
            plantas.forEach(p => {
                plantaSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
            });
        }
        plantaSelect.value = ot.planta_id || '';

        // Load buildings for plant
        let isNZ = false;
        if (ot.planta_id) {
            edificioSelect.disabled = false;
            edificioSelect.innerHTML = '<option value="">Cargando...</option>';
            const bRes = await fetch(`/api/plantas/${ot.planta_id}/edificios`);
            if (bRes.ok) {
                const edificios = await bRes.json();
                edificioSelect.innerHTML = '<option value="">-- Selecciona --</option>';
                edificios.forEach(b => {
                    edificioSelect.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
                });
                edificioSelect.value = ot.edificio_id || '';
                
                const selectedEd = edificios.find(b => b.id === ot.edificio_id);
                isNZ = selectedEd && selectedEd.nombre === 'NZ';
            }
        } else {
            edificioSelect.innerHTML = '<option value="">Selecciona planta...</option>';
            edificioSelect.disabled = true;
        }

        const editULabel = document.querySelector('label[for="edit-ot-select-ubicacion"]');
        updateUbicacionRequirement(isNZ, ubicacionSelect, editULabel);

        // Load locations for building
        if (ot.edificio_id && !isNZ) {
            ubicacionSelect.disabled = false;
            ubicacionSelect.innerHTML = '<option value="">Cargando...</option>';
            const uRes = await fetch(`/api/edificios/${ot.edificio_id}/ubicaciones`);
            if (uRes.ok) {
                const ubicaciones = await uRes.json();
                ubicacionSelect.innerHTML = '<option value="">-- Selecciona --</option>';
                ubicaciones.forEach(u => {
                    ubicacionSelect.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
                });
                ubicacionSelect.value = ot.ubicacion_id || '';
            }
        } else {
            if (!isNZ) {
                ubicacionSelect.innerHTML = '<option value="">Selecciona edificio...</option>';
                ubicacionSelect.disabled = true;
            }
        }

        // Load assets for location
        if (ot.ubicacion_id) {
            activoSelect.disabled = false;
            activoSelect.innerHTML = '<option value="">Cargando...</option>';
            const aRes = await fetch(`/api/activos?ubicacion_id=${ot.ubicacion_id}`);
            if (aRes.ok) {
                const activos = await aRes.json();
                activoSelect.innerHTML = '<option value="">-- Selecciona Activo (Opcional) --</option>';
                const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo' && a.estado !== 'Limpieza DB');
                activeActivos.forEach(a => {
                    activoSelect.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
                });
                activoSelect.value = ot.activo_id || '';
            }
        } else {
            activoSelect.innerHTML = '<option value="">Selecciona ubicación...</option>';
            activoSelect.disabled = true;
        }

        // Load components for active asset (if selected)
        const componentsContainer = document.getElementById('edit-ot-components-container');
        const componentsList = document.getElementById('edit-ot-components-list');
        componentsList.innerHTML = '';
        componentsContainer.style.display = 'none';

        if (ot.activo_id) {
            const compRes = await fetch(`/api/activos/${ot.activo_id}`);
            if (compRes.ok) {
                const data = await compRes.json();
                if (data.componentes && data.componentes.length > 0) {
                    componentsContainer.style.display = 'block';
                    data.componentes.forEach(comp => {
                        const matchedComp = ot.componentes_trabajados.find(c => c.id === comp.id);
                        const isChecked = matchedComp !== undefined;
                        const commentVal = isChecked ? (matchedComp.comentario || '') : '';
                        const displayStyle = isChecked ? 'block' : 'none';

                        const itemHtml = `
                            <div class="edit-ot-component-item" style="display: flex; flex-direction: column; gap: 0.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.25rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" id="edit-ot-comp-${comp.id}" class="edit-ot-comp-checkbox" value="${comp.id}" style="width: 16px; height: 16px; cursor: pointer;" ${isChecked ? 'checked' : ''}>
                                    <label for="edit-ot-comp-${comp.id}" style="margin-bottom: 0; cursor: pointer; font-weight: 500; font-size: 0.85rem; color: var(--text-main);">${comp.nombre} (${comp.estado})</label>
                                </div>
                                <div id="edit-ot-comp-comment-container-${comp.id}" style="display: ${displayStyle}; padding-left: 1.5rem;">
                                    <input type="text" id="edit-ot-comp-comment-${comp.id}" class="form-control" placeholder="Comentario técnico para este componente..." value="${commentVal}" style="padding: 0.35rem 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                </div>
                            </div>
                        `;
                        componentsList.insertAdjacentHTML('beforeend', itemHtml);

                        const checkbox = document.getElementById(`edit-ot-comp-${comp.id}`);
                        const commentContainer = document.getElementById(`edit-ot-comp-comment-container-${comp.id}`);
                        checkbox.addEventListener('change', () => {
                            if (checkbox.checked) {
                                commentContainer.style.display = 'block';
                            } else {
                                commentContainer.style.display = 'none';
                                document.getElementById(`edit-ot-comp-comment-${comp.id}`).value = '';
                            }
                        });
                    });
                }
            }
        }

        editOtModal.style.display = 'flex';
        initialEditSnapshot = getEditFormSnapshot();
    }

    function checkChangesAndCloseEditModal() {
        const currentSnapshot = getEditFormSnapshot();
        if (JSON.stringify(currentSnapshot) !== JSON.stringify(initialEditSnapshot)) {
            const confirmSave = confirm("ha realizado cambios en esta ot, ¿desea guardar los cambios?");
            if (confirmSave) {
                saveEditOT();
            } else {
                editOtModal.style.display = 'none';
            }
        } else {
            editOtModal.style.display = 'none';
        }
    }

    async function saveEditOT() {
        const otId = document.getElementById('edit-ot-id').value;
        const plantaId = document.getElementById('edit-ot-select-planta').value ? parseInt(document.getElementById('edit-ot-select-planta').value) : null;
        const edificioId = document.getElementById('edit-ot-select-edificio').value ? parseInt(document.getElementById('edit-ot-select-edificio').value) : null;
        const ubicacionIdVal = document.getElementById('edit-ot-select-ubicacion').value;
        const ubicacionId = ubicacionIdVal ? parseInt(ubicacionIdVal) : null;
        const activoIdVal = document.getElementById('edit-ot-select-activo').value;
        const activoId = activoIdVal ? parseInt(activoIdVal) : null;
        
        const tipo = document.getElementById('edit-ot-tipo').value;
        const prioridad = document.getElementById('edit-ot-prioridad').value;
        const estado = document.getElementById('edit-ot-status').value;
        const descripcion = document.getElementById('edit-ot-descripcion').value.trim();
        const checkedTechBoxes = document.querySelectorAll('input[name="edit-ot-tecnicos"]:checked');
        const tecnicoIds = Array.from(checkedTechBoxes).map(cb => parseInt(cb.value));
        const plantillaIdVal = document.getElementById('edit-ot-select-plantilla').value;
        const plantillaId = plantillaIdVal ? parseInt(plantillaIdVal) : null;

        const fechaProgramadaVal = document.getElementById('edit-ot-fecha-programada').value || null;
        const horaProgramadaVal = document.getElementById('edit-ot-hora-programada').value || '';
        const horaFinProgramadaVal = document.getElementById('edit-ot-hora-fin-programada').value || '';

        if (fechaProgramadaVal && horaProgramadaVal && horaFinProgramadaVal) {
            if (horaFinProgramadaVal < horaProgramadaVal) {
                alert("La hora de término no puede ser anterior a la hora de inicio.");
                return;
            }
        }
        
        let fechaProgramadaFull = null;
        if (fechaProgramadaVal) {
            if (horaProgramadaVal) {
                fechaProgramadaFull = `${fechaProgramadaVal}T${horaProgramadaVal}:00`;
            } else {
                fechaProgramadaFull = `${fechaProgramadaVal}T00:00:00`;
            }
        }

        let fechaFinProgramadaFull = null;
        if (fechaProgramadaVal && horaFinProgramadaVal) {
            fechaFinProgramadaFull = `${fechaProgramadaVal}T${horaFinProgramadaVal}:00`;
        }

        const componentes_trabajados = [];
        document.querySelectorAll('.edit-ot-comp-checkbox').forEach(cb => {
            if (cb.checked) {
                const compId = parseInt(cb.value);
                const commentInput = document.getElementById(`edit-ot-comp-comment-${compId}`);
                componentes_trabajados.push({
                    componente_id: compId,
                    comentario: commentInput ? commentInput.value.trim() || null : null
                });
            }
        });

        const payload = {
            planta_id: plantaId,
            edificio_id: edificioId,
            ubicacion_id: ubicacionId,
            activo_id: activoId,
            tipo: tipo,
            prioridad: prioridad,
            estado: estado,
            descripcion: descripcion,
            tecnico_id: tecnicoIds.length > 0 ? tecnicoIds[0] : null,
            tecnico_ids: tecnicoIds,
            fecha_programada: fechaProgramadaFull,
            fecha_fin_programada: fechaFinProgramadaFull,
            plantilla_id: plantillaId,
            componentes_trabajados: componentes_trabajados,
            custom_checklist_items: editCustomChecklistItems
        };

        try {
            const res = await fetch(`/api/ordenes/${otId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || 'Error al guardar los cambios');
            }

            editOtModal.style.display = 'none';
            loadKPIs();
            loadWorkOrders();
        } catch (err) {
            alert(err.message);
        }
    }

    // Event listeners for Edit modal controls
    closeEditOtModal.addEventListener('click', checkChangesAndCloseEditModal);
    editOtModal.addEventListener('click', (e) => {
        if (e.target === editOtModal) {
            checkChangesAndCloseEditModal();
        }
    });

    editOtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEditOT();
    });

    document.getElementById('edit-ot-select-planta').addEventListener('change', (e) => {
        const plantaId = e.target.value;
        const bSelect = document.getElementById('edit-ot-select-edificio');
        const uSelect = document.getElementById('edit-ot-select-ubicacion');
        const aSelect = document.getElementById('edit-ot-select-activo');
        
        bSelect.innerHTML = '<option value="">Selecciona edificio...</option>';
        bSelect.disabled = true;
        uSelect.innerHTML = '<option value="">Selecciona edificio...</option>';
        uSelect.disabled = true;
        aSelect.innerHTML = '<option value="">Selecciona ubicación...</option>';
        aSelect.disabled = true;
        
        const container = document.getElementById('edit-ot-components-container');
        if (container) container.style.display = 'none';
        const listDiv = document.getElementById('edit-ot-components-list');
        if (listDiv) listDiv.innerHTML = '';

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

    document.getElementById('edit-ot-select-edificio').addEventListener('change', (e) => {
        const edificioId = e.target.value;
        const uSelect = document.getElementById('edit-ot-select-ubicacion');
        const aSelect = document.getElementById('edit-ot-select-activo');
        const uLabel = document.querySelector('label[for="edit-ot-select-ubicacion"]');

        uSelect.innerHTML = '<option value="">Selecciona ubicación...</option>';
        uSelect.disabled = true;
        aSelect.innerHTML = '<option value="">Selecciona ubicación...</option>';
        aSelect.disabled = true;
        
        const container = document.getElementById('edit-ot-components-container');
        if (container) container.style.display = 'none';
        const listDiv = document.getElementById('edit-ot-components-list');
        if (listDiv) listDiv.innerHTML = '';

        if (!edificioId) return;

        const isNZ = e.target.options[e.target.selectedIndex].text.trim() === 'NZ';
        updateUbicacionRequirement(isNZ, uSelect, uLabel);

        if (!isNZ) {
            fetch(`/api/edificios/${edificioId}/ubicaciones`)
                .then(res => res.json())
                .then(ubicaciones => {
                    uSelect.disabled = false;
                    uSelect.innerHTML = '<option value="">-- Selecciona --</option>';
                    ubicaciones.forEach(u => {
                        uSelect.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
                    });
                });
        }
    });

    document.getElementById('edit-ot-select-ubicacion').addEventListener('change', (e) => {
        const ubicacionId = e.target.value;
        const aSelect = document.getElementById('edit-ot-select-activo');

        aSelect.innerHTML = '<option value="">Selecciona activo...</option>';
        aSelect.disabled = true;
        
        const container = document.getElementById('edit-ot-components-container');
        if (container) container.style.display = 'none';
        const listDiv = document.getElementById('edit-ot-components-list');
        if (listDiv) listDiv.innerHTML = '';

        if (!ubicacionId) return;

        fetch(`/api/activos?ubicacion_id=${ubicacionId}`)
            .then(res => res.json())
            .then(activos => {
                aSelect.disabled = false;
                aSelect.innerHTML = '<option value="">-- Selecciona Activo (Opcional) --</option>';
                const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo' && a.estado !== 'Limpieza DB');
                activeActivos.forEach(a => {
                    aSelect.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
                });
            });
    });

    document.getElementById('edit-ot-select-activo').addEventListener('change', (e) => {
        const activoId = e.target.value;
        const container = document.getElementById('edit-ot-components-container');
        const listDiv = document.getElementById('edit-ot-components-list');
        
        listDiv.innerHTML = '';
        container.style.display = 'none';
        
        if (!activoId) return;
        
        fetch(`/api/activos/${activoId}`)
            .then(res => res.json())
            .then(data => {
                if (data.plantilla_id) {
                    document.getElementById('edit-ot-select-plantilla').value = data.plantilla_id;
                }
                if (data.componentes && data.componentes.length > 0) {
                    container.style.display = 'block';
                    data.componentes.forEach(comp => {
                        const itemHtml = `
                            <div class="edit-ot-component-item" style="display: flex; flex-direction: column; gap: 0.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 0.25rem;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <input type="checkbox" id="edit-ot-comp-${comp.id}" class="edit-ot-comp-checkbox" value="${comp.id}" style="width: 16px; height: 16px; cursor: pointer;">
                                    <label for="edit-ot-comp-${comp.id}" style="margin-bottom: 0; cursor: pointer; font-weight: 500; font-size: 0.85rem; color: var(--text-main);">${comp.nombre} (${comp.estado})</label>
                                </div>
                                <div id="edit-ot-comp-comment-container-${comp.id}" style="display: none; padding-left: 1.5rem;">
                                    <input type="text" id="edit-ot-comp-comment-${comp.id}" class="form-control" placeholder="Comentario técnico para este componente..." style="padding: 0.35rem 0.5rem; font-size: 0.8rem; border-radius: 6px;">
                                </div>
                            </div>
                        `;
                        listDiv.insertAdjacentHTML('beforeend', itemHtml);
                        
                        const checkbox = document.getElementById(`edit-ot-comp-${comp.id}`);
                        const commentContainer = document.getElementById(`edit-ot-comp-comment-container-${comp.id}`);
                        checkbox.addEventListener('change', () => {
                            if (checkbox.checked) {
                                commentContainer.style.display = 'block';
                            } else {
                                commentContainer.style.display = 'none';
                                document.getElementById(`edit-ot-comp-comment-${comp.id}`).value = '';
                            }
                        });
                    });
                }
            })
            .catch(err => console.error('Error al obtener componentes:', err));
    });

    // Smart search in Edit OT Form
    const editOtSearchInput = document.getElementById('edit-ot-search-location');
    const editOtSearchResults = document.getElementById('edit-ot-search-location-results');

    if (editOtSearchInput && editOtSearchResults) {
        editOtSearchInput.addEventListener('input', () => {
            const query = editOtSearchInput.value.trim().toLowerCase();
            if (!query) {
                editOtSearchResults.style.display = 'none';
                editOtSearchResults.innerHTML = '';
                return;
            }

            const cleanQuery = query.replace(/[^a-z0-9]/g, '');
            let filtered = [];

            if (cleanQuery === '') {
                filtered = locationsSearchList.filter(u => {
                    const matchName = u.nombre.toLowerCase().includes(query) || 
                                      u.planta_nombre.toLowerCase().includes(query) || 
                                      u.edificio_nombre.toLowerCase().includes(query);
                    const matchMeta = (u.codigo && u.codigo.toLowerCase().includes(query)) ||
                                      (u.uso && u.uso.toLowerCase().includes(query)) ||
                                      (u.cargo && u.cargo.toLowerCase().includes(query));
                    const matchOcupante = u.ocupantes && u.ocupantes.some(o => o.nombre.toLowerCase().includes(query));
                    
                    return matchName || matchMeta || matchOcupante;
                });
            } else {
                filtered = locationsSearchList.filter(u => {
                    const cleanName = u.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanPlanta = u.planta_nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const cleanEdificio = u.edificio_nombre.toLowerCase().replace(/[^a-z0-9]/g, '');

                    if (cleanName.includes(cleanQuery) || cleanPlanta.includes(cleanQuery) || cleanEdificio.includes(cleanQuery)) {
                        return true;
                    }

                    const cleanCodigo = u.codigo ? u.codigo.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                    const cleanUso = u.uso ? u.uso.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                    const cleanCargo = u.cargo ? u.cargo.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
                    
                    if (cleanCodigo.includes(cleanQuery) || cleanUso.includes(cleanQuery) || cleanCargo.includes(cleanQuery)) {
                        return true;
                    }

                    if (u.ocupantes && u.ocupantes.some(o => o.nombre.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery))) {
                        return true;
                    }

                    if (u.activos && u.activos.some(act => act.toLowerCase().replace(/[^a-z0-9]/g, '').includes(cleanQuery))) {
                        return true;
                    }
                    return false;
                });
            }

            if (filtered.length === 0) {
                editOtSearchResults.innerHTML = '<div style="padding: 0.5rem 1rem; color: var(--text-muted); font-size: 0.85rem;">No se encontraron ubicaciones</div>';
            } else {
                editOtSearchResults.innerHTML = '';
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
                        
                        prefillEditOTFormLocationAndAsset(u.planta_id, u.edificio_id, u.id, assetName);
                        
                        editOtSearchInput.value = u.nombre;
                        editOtSearchResults.style.display = 'none';
                    });
                    editOtSearchResults.appendChild(item);
                });
            }
            editOtSearchResults.style.display = 'block';
        });

        document.addEventListener('click', (e) => {
            if (!editOtSearchInput.contains(e.target) && !editOtSearchResults.contains(e.target)) {
                editOtSearchResults.style.display = 'none';
            }
        });
    }

    async function prefillEditOTFormLocationAndAsset(plantaId, edificioId, ubicacionId, assetName = null) {
        const container = document.getElementById('edit-ot-components-container');
        if (container) container.style.display = 'none';
        const listDiv = document.getElementById('edit-ot-components-list');
        if (listDiv) listDiv.innerHTML = '';
        
        const otPlanta = document.getElementById('edit-ot-select-planta');
        const otEdificio = document.getElementById('edit-ot-select-edificio');
        const otUbicacion = document.getElementById('edit-ot-select-ubicacion');
        const otActivo = document.getElementById('edit-ot-select-activo');

        otPlanta.value = plantaId;
        
        otEdificio.disabled = false;
        otEdificio.innerHTML = '<option value="">Cargando...</option>';
        const bRes = await fetch(`/api/plantas/${plantaId}/edificios`);
        if (bRes.ok) {
            const edificios = await bRes.json();
            otEdificio.innerHTML = '<option value="">-- Selecciona --</option>';
            edificios.forEach(b => {
                otEdificio.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
            });
            otEdificio.value = edificioId;
        }

        otUbicacion.disabled = false;
        otUbicacion.innerHTML = '<option value="">Cargando...</option>';
        const uRes = await fetch(`/api/edificios/${edificioId}/ubicaciones`);
        if (uRes.ok) {
            const ubicaciones = await uRes.json();
            otUbicacion.innerHTML = '<option value="">-- Selecciona --</option>';
            ubicaciones.forEach(u => {
                otUbicacion.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
            });
            otUbicacion.value = ubicacionId;
        }

        otActivo.disabled = false;
        otActivo.innerHTML = '<option value="">Cargando...</option>';
        const aRes = await fetch(`/api/activos?ubicacion_id=${ubicacionId}`);
        if (aRes.ok) {
            const activos = await aRes.json();
            otActivo.innerHTML = '<option value="">-- Selecciona Activo (Opcional) --</option>';
            const activeActivos = activos.filter(a => a.estado !== 'Reemplazado' && a.estado !== 'Eliminado sin Reemplazo' && a.estado !== 'Limpieza DB');
            activeActivos.forEach(a => {
                otActivo.innerHTML += `<option value="${a.id}">${a.nombre} (${a.estado})</option>`;
            });
            
            if (assetName) {
                const found = activeActivos.find(a => a.nombre === assetName);
                if (found) {
                    otActivo.value = found.id;
                    otActivo.dispatchEvent(new Event('change'));
                } else {
                    otActivo.value = '';
                }
            } else {
                otActivo.value = '';
            }
        }
    }

    // --- CUSTOM CHECKLIST POINTS FOR CREATION & EDIT MODALS ---
    function renderCustomChecklistItems() {
        const listDiv = document.getElementById('ot-custom-checklist-list');
        if (!listDiv) return;
        
        if (customChecklistItems.length === 0) {
            listDiv.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 0.5rem;">No hay puntos de inspección adicionales</div>';
            return;
        }
        
        listDiv.innerHTML = '';
        customChecklistItems.forEach((item, idx) => {
            const unitStr = item.unidad_medida ? ` [${item.unidad_medida}]` : '';
            const itemHtml = `
                <div class="custom-checklist-badge" style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.85rem;">
                    <div>
                        <strong>${item.texto_pregunta}</strong> 
                        <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">(${item.tipo_respuesta}${unitStr})</span>
                    </div>
                    <button type="button" class="btn-delete-point" data-index="${idx}" style="background: none; border: none; color: var(--text-danger, #ff4d4d); cursor: pointer; font-weight: bold; font-size: 1rem; padding: 0 0.25rem;">✕</button>
                </div>
            `;
            listDiv.insertAdjacentHTML('beforeend', itemHtml);
        });
        
        listDiv.querySelectorAll('.btn-delete-point').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                customChecklistItems.splice(idx, 1);
                renderCustomChecklistItems();
            });
        });
    }

    function renderEditCustomChecklistItems() {
        const listDiv = document.getElementById('edit-ot-custom-checklist-list');
        if (!listDiv) return;
        
        if (editCustomChecklistItems.length === 0) {
            listDiv.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 0.5rem;">No hay puntos de inspección adicionales</div>';
            return;
        }
        
        listDiv.innerHTML = '';
        editCustomChecklistItems.forEach((item, idx) => {
            const unitStr = item.unidad_medida ? ` [${item.unidad_medida}]` : '';
            const itemHtml = `
                <div class="custom-checklist-badge" style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.85rem;">
                    <div>
                        <strong>${item.texto_pregunta}</strong> 
                        <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">(${item.tipo_respuesta}${unitStr})</span>
                    </div>
                    <button type="button" class="btn-edit-delete-point" data-index="${idx}" style="background: none; border: none; color: var(--text-danger, #ff4d4d); cursor: pointer; font-weight: bold; font-size: 1rem; padding: 0 0.25rem;">✕</button>
                </div>
            `;
            listDiv.insertAdjacentHTML('beforeend', itemHtml);
        });
        
        listDiv.querySelectorAll('.btn-edit-delete-point').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                editCustomChecklistItems.splice(idx, 1);
                renderEditCustomChecklistItems();
            });
        });
    }

    // Toggle units visibility
    const otNewPointType = document.getElementById('ot-new-point-type');
    if (otNewPointType) {
        otNewPointType.addEventListener('change', (e) => {
            const unitInput = document.getElementById('ot-new-point-unit');
            if (unitInput) {
                if (e.target.value === 'numerico') {
                    unitInput.style.display = 'block';
                } else {
                    unitInput.style.display = 'none';
                    unitInput.value = '';
                }
            }
        });
    }

    const editOtNewPointType = document.getElementById('edit-ot-new-point-type');
    if (editOtNewPointType) {
        editOtNewPointType.addEventListener('change', (e) => {
            const unitInput = document.getElementById('edit-ot-new-point-unit');
            if (unitInput) {
                if (e.target.value === 'numerico') {
                    unitInput.style.display = 'block';
                } else {
                    unitInput.style.display = 'none';
                    unitInput.value = '';
                }
            }
        });
    }

    // Add points buttons
    const otAddPointBtn = document.getElementById('ot-add-point-btn');
    if (otAddPointBtn) {
        otAddPointBtn.addEventListener('click', () => {
            const textInput = document.getElementById('ot-new-point-text');
            const typeSelect = document.getElementById('ot-new-point-type');
            const unitInput = document.getElementById('ot-new-point-unit');
            
            const text = textInput ? textInput.value.trim() : '';
            if (!text) {
                alert('Por favor ingrese el texto de la pregunta.');
                return;
            }
            
            customChecklistItems.push({
                texto_pregunta: text,
                tipo_respuesta: typeSelect ? typeSelect.value : 'booleano',
                unidad_medida: (typeSelect && typeSelect.value === 'numerico' && unitInput) ? unitInput.value.trim() || null : null
            });
            
            if (textInput) textInput.value = '';
            if (unitInput) unitInput.value = '';
            renderCustomChecklistItems();
        });
    }

    const editOtAddPointBtn = document.getElementById('edit-ot-add-point-btn');
    if (editOtAddPointBtn) {
        editOtAddPointBtn.addEventListener('click', () => {
            const textInput = document.getElementById('edit-ot-new-point-text');
            const typeSelect = document.getElementById('edit-ot-new-point-type');
            const unitInput = document.getElementById('edit-ot-new-point-unit');
            
            const text = textInput ? textInput.value.trim() : '';
            if (!text) {
                alert('Por favor ingrese el texto de la pregunta.');
                return;
            }
            
            editCustomChecklistItems.push({
                texto_pregunta: text,
                tipo_respuesta: typeSelect ? typeSelect.value : 'booleano',
                unidad_medida: (typeSelect && typeSelect.value === 'numerico' && unitInput) ? unitInput.value.trim() || null : null
            });
            
            if (textInput) textInput.value = '';
            if (unitInput) unitInput.value = '';
            renderEditCustomChecklistItems();
        });
    }

    // --- INITIALIZE APPLICATION ---
    if (btnOtViewFlat) setActiveOtViewButton(btnOtViewFlat);
    loadKPIs();
    loadHierarchy();
    loadWorkOrders();
    loadAssets();
    loadTechniciansForAssign();
    initKpisFilterEvents();
});
