from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import RedirectResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select
from contextlib import asynccontextmanager
import io
import openpyxl

from database import engine, init_db
from models import (
    Planta, Edificio, Ubicacion, Activo, 
    ComponenteActivo, Tecnico, OrdenTrabajo,
    PlantillaChequeo, ItemPlantillaChequeo, RespuestaChequeo
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar Base de Datos y precargar plantas/edificios/técnicos
    init_db()
    yield

app = FastAPI(
    title="Gestión de OTs - FMS Climatización API", 
    description="API para la gestión de activos, ubicaciones y órdenes de trabajo",
    lifespan=lifespan
)

# Configurar CORS por si se usa en desarrollo desacoplado
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia para obtener la sesión de base de datos
def get_db():
    with Session(engine) as session:
        yield session

# Redirección de la raíz al portal del administrador
@app.get("/")
def read_root():
    return RedirectResponse(url="/static/index.html")

# --- ENDPOINTS JERARQUÍA ---

@app.get("/api/plantas", response_model=List[Planta])
def get_plantas(db: Session = Depends(get_db)):
    return db.exec(select(Planta)).all()

@app.get("/api/plantas/{planta_id}/edificios", response_model=List[Edificio])
def get_edificios(planta_id: int, db: Session = Depends(get_db)):
    return db.exec(select(Edificio).where(Edificio.planta_id == planta_id)).all()

@app.get("/api/edificios/{edificio_id}/ubicaciones", response_model=List[Ubicacion])
def get_ubicaciones(edificio_id: int, db: Session = Depends(get_db)):
    return db.exec(select(Ubicacion).where(Ubicacion.edificio_id == edificio_id)).all()

@app.post("/api/ubicaciones", response_model=Ubicacion)
def create_ubicacion(ubicacion: Ubicacion, db: Session = Depends(get_db)):
    # Verificar que el edificio existe
    edificio = db.get(Edificio, ubicacion.edificio_id)
    if not edificio:
        raise HTTPException(status_code=404, detail="Edificio no encontrado")
    
    db.add(ubicacion)
    db.commit()
    db.refresh(ubicacion)
    return ubicacion

# --- ENDPOINTS ACTIVOS Y DESPIECE ---

@app.get("/api/activos", response_model=List[Activo])
def get_activos(
    planta_id: Optional[int] = None,
    edificio_id: Optional[int] = None,
    ubicacion_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = select(Activo)
    
    if ubicacion_id:
        query = query.where(Activo.ubicacion_id == ubicacion_id)
    elif edificio_id:
        # Unir con Ubicacion para filtrar por edificio
        query = query.join(Ubicacion).where(Ubicacion.edificio_id == edificio_id)
    elif planta_id:
        # Unir con Ubicacion y Edificio para filtrar por planta
        query = query.join(Ubicacion).join(Edificio).where(Edificio.planta_id == planta_id)
        
    return db.exec(query).all()

@app.get("/api/activos/{activo_id}")
def get_activo_detail(activo_id: int, db: Session = Depends(get_db)):
    activo = db.get(Activo, activo_id)
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
    
    # Obtener componentes (despiece)
    componentes = db.exec(select(ComponenteActivo).where(ComponenteActivo.activo_id == activo_id)).all()
    # Obtener historial de OTs
    ots = db.exec(select(OrdenTrabajo).where(OrdenTrabajo.activo_id == activo_id)).all()
    
    # Obtener información de ubicación jerárquica para la ficha
    ubicacion = db.get(Ubicacion, activo.ubicacion_id) if activo.ubicacion_id else None
    edificio = db.get(Edificio, ubicacion.edificio_id) if ubicacion else None
    planta = db.get(Planta, edificio.planta_id) if edificio else None
    
    return {
        "id": activo.id,
        "nombre": activo.nombre,
        "tipo": activo.tipo,
        "marca": activo.marca,
        "modelo": activo.modelo,
        "numero_serie": activo.numero_serie,
        "estado": activo.estado,
        "ubicacion_id": activo.ubicacion_id,
        "ubicacion_nombre": ubicacion.nombre if ubicacion else None,
        "edificio_nombre": edificio.nombre if edificio else None,
        "planta_nombre": planta.nombre if planta else None,
        "componentes": componentes,
        "ordenes_trabajo": ots
    }

@app.post("/api/activos", response_model=Activo)
def create_activo(activo: Activo, db: Session = Depends(get_db)):
    if activo.ubicacion_id:
        ubicacion = db.get(Ubicacion, activo.ubicacion_id)
        if not ubicacion:
            raise HTTPException(status_code=404, detail="Ubicación no encontrada")
            
    db.add(activo)
    db.commit()
    db.refresh(activo)
    return activo

@app.post("/api/componentes", response_model=ComponenteActivo)
def create_componente(componente: ComponenteActivo, db: Session = Depends(get_db)):
    activo = db.get(Activo, componente.activo_id)
    if not activo:
        raise HTTPException(status_code=404, detail="Activo principal no encontrado")
        
    db.add(componente)
    db.commit()
    db.refresh(componente)
    return componente

@app.put("/api/activos/{activo_id}", response_model=Activo)
def update_activo(activo_id: int, updated_activo: Activo, db: Session = Depends(get_db)):
    activo = db.get(Activo, activo_id)
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no encontrado")
        
    activo.nombre = updated_activo.nombre
    activo.tipo = updated_activo.tipo
    activo.marca = updated_activo.marca
    activo.modelo = updated_activo.modelo
    activo.numero_serie = updated_activo.numero_serie
    activo.estado = updated_activo.estado
    if updated_activo.ubicacion_id:
        activo.ubicacion_id = updated_activo.ubicacion_id
        
    db.add(activo)
    db.commit()
    db.refresh(activo)
    return activo

@app.put("/api/componentes/{componente_id}", response_model=ComponenteActivo)
def update_componente(componente_id: int, updated_comp: ComponenteActivo, db: Session = Depends(get_db)):
    comp = db.get(ComponenteActivo, componente_id)
    if not comp:
        raise HTTPException(status_code=404, detail="Componente no encontrado")
        
    comp.nombre = updated_comp.nombre
    comp.marca = updated_comp.marca
    comp.modelo = updated_comp.modelo
    comp.numero_serie = updated_comp.numero_serie
    comp.estado = updated_comp.estado
    comp.activo_id = updated_comp.activo_id
    
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp

# --- ENDPOINTS TÉCNICOS ---

@app.get("/api/tecnicos", response_model=List[Tecnico])
def get_tecnicos(db: Session = Depends(get_db)):
    return db.exec(select(Tecnico)).all()

# --- ENDPOINTS ÓRDENES DE TRABAJO (OT) ---

@app.get("/api/ordenes")
def get_ordenes(
    estado: Optional[str] = None,
    tecnico_id: Optional[int] = None,
    planta_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = select(OrdenTrabajo)
    
    if estado:
        query = query.where(OrdenTrabajo.estado == estado)
    if tecnico_id:
        query = query.where(OrdenTrabajo.tecnico_id == tecnico_id)
    if planta_id:
        query = query.where(OrdenTrabajo.planta_id == planta_id)
        
    # Ordenar por ID descendente para ver las más nuevas primero
    query = query.order_by(OrdenTrabajo.id.desc())
    
    ots = db.exec(query).all()
    
    # Enriquecer respuesta con nombres legibles
    results = []
    for ot in ots:
        planta = db.get(Planta, ot.planta_id)
        edificio = db.get(Edificio, ot.edificio_id)
        ubicacion = db.get(Ubicacion, ot.ubicacion_id) if ot.ubicacion_id else None
        activo = db.get(Activo, ot.activo_id) if ot.activo_id else None
        tecnico = db.get(Tecnico, ot.tecnico_id) if ot.tecnico_id else None
        
        results.append({
            "id": ot.id,
            "descripcion": ot.descripcion,
            "tipo": ot.tipo,
            "estado": ot.estado,
            "prioridad": ot.prioridad,
            "fecha_creacion": ot.fecha_creacion,
            "fecha_resolucion": ot.fecha_resolucion,
            "reportado_por": ot.reportado_por,
            "comentarios_tecnicos": ot.comentarios_tecnicos,
            "planta_nombre": planta.nombre if planta else None,
            "edificio_nombre": edificio.nombre if edificio else None,
            "ubicacion_nombre": ubicacion.nombre if ubicacion else None,
            "activo_nombre": activo.nombre if activo else None,
            "tecnico_nombre": tecnico.nombre if tecnico else "No asignado",
            "tecnico_id": ot.tecnico_id,
            "plantilla_id": ot.plantilla_id
        })
        
    return results

@app.post("/api/ordenes", response_model=OrdenTrabajo)
def create_orden(ot: OrdenTrabajo, db: Session = Depends(get_db)):
    # Validar que los campos de ubicación sean correctos
    planta = db.get(Planta, ot.planta_id)
    edificio = db.get(Edificio, ot.edificio_id)
    if not planta or not edificio:
        raise HTTPException(status_code=404, detail="Planta o Edificio no válido")
        
    if ot.ubicacion_id:
        ubicacion = db.get(Ubicacion, ot.ubicacion_id)
        if not ubicacion:
            raise HTTPException(status_code=404, detail="Ubicación no encontrada")
            
    if ot.activo_id:
        activo = db.get(Activo, ot.activo_id)
        if not activo:
            raise HTTPException(status_code=404, detail="Activo no encontrado")
            
    db.add(ot)
    db.commit()
    db.refresh(ot)
    return ot

@app.put("/api/ordenes/{ot_id}", response_model=OrdenTrabajo)
def update_orden(ot_id: int, updated_ot: dict, db: Session = Depends(get_db)):
    ot = db.get(OrdenTrabajo, ot_id)
    if not ot:
        raise HTTPException(status_code=404, detail="Orden de Trabajo no encontrada")
        
    # Campos que el Administrador o Técnico pueden actualizar
    if "estado" in updated_ot:
        ot.estado = updated_ot["estado"]
        if updated_ot["estado"] == "Resuelta":
            ot.fecha_resolucion = datetime.utcnow()
            # Si la OT se resolvió y tiene un activo, podemos asegurar que el activo vuelva a estar Operativo
            if ot.activo_id:
                activo = db.get(Activo, ot.activo_id)
                if activo:
                    activo.estado = "Operativo"
                    db.add(activo)
        elif updated_ot["estado"] == "En Proceso":
            if ot.activo_id:
                activo = db.get(Activo, ot.activo_id)
                if activo and ot.tipo == "Correctiva":
                    activo.estado = "En Reparación"
                    db.add(activo)
                    
    if "tecnico_id" in updated_ot:
        ot.tecnico_id = updated_ot["tecnico_id"]
    if "prioridad" in updated_ot:
        ot.prioridad = updated_ot["prioridad"]
    if "comentarios_tecnicos" in updated_ot:
        ot.comentarios_tecnicos = updated_ot["comentarios_tecnicos"]
        
    if "respuestas" in updated_ot:
        respuestas_data = updated_ot["respuestas"]
        # Limpiar respuestas previas si existen
        existing_resps = db.exec(select(RespuestaChequeo).where(RespuestaChequeo.orden_trabajo_id == ot_id)).all()
        for er in existing_resps:
            db.delete(er)
        db.commit()
        
        # Guardar nuevas respuestas
        for resp in respuestas_data:
            item_id = resp.get("item_plantilla_id")
            val_bool = resp.get("valor_booleano")
            val_text = resp.get("valor_texto")
            val_num = resp.get("valor_numerico")
            obs = resp.get("observacion")
            
            if item_id is not None:
                new_resp = RespuestaChequeo(
                    orden_trabajo_id=ot_id,
                    item_plantilla_id=item_id,
                    valor_booleano=val_bool,
                    valor_texto=val_text,
                    valor_numerico=val_num,
                    observacion=obs
                )
                db.add(new_resp)
        db.commit()
        
    db.add(ot)
    db.commit()
    db.refresh(ot)
    return ot

# --- ENDPOINTS KPI & DASHBOARD ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    ots = db.exec(select(OrdenTrabajo)).all()
    
    total = len(ots)
    pendientes = len([ot for ot in ots if ot.estado == "Pendiente"])
    en_proceso = len([ot for ot in ots if ot.estado == "En Proceso"])
    resueltas = len([ot for ot in ots if ot.estado == "Resuelta"])
    
    # Calcular MTTR promedio en horas
    tiempos_resolucion = []
    for ot in ots:
        if ot.estado == "Resuelta" and ot.fecha_resolucion:
            diff = ot.fecha_resolucion - ot.fecha_creacion
            # Convertir diferencia a horas
            tiempos_resolucion.append(diff.total_seconds() / 3600.0)
            
    mttr = round(sum(tiempos_resolucion) / len(tiempos_resolucion), 1) if tiempos_resolucion else 0.0
    
    # Total activos y su estado
    activos = db.exec(select(Activo)).all()
    total_activos = len(activos)
    activos_operativos = len([a for a in activos if a.estado == "Operativo"])
    activos_falla = len([a for a in activos if a.estado == "En Reparación" or a.estado == "Inactivo"])
    
    # Cumplimiento preventivos vs correctivos
    preventivos = len([ot for ot in ots if ot.tipo == "Preventiva"])
    correctivos = len([ot for ot in ots if ot.tipo == "Correctiva"])
    
    return {
        "kpis": {
            "total_ots": total,
            "pendientes": pendientes,
            "en_proceso": en_proceso,
            "resueltas": resueltas,
            "mttr_horas": mttr,
            "total_activos": total_activos,
            "activos_operativos": activos_operativos,
            "activos_falla": activos_falla,
            "porcentaje_preventivo": round((preventivos / total * 100), 1) if total > 0 else 0.0
        }
    }

# --- ENDPOINTS PLANTILLAS DE CHEQUEO ---

@app.get("/api/plantillas", response_model=List[PlantillaChequeo])
def get_plantillas(db: Session = Depends(get_db)):
    return db.exec(select(PlantillaChequeo)).all()

@app.get("/api/plantillas/{plantilla_id}/items", response_model=List[ItemPlantillaChequeo])
def get_plantilla_items(plantilla_id: int, db: Session = Depends(get_db)):
    return db.exec(select(ItemPlantillaChequeo).where(ItemPlantillaChequeo.plantilla_id == plantilla_id)).all()

@app.post("/api/plantillas")
def create_plantilla(payload: dict, db: Session = Depends(get_db)):
    try:
        nombre = payload.get("nombre")
        descripcion = payload.get("descripcion")
        items_data = payload.get("items", [])
        
        if not nombre:
            raise HTTPException(status_code=400, detail="El nombre de la plantilla es obligatorio")
            
        plantilla = PlantillaChequeo(nombre=nombre, descripcion=descripcion)
        db.add(plantilla)
        db.commit()
        db.refresh(plantilla)
        
        for item in items_data:
            q_text = item.get("texto_pregunta")
            resp_type = item.get("tipo_respuesta", "booleano")
            unit = item.get("unidad_medida")
            
            if q_text:
                new_item = ItemPlantillaChequeo(
                    texto_pregunta=q_text,
                    tipo_respuesta=resp_type,
                    unidad_medida=unit,
                    plantilla_id=plantilla.id
                )
                db.add(new_item)
                
        db.commit()
        return {"status": "success", "id": plantilla.id, "nombre": plantilla.nombre}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ordenes/{ot_id}/respuestas")
def get_orden_respuestas(ot_id: int, db: Session = Depends(get_db)):
    statement = select(RespuestaChequeo).where(RespuestaChequeo.orden_trabajo_id == ot_id)
    respuestas = db.exec(statement).all()
    
    results = []
    for r in respuestas:
        item = db.get(ItemPlantillaChequeo, r.item_plantilla_id)
        results.append({
            "id": r.id,
            "item_plantilla_id": r.item_plantilla_id,
            "texto_pregunta": item.texto_pregunta if item else "Pregunta eliminada",
            "tipo_respuesta": item.tipo_respuesta if item else "booleano",
            "unidad_medida": item.unidad_medida if item else None,
            "valor_booleano": r.valor_booleano,
            "valor_texto": r.valor_texto,
            "valor_numerico": r.valor_numerico,
            "observacion": r.observacion
        })
    return results

# --- ENDPOINTS EXCEL IMPORT / EXPORT ---

@app.get("/api/excel/exportar/ordenes")
def exportar_ordenes(db: Session = Depends(get_db)):
    query = select(OrdenTrabajo).order_by(OrdenTrabajo.id.desc())
    ots = db.exec(query).all()
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Ordenes de Trabajo"
    
    headers = [
        "ID OT", "Descripción", "Tipo Mantenimiento", "Estado", "Prioridad",
        "Fecha Creación", "Fecha Resolución", "Reportado Por", "Comentarios Técnicos",
        "Planta", "Edificio", "Ubicación", "Activo Afectado", "Técnico Asignado"
    ]
    ws.append(headers)
    
    for ot in ots:
        planta = db.get(Planta, ot.planta_id)
        edificio = db.get(Edificio, ot.edificio_id)
        ubicacion = db.get(Ubicacion, ot.ubicacion_id) if ot.ubicacion_id else None
        activo = db.get(Activo, ot.activo_id) if ot.activo_id else None
        tecnico = db.get(Tecnico, ot.tecnico_id) if ot.tecnico_id else None
        
        ws.append([
            f"OT-{ot.id}",
            ot.descripcion,
            ot.tipo,
            ot.estado,
            ot.prioridad,
            ot.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if ot.fecha_creacion else "",
            ot.fecha_resolucion.strftime("%Y-%m-%d %H:%M:%S") if ot.fecha_resolucion else "",
            ot.reportado_por or "",
            ot.comentarios_tecnicos or "",
            planta.nombre if planta else "",
            edificio.nombre if edificio else "",
            ubicacion.nombre if ubicacion else "",
            activo.nombre if activo else "Reporte de Área",
            tecnico.nombre if tecnico else "No asignado"
        ])
        
    from openpyxl.styles import Font, PatternFill
    header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
    for col in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col)
        cell.font = header_font
        cell.fill = header_fill
        
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 10)
        
    file_stream = io.BytesIO()
    wb.save(file_stream)
    file_stream.seek(0)
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=reporte_ordenes.xlsx"}
    )

