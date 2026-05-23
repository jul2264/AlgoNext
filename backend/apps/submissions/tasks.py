from celery import shared_task
from .services import LocalExecutionService

@shared_task(bind=True, max_retries=3)
def evaluate_submission_task(self, submission_id):
    """Celery task to evaluate a code submission against LocalExecutionService asynchronously."""
    try:
        service = LocalExecutionService()
        service.evaluate_submission(submission_id)
    except Exception as exc:
        # If network error or similar, retry
        raise self.retry(exc=exc, countdown=5)
