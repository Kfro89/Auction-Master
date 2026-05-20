from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.models import Item

engine = create_engine('postgresql://auctionmaster:secretpassword@localhost:5434/app')
Session = sessionmaker(bind=engine)
session = Session()

total = session.query(Item).count()
false_count = session.query(Item).filter(Item.is_archived == False).count()
null_count = session.query(Item).filter(Item.is_archived == None).count()

print(f"Total: {total}")
print(f"False: {false_count}")
print(f"Null: {null_count}")
