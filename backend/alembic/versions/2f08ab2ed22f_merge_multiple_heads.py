"""Merge multiple heads

Revision ID: 2f08ab2ed22f
Revises: 9df4de7843dc, 999999999999
Create Date: 2026-05-16 11:13:48.138908

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f08ab2ed22f'
down_revision: Union[str, Sequence[str], None] = ('9df4de7843dc', '999999999999')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
