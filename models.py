from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship

class Planta(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    direccion: Optional[str] = None
    
    edificios: List["Edificio"] = Relationship(back_populates="planta")

class Edificio(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    planta_id: int = Field(foreign_key="planta.id")
    
    planta: Planta = Relationship(back_populates="edificios")
    ubicaciones: List["Ubicacion"] = Relationship(back_populates="edificio")

class Ubicacion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)  # E.g. "Oficinas Piso 1", "Sala Electrica"
    codigo: Optional[str] = Field(default=None, index=True)
    uso: str = Field(default="Oficina", index=True)
    cargo: Optional[str] = Field(default=None, index=True)
    color: Optional[str] = Field(default=None)
    edificio_id: int = Field(foreign_key="edificio.id")
    
    edificio: Edificio = Relationship(back_populates="ubicaciones")
    activos: List["Activo"] = Relationship(back_populates="ubicacion")
    ocupantes: List["OcupanteUbicacion"] = Relationship(
        back_populates="ubicacion",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class OcupanteUbicacion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    ubicacion_id: int = Field(foreign_key="ubicacion.id")
    
    ubicacion: Optional[Ubicacion] = Relationship(back_populates="ocupantes")

class Activo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    tipo: str  # E.g. "Climatizacion", "Electrico", "Gasfiteria"
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    estado: str = Field(default="Operativo")  # Operativo, En Reparación, Inactivo
    color: Optional[str] = Field(default=None)
    
    ubicacion_id: Optional[int] = Field(default=None, foreign_key="ubicacion.id")
    ubicacion: Optional[Ubicacion] = Relationship(back_populates="activos")
    
    componentes: List["ComponenteActivo"] = Relationship(back_populates="activo")
    ordenes_trabajo: List["OrdenTrabajo"] = Relationship(back_populates="activo")
    plantillas_chequeo: List["PlantillaChequeo"] = Relationship(
        back_populates="activo",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class ComponenteActivo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)  # E.g. "Compresor", "Filtro de Aire", "Motor Ventilador"
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    estado: str = Field(default="Operativo")
    
    activo_id: int = Field(foreign_key="activo.id")
    activo: Activo = Relationship(back_populates="componentes")
    
    ordenes_trabajo_asociadas: List["OrdenTrabajoComponente"] = Relationship(
        back_populates="componente",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class PlantillaChequeo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    descripcion: Optional[str] = None
    tipo_revision: Optional[str] = Field(default="Chequeo Preventivo", index=True)
    activo_id: Optional[int] = Field(default=None, foreign_key="activo.id", nullable=True)

    activo: Optional[Activo] = Relationship(back_populates="plantillas_chequeo")
    items: List["ItemPlantillaChequeo"] = Relationship(
        back_populates="plantilla",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    ordenes_trabajo: List["OrdenTrabajo"] = Relationship(back_populates="plantilla")

class ItemPlantillaChequeo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    texto_pregunta: str
    tipo_respuesta: str  # "booleano", "texto", "numerico"
    unidad_medida: Optional[str] = None  # Ej: "V", "A", "psi", "%"
    
    plantilla_id: int = Field(foreign_key="plantillachequeo.id")
    plantilla: PlantillaChequeo = Relationship(back_populates="items")
    respuestas: List["RespuestaChequeo"] = Relationship(
        back_populates="item_plantilla",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class OrdenTrabajoTecnicoLink(SQLModel, table=True):
    __tablename__ = "ordentrabajotecnicolink"
    orden_trabajo_id: int = Field(foreign_key="ordentrabajo.id", primary_key=True)
    tecnico_id: int = Field(foreign_key="tecnico.id", primary_key=True)

class Tecnico(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    email: str
    especialidad: str  # E.g. "Climatizacion", "Electricidad", "Gasfiteria", "General"
    
    ordenes_trabajo: List["OrdenTrabajo"] = Relationship(back_populates="tecnicos", link_model=OrdenTrabajoTecnicoLink)
    ordenes_trabajo_legacy: List["OrdenTrabajo"] = Relationship(back_populates="tecnico")

class OrdenTrabajo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
    tipo: str = Field(default="Correctiva")  # Correctiva, Preventiva
    estado: str = Field(default="CREADA")  # CREADA, ASIGNADA, PROGRAMADA, REALIZADA, Cancelada
    prioridad: str = Field(default="Media")  # Alta, Media, Baja
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_programada: Optional[datetime] = None
    fecha_fin_programada: Optional[datetime] = None
    fecha_inicio: Optional[datetime] = None
    fecha_resolucion: Optional[datetime] = None
    reportado_por: Optional[str] = None  # Nombre o email de quien reporta
    comentarios_tecnicos: Optional[str] = None
    estado_ejecucion: str = Field(default="NO_INICIADA")  # NO_INICIADA, EN_PROCESO, PAUSADA, REALIZADA
    
    # Location fields (to know where it is, even if no asset is selected)
    planta_id: int = Field(foreign_key="planta.id")
    edificio_id: int = Field(foreign_key="edificio.id")
    ubicacion_id: Optional[int] = Field(default=None, foreign_key="ubicacion.id")
    
    activo_id: Optional[int] = Field(default=None, foreign_key="activo.id")
    tecnico_id: Optional[int] = Field(default=None, foreign_key="tecnico.id")
    plantilla_id: Optional[int] = Field(default=None, foreign_key="plantillachequeo.id")
    
    activo: Optional[Activo] = Relationship(back_populates="ordenes_trabajo")
    tecnico: Optional[Tecnico] = Relationship(back_populates="ordenes_trabajo_legacy")
    tecnicos: List[Tecnico] = Relationship(back_populates="ordenes_trabajo", link_model=OrdenTrabajoTecnicoLink)
    plantilla: Optional[PlantillaChequeo] = Relationship(back_populates="ordenes_trabajo")
    respuestas_checklist: List["RespuestaChequeo"] = Relationship(
        back_populates="orden_trabajo",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    fotos: List["FotoOrdenTrabajo"] = Relationship(
        back_populates="orden_trabajo",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    comentarios_avance: List["ComentarioAvanceOT"] = Relationship(
        back_populates="orden_trabajo",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    componentes_asociados: List["OrdenTrabajoComponente"] = Relationship(
        back_populates="orden_trabajo",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class OrdenTrabajoComponente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    orden_trabajo_id: int = Field(foreign_key="ordentrabajo.id", index=True)
    componente_id: int = Field(foreign_key="componenteactivo.id", index=True)
    comentario: Optional[str] = Field(default=None)
    
    orden_trabajo: "OrdenTrabajo" = Relationship(back_populates="componentes_asociados")
    componente: "ComponenteActivo" = Relationship(back_populates="ordenes_trabajo_asociadas")



class RespuestaChequeo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    orden_trabajo_id: int = Field(foreign_key="ordentrabajo.id")
    item_plantilla_id: int = Field(foreign_key="itemplantillachequeo.id")
    
    valor_booleano: Optional[bool] = None
    valor_texto: Optional[str] = None
    valor_numerico: Optional[float] = None
    observacion: Optional[str] = None
    
    orden_trabajo: OrdenTrabajo = Relationship(back_populates="respuestas_checklist")
    item_plantilla: ItemPlantillaChequeo = Relationship(back_populates="respuestas")

class FotoOrdenTrabajo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    orden_trabajo_id: int = Field(foreign_key="ordentrabajo.id")
    url_foto: str
    comentario: Optional[str] = None
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    
    orden_trabajo: Optional[OrdenTrabajo] = Relationship(back_populates="fotos")

class ComentarioAvanceOT(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    orden_trabajo_id: int = Field(foreign_key="ordentrabajo.id")
    comentario: str
    autor: str
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    
    orden_trabajo: Optional[OrdenTrabajo] = Relationship(back_populates="comentarios_avance")



