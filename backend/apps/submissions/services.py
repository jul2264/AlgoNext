import subprocess
import tempfile
import os
import time
from django.conf import settings
from django.utils import timezone
from .models import Submission

class LocalExecutionService:
    def __init__(self):
        self.timeout = 5  # 5 seconds execution timeout per test case
        
    def _execute_code(self, source_code: str, language: str, test_input: str) -> dict:
        """Executes the code locally using a subprocess within a temporary directory."""
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = ""
            command = []
            
            # Setup file and command based on language
            if language == 'python':
                file_path = os.path.join(temp_dir, 'main.py')
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(source_code)
                command = ['python', file_path]
                
            elif language == 'javascript':
                file_path = os.path.join(temp_dir, 'main.js')
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(source_code)
                command = ['node', file_path]
                
            elif language == 'cpp':
                file_path = os.path.join(temp_dir, 'main.cpp')
                out_path = os.path.join(temp_dir, 'main.exe' if os.name == 'nt' else 'main')
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(source_code)
                
                # Compile C++
                compile_cmd = ['g++', file_path, '-o', out_path]
                compile_proc = subprocess.run(compile_cmd, capture_output=True, text=True)
                if compile_proc.returncode != 0:
                    return {'status_code': 500, 'output': compile_proc.stderr, 'time': 0}
                
                command = [out_path]
                
            elif language == 'java':
                file_path = os.path.join(temp_dir, 'Main.java')
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(source_code)
                
                # Compile Java
                compile_cmd = ['javac', file_path]
                compile_proc = subprocess.run(compile_cmd, capture_output=True, text=True)
                if compile_proc.returncode != 0:
                    return {'status_code': 500, 'output': compile_proc.stderr, 'time': 0}
                
                command = ['java', '-cp', temp_dir, 'Main']
            else:
                return {'status_code': 500, 'output': f"Unsupported language: {language}", 'time': 0}

            # Execute the compiled/interpreted command
            start_time = time.time()
            try:
                # We pipe test_input to stdin
                proc = subprocess.run(
                    command, 
                    input=test_input, 
                    capture_output=True, 
                    text=True, 
                    timeout=self.timeout
                )
                execution_time = (time.time() - start_time) * 1000  # ms
                
                if proc.returncode == 0:
                    return {'status_code': 200, 'output': proc.stdout, 'time': execution_time}
                else:
                    return {'status_code': 400, 'output': proc.stderr or proc.stdout, 'time': execution_time}
                    
            except subprocess.TimeoutExpired:
                return {'status_code': 408, 'output': 'Time Limit Exceeded', 'time': self.timeout * 1000}
            except Exception as e:
                return {'status_code': 500, 'output': str(e), 'time': 0}


    def evaluate_submission(self, submission_id):
        """Evaluate a full submission against all test cases."""
        submission = Submission.objects.get(id=submission_id)
        submission.status = Submission.Status.RUNNING
        submission.save()
        
        try:
            problem = submission.problem
            test_cases = problem.test_cases.order_by('order')
            
            # If no test cases are defined, we just run the code with custom_input (or empty)
            if not test_cases.exists():
                result = self._execute_code(submission.code, submission.language, submission.custom_input or "")
                status_code = result['status_code']
                output = result['output']
                
                if status_code == 200:
                    submission.status = Submission.Status.ACCEPTED
                    submission.stdout = output
                elif status_code == 408:
                    submission.status = Submission.Status.TLE
                    submission.stderr = output
                else:
                    submission.status = Submission.Status.RUNTIME_ERROR
                    submission.stderr = output
                    
                submission.execution_time_ms = result['time']
                submission.save()
                return

            submission.test_cases_total = test_cases.count()
            submission.test_cases_passed = 0
            
            max_time = 0
            max_memory = 0 # Memory profiling via subprocess is complex, keeping 0 for now
            
            for tc in test_cases:
                # We append the input_data to the source code as driver code if it's Python/JS.
                # Otherwise, we pass it via stdin.
                executable_code = submission.code
                test_input = tc.input_data or ""
                
                if submission.language == 'python':
                    executable_code = f"{submission.code}\n\n# Test Case\n{tc.input_data}"
                    test_input = "" # We appended it, so no stdin
                elif submission.language == 'javascript':
                    executable_code = f"{submission.code}\n\n// Test Case\n{tc.input_data}"
                    test_input = ""
                
                result = self._execute_code(executable_code, submission.language, test_input)
                status_code = result['status_code']
                output = result['output']
                cpuTime = result['time']
                
                max_time = max(max_time, cpuTime)
                
                if status_code == 408:
                    submission.status = Submission.Status.TLE
                    submission.stderr = "Time Limit Exceeded"
                    submission.execution_time_ms = max_time
                    submission.save()
                    return
                elif status_code != 200:
                    submission.status = Submission.Status.RUNTIME_ERROR if status_code == 400 else Submission.Status.COMPILATION_ERROR
                    submission.stderr = output
                    submission.execution_time_ms = max_time
                    submission.save()
                    return

                actual_output = output.strip()
                expected = (tc.expected_output or '').strip()
                
                if actual_output == expected:
                    submission.test_cases_passed += 1
                else:
                    submission.status = Submission.Status.WRONG_ANSWER
                    submission.stdout = actual_output
                    submission.stderr = "Expected:\n" + expected + "\n\nGot:\n" + actual_output
                    submission.execution_time_ms = max_time
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
            submission.status = Submission.Status.RUNTIME_ERROR
            submission.stderr = str(e)
            submission.save()
