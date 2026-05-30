import os
from sqlmodel import SQLModel, Session, create_engine, select
from models import Tecnico, OrdenTrabajo

db_file = "fms.db"
db_url = f"sqlite:///{db_file}"
engine = create_engine(db_url)

with Session(engine) as session:
    techs = session.exec(select(Tecnico)).all()
    print("=== TÉCNICOS ACTUALES ===")
    for t in techs:
        print(f"ID: {t.id} - Nombre: {t.nombre} - Especialidad: {t.especialidad}")
        
    ots = session.exec(select(OrdenTrabajo)).all()
    print("\n=== OTS Y SUS TÉCNICOS ===")
    for ot in ots:
        print(f"OT ID: {ot.id} - Estado: {ot.estado} - Técnico ID: {ot.tecnico_id}")
