# tasks/anchor.py

"""
This module provides a simple task enqueuer for anchoring.
Later, you can replace the print statement with a Celery task
or background worker if you want async processing.
"""

import logging

logger = logging.getLogger(__name__)

def enqueue_anchor(data=None):
    """
    Enqueue an anchor task.
    :param data: Optional payload for the task.
    :return: Confirmation message (string).
    """
    if data is None:
        data = {}

    # For now, just log/print the task. Replace with Celery, RQ, etc. later.
    logger.info("Enqueuing anchor task with data: %s", data)
    print("✅ Anchor task enqueued with data:", data)

    return "Anchor task enqueued"
