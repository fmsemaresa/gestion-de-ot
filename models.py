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
    edificio_id: int = Field(foreign_key="edificio.id")
    
    edificio: Edificio = Relationship(back_populates="ubicaciones")
    activos: List["Activo"] = Relationship(back_populates="ubicacion")

class Activo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    tipo: str  # E.g. "Climatizacion", "Electrico", "Gasfiteria"
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    estado: str = Field(default="Operativo")  # Operativo, En Reparación, Inactivo
    
    ubicacion_id: Optional[int] = Field(default=None, foreign_key="ubicacion.id")
    ubicacion: Optional[Ubicacion] = Relationship(back_populates="activos")
    
    componentes: List["ComponenteActivo"] = Relationship(back_populates="activo")
    ordenes_trabajo: List["OrdenTrabajo"] = Relationship(back_populates="activo")

class ComponenteActivo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)  # E.g. "Compresor", "Filtro de Aire", "Motor Ventilador"
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    estado: str = Field(default="Operativo")
    
    activo_id: int = Field(foreign_key="activo.id")
    activo: Activo = Relationship(back_populates="componentes")

class PlantillaChequeo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    descripcion: Optional[str] = None

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

class Tecnico(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    email: str
    especialidad: str  # E.g. "Climatizacion", "Electricidad", "Gasfiteria", "General"
    
    ordenes_trabajo: List["OrdenTrabajo"] = Relationship(back_populates="tecnico")

class OrdenTrabajo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    descripcion: str
    tipo: str = Field(default="Correctiva")  # Correctiva, Preventiva
    estado: str = Field(default="Pendiente")  # Pendiente, En Proceso, Resuelta, Cancelada
    prioridad: str = Field(default="Media")  # Alta, Media, Baja
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    fecha_resolucion: Optional[datetime] = None
    reportado_por: Optional[str] = None  # Nombre o email de quien reporta
    comentarios_tecnicos: Optional[str] = None
    
    # Location fields (to know where it is, even if no asset is selected)
    planta_id: int = Field(foreign_key="planta.id")
    edificio_id: int = Field(foreign_key="edificio.id")
    ubicacion_id: Optional[int] = Field(default=None, foreign_key="ubicacion.id")
    
    activo_id: Optional[int] = Field(default=None, foreign_key="activo.id")
    tecnico_id: Optional[int] = Field(default=None, foreign_key="tecnico.id")
    plantilla_id: Optional[int] = Field(default=None, foreign_key="plantillachequeo.id")
    
    activo: Optional[Activo] = Relationship(back_populates="ordenes_trabajo")
    tecnico: Optional[Tecnico] = Relationship(back_populates="ordenes_trabajo")
    plantilla: Optional[PlantillaChequeo] = Relationship(back_populates="ordenes_trabajo")
    respuestas_checklist: List["RespuestaChequeo"] = Relationship(
        back_populates="orden_trabajo",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

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

