from celery import shared_task
from .services import Judge0Service

@shared_task(bind=True, max_retries=3)
def evaluate_submission_task(self, submission_id):
    """Celery task to evaluate a code submission against Judge0 asynchronously."""
    try:
        service = Judge0Service()
        service.evaluate_submission(submission_id)
    except Exception as exc:
        # If network error or similar, retry
        raise self.retry(exc=exc, countdown=5)