@app.get("/api/excel/exportar/activos")
def exportar_activos(db: Session = Depends(get_db)):
    activos = db.exec(select(Activo)).all()
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Inventario de Activos"
    
    headers = [
        "ID Activo", "Nombre", "Tipo", "Marca", "Modelo", "N° Serie", "Estado",
        "Planta", "Edificio", "Ubicación"
    ]
    ws.append(headers)
    
    for a in activos:
        ubicacion = db.get(Ubicacion, a.ubicacion_id) if a.ubicacion_id else None
        edificio = db.get(Edificio, ubicacion.edificio_id) if ubicacion else None
        planta = db.get(Planta, edificio.planta_id) if edificio else None
        
        ws.append([
            f"ACT-{a.id}",
            a.nombre,
            a.tipo,
            a.marca or "",
            a.modelo or "",
            a.numero_serie or "",
            a.estado,
            planta.nombre if planta else "",
            edificio.nombre if edificio else "",
            ubicacion.nombre if ubicacion else ""
        ])
        
    from openpyxl.styles import Font, PatternFill
    header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
    for col in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col)
        cell.font = header_font
        cell.fill = header_fill
        
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 3, 10)
        
    file_stream = io.BytesIO()
    wb.save(file_stream)
    file_stream.seek(0)
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=inventario_activos.xlsx"}
    )

