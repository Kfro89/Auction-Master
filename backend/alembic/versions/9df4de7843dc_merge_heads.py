"""merge heads

Revision ID: 9df4de7843dc
Revises: 0b948d30456a, 2a3b4c5d6e7f, 1a2b3c4d5e6f
Create Date: 2026-05-16 08:38:11.277991

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9df4de7843dc'
down_revision: Union[str, Sequence[str], None] = ('0b948d30456a', '2a3b4c5d6e7f', '1a2b3c4d5e6f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
