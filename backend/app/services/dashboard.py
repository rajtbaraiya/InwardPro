from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.entry import Entry
from app.models.material import Material
from app.models.party import Party

def get_dashboard_stats(db: Session):
    total_entries = db.query(func.count(Entry.id)).scalar() or 0
    total_manifest_weight = db.query(func.sum(Entry.manifest_weight)).scalar() or 0
    total_actual_weight = db.query(func.sum(Entry.actual_weight)).scalar() or 0
    total_received_weight = db.query(func.sum(Entry.received_weight)).scalar() or 0
    total_material_cost = db.query(func.sum(Entry.material_cost)).scalar() or 0
    total_transport_cost = db.query(func.sum(Entry.transport_cost)).scalar() or 0

    # Entries per material
    material_stats = db.query(
        Material.name,
        func.count(Entry.id).label("count"),
        func.sum(Entry.received_weight).label("total_weight")
    ).join(Entry, Entry.material_id == Material.id, isouter=True)\
     .group_by(Material.id, Material.name)\
     .order_by(func.count(Entry.id).desc())\
     .all()

    # Recent entries (last 6 months by month)
    monthly_stats = db.query(
        func.strftime('%Y-%m', Entry.received_date).label("month"),
        func.count(Entry.id).label("count")
    ).filter(Entry.received_date.isnot(None))\
     .group_by(func.strftime('%Y-%m', Entry.received_date))\
     .order_by(func.strftime('%Y-%m', Entry.received_date))\
     .limit(12).all()

    # Top parties
    party_stats = db.query(
        Party.name,
        func.count(Entry.id).label("count")
    ).join(Entry, Entry.party_id == Party.id, isouter=True)\
     .group_by(Party.id, Party.name)\
     .order_by(func.count(Entry.id).desc())\
     .limit(5).all()

    return {
        "summary": {
            "total_entries": total_entries,
            "total_manifest_weight": round(total_manifest_weight, 2),
            "total_actual_weight": round(total_actual_weight, 2),
            "total_received_weight": round(total_received_weight, 2),
            "total_material_cost": round(total_material_cost, 2),
            "total_transport_cost": round(total_transport_cost, 2),
        },
        "material_stats": [
            {"name": r.name, "count": r.count, "total_weight": round(r.total_weight or 0, 2)}
            for r in material_stats
        ],
        "monthly_stats": [
            {"month": r.month, "count": r.count}
            for r in monthly_stats
        ],
        "party_stats": [
            {"name": r.name, "count": r.count}
            for r in party_stats
        ]
    }