@app.get("/api/excel/plantilla-importacion")
def descargar_plantilla_importacion(db: Session = Depends(get_db)):
    wb = openpyxl.Workbook()
    
    # Hoja 1: Plantilla
    ws_plantilla = wb.active
    ws_plantilla.title = "Importar Activos"
    headers_plantilla = [
        "Planta", "Edificio", "Ubicación", "Nombre Activo", "Tipo", "Marca", "Modelo", "N° Serie"
    ]
    ws_plantilla.append(headers_plantilla)
    
    # Agregar fila de ejemplo
    ws_plantilla.append([
        "Santa Adela",
        "Edificio Corporativo",
        "Oficina Gerencia [EC-P2-ON-OF1]",
        "Fancoil Muro Oficina 1",
        "Climatizacion",
        "Carrier",
        "42GW",
        "FC-SAMPLE-001"
    ])
    
    # Estilo de cabeceras de la Plantilla
    from openpyxl.styles import Font, PatternFill
    header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
    for col in range(1, len(headers_plantilla) + 1):
        cell = ws_plantilla.cell(row=1, column=col)
        cell.font = header_font
        cell.fill = header_fill
    
    # Hoja 2: Ubicaciones de Referencia
    ws_ubicaciones = wb.create_sheet(title="Ubicaciones de Referencia")
    headers_ubicaciones = ["Planta", "Edificio", "Ubicación (Nombre Exacto)"]
    ws_ubicaciones.append(headers_ubicaciones)
    
    # Obtener todas las ubicaciones ordenadas
    ubicaciones = db.exec(select(Ubicacion)).all()
    locs_data = []
    for u in ubicaciones:
        ed = db.get(Edificio, u.edificio_id) if u.edificio_id else None
        pl = db.get(Planta, ed.planta_id) if ed else None
        locs_data.append({
            "planta": pl.nombre if pl else "",
            "edificio": ed.nombre if ed else "",
            "ubicacion": u.nombre
        })
        
    # Ordenar por planta, edificio y ubicacion
    locs_data.sort(key=lambda x: (x["planta"], x["edificio"], x["ubicacion"]))
    
    for item in locs_data:
        ws_ubicaciones.append([item["planta"], item["edificio"], item["ubicacion"]])
        
    # Estilo de cabeceras de Ubicaciones
    for col in range(1, len(headers_ubicaciones) + 1):
        cell = ws_ubicaciones.cell(row=1, column=col)
        cell.font = header_font
        cell.fill = PatternFill(start_color="2E75B6", end_color="2E75B6", fill_type="solid")
        
    # Ajuste automático del ancho de columna
    for ws in [ws_plantilla, ws_ubicaciones]:
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 3, 12)
            
    file_stream = io.BytesIO()
    wb.save(file_stream)
    file_stream.seek(0)
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=plantilla_importar_activos.xlsx"}
    )

