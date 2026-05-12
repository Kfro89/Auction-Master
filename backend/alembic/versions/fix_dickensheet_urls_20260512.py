"""fix dickensheet urls

Revision ID: fix_dickensheet_urls_20260512
Revises: f5136061f091
Create Date: 2026-05-12 05:21:54.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fix_dickensheet_urls_20260512'
down_revision = 'f5136061f091'
branch_labels = None
depends_on = None


def upgrade():
    # Update existing Dickensheet URLs from /auctions/X/lot/Y to /ui/auctions/X/Y
    op.execute("""
        UPDATE items 
        SET url = REPLACE(REPLACE(url, '/auctions/', '/ui/auctions/'), '/lot/', '/')
        WHERE url LIKE '%bid.dickensheet.com/auctions/%/lot/%'
    """)


def downgrade():
    pass
