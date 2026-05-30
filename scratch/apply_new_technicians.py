import sys
import os
from sqlmodel import SQLModel, Session, create_engine, select

# Ensure local imports work
sys.path.append(os.getcwd())
from models import Tecnico, OrdenTrabajo

db_file = "fms.db"
db_url = f"sqlite:///{db_file}"
engine = create_engine(db_url)

with Session(engine) as session:
    print("1. Limpiando asignaciones de OTs existentes...")
    # Clear technician references and set status back to Pendiente if they were En Proceso
    ots = session.exec(select(OrdenTrabajo)).all()
    for ot in ots:
        ot.tecnico_id = None
        if ot.estado == "En Proceso":
            ot.estado = "Pendiente"
        session.add(ot)
    session.commit()
    print("Asignaciones limpiadas con éxito.")

    print("\n2. Eliminando técnicos anteriores...")
    techs = session.exec(select(Tecnico)).all()
    for t in techs:
        print(f"Eliminando técnico: {t.nombre}")
        session.delete(t)
    session.commit()
    print("Técnicos antiguos eliminados.")

    print("\n3. Creando los nuevos técnicos en el orden solicitado...")
    new_techs = [
        Tecnico(nombre="Javier Pinochet", email="javier.pinochet@emaresa.cl", especialidad="Climatización"),
        Tecnico(nombre="Alex Valenzuela", email="alex.valenzuela@emaresa.cl", especialidad="Climatización"),
        Tecnico(nombre="Simón Monardes", email="simon.monardes@emaresa.cl", especialidad="Climatización"),
        Tecnico(nombre="Víctor Hugo Hurtado", email="victor.hurtado@emaresa.cl", especialidad="Climatización"),
        Tecnico(nombre="Víctor Parra", email="victor.parra@emaresa.cl", especialidad="Climatización")
    ]
    
    # Save them one by one to ensure exact auto-increment ID order
    for tech in new_techs:
        session.add(tech)
        session.commit()
        print(f"Insertado: ID {tech.id} - {tech.nombre}")
        
    print("\n¡Proceso de actualización de técnicos local completado con éxito!")
