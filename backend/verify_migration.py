from sqlalchemy import create_engine, inspect
import os

DATABASE_URL = "postgresql://auction_user:auction_pass@localhost:5434/auction_db"
engine = create_engine(DATABASE_URL)
inspector = inspect(engine)

columns = inspector.get_columns('items')
is_archived_col = next((c for c in columns if c['name'] == 'is_archived'), None)

if is_archived_col:
    print(f"Column 'is_archived' exists.")
    print(f"Type: {is_archived_col['type']}")
    print(f"Nullable: {is_archived_col['nullable']}")
    print(f"Default: {is_archived_col['default']}")
else:
    print("Column 'is_archived' does NOT exist.")

# Check existing data
with engine.connect() as conn:
    from sqlalchemy import text
    result = conn.execute(text("SELECT count(*) FROM items WHERE is_archived IS NOT FALSE;"))
    count = result.scalar()
    print(f"Items where is_archived is not False: {count}")
