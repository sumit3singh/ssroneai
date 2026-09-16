"""005_daily_order_sequence

Revision ID: 005_daily_order_sequence
Revises: 004_pos_indexes_and_fixes
Create Date: 2026-09-03 11:25:00.000000

"""
from alembic import op
import sqlalchemy as sqa

# revision identifiers, used by Alembic.
revision = '005_daily_order_sequence'
down_revision = '004_pos_indexes_and_fixes'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Create daily_order_sequences table
    op.create_table(
        'daily_order_sequences',
        sqa.Column('id', sqa.BigInteger(), primary_key=True, autoincrement=True),
        sqa.Column('tenant_id', sqa.BigInteger(), nullable=False, default=1, index=True),
        sqa.Column('branch_id', sqa.BigInteger(), nullable=False, default=1, index=True),
        sqa.Column('sequence_date', sqa.String(length=10), nullable=False),
        sqa.Column('last_seq', sqa.Integer(), nullable=False, default=0),
        sqa.Column('created_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), nullable=False),
        sqa.Column('updated_at', sqa.DateTime(timezone=True), server_default=sqa.func.now(), onupdate=sqa.func.now(), nullable=False),
        sqa.UniqueConstraint('tenant_id', 'branch_id', 'sequence_date', name='uq_tenant_branch_date_seq')
    )

def downgrade() -> None:
    op.drop_table('daily_order_sequences')