@app.post("/api/excel/importar/activos")

async def importar_activos(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Por favor sube un archivo Excel válido (.xlsx)")
        
    try:
        contents = await file.read()
        file_stream = io.BytesIO(contents)
        wb = openpyxl.load_workbook(file_stream, read_only=True)
        if "Importar Activos" in wb.sheetnames:
            sheet = wb["Importar Activos"]
        elif "Plantilla Importar Activos" in wb.sheetnames:
            sheet = wb["Plantilla Importar Activos"]
        else:
            sheet = wb.active
        
        imported_count = 0
        rows = list(sheet.iter_rows(values_only=True))
        if len(rows) < 2:
            return {"status": "success", "imported": 0, "message": "El archivo está vacío o no contiene filas de datos"}
            
        for row in rows[1:]:
            if not row or not any(row):
                continue
                
            planta_name = str(row[0]).strip() if row[0] is not None else ""
            edificio_name = str(row[1]).strip() if row[1] is not None else ""
            ubicacion_name = str(row[2]).strip() if row[2] is not None else ""
            activo_name = str(row[3]).strip() if row[3] is not None else ""
            tipo_val = str(row[4]).strip() if row[4] is not None else "Climatizacion"
            marca_val = str(row[5]).strip() if row[5] is not None else None
            modelo_val = str(row[6]).strip() if row[6] is not None else None
            serie_val = str(row[7]).strip() if row[7] is not None else None
            
            if not planta_name or not edificio_name or not ubicacion_name or not activo_name:
                continue
                
            planta = db.exec(select(Planta).where(Planta.nombre == planta_name)).first()
            if not planta:
                planta = Planta(nombre=planta_name)
                db.add(planta)
                db.commit()
                db.refresh(planta)
                
            edificio = db.exec(select(Edificio).where(Edificio.nombre == edificio_name, Edificio.planta_id == planta.id)).first()
            if not edificio:
                edificio = Edificio(nombre=edificio_name, planta_id=planta.id)
                db.add(edificio)
                db.commit()
                db.refresh(edificio)
                
            ubicacion = db.exec(select(Ubicacion).where(Ubicacion.nombre == ubicacion_name, Ubicacion.edificio_id == edificio.id)).first()
            if not ubicacion:
                statement = select(Ubicacion).where(Ubicacion.edificio_id == edificio.id)
                all_ubics = db.exec(statement).all()
                matched_u = None
                for u in all_ubics:
                    if u.nombre.startswith(ubicacion_name):
                        matched_u = u
                        break
                if matched_u:
                    ubicacion = matched_u
                else:
                    ubicacion = Ubicacion(nombre=ubicacion_name, edificio_id=edificio.id)
                    db.add(ubicacion)
                    db.commit()
                    db.refresh(ubicacion)
                    
            existing_activo = None
            if serie_val:
                existing_activo = db.exec(select(Activo).where(Activo.numero_serie == serie_val, Activo.ubicacion_id == ubicacion.id)).first()
                
            if not existing_activo:
                activo = Activo(
                    nombre=activo_name,
                    tipo=tipo_val,
                    marca=marca_val,
                    modelo=modelo_val,
                    numero_serie=serie_val,
                    estado="Operativo",
                    ubicacion_id=ubicacion.id
                )
                db.add(activo)
                db.commit()
                imported_count += 1
                
        return {"status": "success", "imported": imported_count, "message": f"Se importaron {imported_count} activos correctamente."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al procesar archivo Excel: {str(e)}")

# Montar los archivos estáticos para la interfaz de usuario
app.mount("/static", StaticFiles(directory="static"), name="static")

import uvicorn
import os

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0" if os.getenv("RENDER") else "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    reload_mode = not os.getenv("RENDER")
    uvicorn.run("main:app", host=host, port=port, reload=reload_mode)
