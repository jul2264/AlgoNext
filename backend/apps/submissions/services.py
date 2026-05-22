import requests
from django.conf import settings
from django.utils import timezone
from .models import Submission

class Judge0Service:
    def __init__(self):
        self.api_url = getattr(settings, 'JUDGE0_API_URL', 'http://localhost:2358')
        self.api_key = getattr(settings, 'JUDGE0_API_KEY', '')
        
        self.headers = {
            'Content-Type': 'application/json'
        }
        if self.api_key:
            self.headers['X-RapidAPI-Key'] = self.api_key
            self.headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com'

    def get_language_id(self, language: str) -> int:
        """Map language string to Judge0 language ID."""
        mapping = {
            'python': 71,      # Python (3.8.1)
            'javascript': 63,  # Node.js (12.14.0)
            'cpp': 54,         # C++ (GCC 9.2.0)
            'java': 62         # Java (OpenJDK 13.0.1)
        }
        return mapping.get(language, 71)

    def submit_code(self, source_code: str, language: str, stdin: str = None, expected_output: str = None):
        """Submit a single execution to Judge0 and return the token."""
        url = f"{self.api_url}/submissions?base64_encoded=false&wait=false"
        
        payload = {
            "source_code": source_code,
            "language_id": self.get_language_id(language)
        }
        if stdin:
            payload["stdin"] = stdin
        if expected_output:
            payload["expected_output"] = expected_output
            
        response = requests.post(url, json=payload, headers=self.headers)
        response.raise_for_status()
        return response.json().get('token')

    def get_submission_status(self, token: str):
        """Fetch the result of a submission by token."""
        url = f"{self.api_url}/submissions/{token}?base64_encoded=false"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def evaluate_submission(self, submission_id):
        """Evaluate a full submission against all test cases."""
        submission = Submission.objects.get(id=submission_id)
        submission.status = Submission.Status.RUNNING
        submission.save()
        
        try:
            problem = submission.problem
            test_cases = problem.test_cases.order_by('order')
            
            if not test_cases.exists():
                submission.status = Submission.Status.ERROR
                submission.stderr = "No test cases configured for this problem."
                submission.save()
                return

            submission.test_cases_total = test_cases.count()
            submission.test_cases_passed = 0
            
            # Simple synchronous evaluation for now
            # In a real system, you'd submit a batch and use webhooks
            max_time = 0
            max_memory = 0
            
            for tc in test_cases:
                # Wrap the user code in an execution harness (mocked here)
                # For example, appending the test case call to the code
                executable_code = f"{submission.code}\n\n# Test Case\n{tc.input_data}"
                
                token = self.submit_code(executable_code, submission.language, expected_output=tc.expected_output)
                
                # Poll for completion (Judge0 returns status 1/2 for In Queue/Processing)
                import time
                result = None
                for _ in range(10):  # Wait up to ~10 seconds
                    time.sleep(1)
                    result = self.get_submission_status(token)
                    if result.get('status', {}).get('id', 0) > 2:
                        break
                        
                status_id = result.get('status', {}).get('id')
                
                # Update metrics
                time_taken = float(result.get('time') or 0) * 1000
                memory_taken = float(result.get('memory') or 0)
                max_time = max(max_time, time_taken)
                max_memory = max(max_memory, memory_taken)
                
                if status_id == 3: # Accepted
                    submission.test_cases_passed += 1
                else:
                    submission.status = self._map_judge0_status(status_id)
                    submission.stdout = result.get('stdout', '')
                    submission.stderr = result.get('stderr', '') or result.get('compile_output', '')
                    submission.execution_time_ms = max_time
                    submission.memory_used_kb = max_memory
                    submission.save()
                    return # Stop on first failure
            
            # If all passed
            submission.status = Submission.Status.ACCEPTED
            submission.execution_time_ms = max_time
            submission.memory_used_kb = max_memory
            submission.save()
            
            # Update user progress
            from apps.progress.models import UserProgress
            progress, _ = UserProgress.objects.get_or_create(
                user=submission.user, problem=submission.problem
            )
            progress.status = UserProgress.Status.SOLVED
            progress.solved_at = timezone.now()
            progress.save()
            
        except Exception as e:
            submission.status = Submission.Status.ERROR
            submission.stderr = str(e)
            submission.save()

    def _map_judge0_status(self, judge0_status_id):
        mapping = {
            3: Submission.Status.ACCEPTED,
            4: Submission.Status.WRONG_ANSWER,
            5: Submission.Status.TIME_LIMIT_EXCEEDED,
            6: Submission.Status.COMPILATION_ERROR,
            7: Submission.Status.RUNTIME_ERROR,
            8: Submission.Status.RUNTIME_ERROR,
            9: Submission.Status.RUNTIME_ERROR,
            10: Submission.Status.RUNTIME_ERROR,
            11: Submission.Status.RUNTIME_ERROR,
            12: Submission.Status.RUNTIME_ERROR,
        }
        return mapping.get(judge0_status_id, Submission.Status.ERROR)
