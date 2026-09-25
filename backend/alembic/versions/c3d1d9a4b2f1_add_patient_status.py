"""add patient status

Revision ID: c3d1d9a4b2f1
Revises: 553f9e15086c
Create Date: 2026-09-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d1d9a4b2f1'
down_revision: Union[str, Sequence[str], None] = '553f9e15086c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    patient_status = sa.Enum('active', 'on_hold', 'completed', 'discharged', name='patientstatusenum')
    patient_status.create(op.get_bind(), checkfirst=True)
    op.add_column(
        'patients',
        sa.Column('status', patient_status, nullable=False, server_default='active')
    )
    op.create_index(op.f('ix_patients_status'), 'patients', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_patients_status'), table_name='patients')
    op.drop_column('patients', 'status')
    patient_status = sa.Enum('active', 'on_hold', 'completed', 'discharged', name='patientstatusenum')
    patient_status.drop(op.get_bind(), checkfirst=True)
