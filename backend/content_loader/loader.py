import os
import yaml
import re
import json
import logging
from django.conf import settings
from apps.curriculum.models import Level, Chapter, Category
from apps.problems.models import Problem, TestCase, StarterCode, Solution

logger = logging.getLogger(__name__)

def parse_markdown_file(file_path):
    """
    Parses a problem markdown file and extracts frontmatter and sections.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match frontmatter between ---
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
    if not frontmatter_match:
        raise ValueError(f"No YAML frontmatter found in {file_path}")

    frontmatter_str = frontmatter_match.group(1)
    body = frontmatter_match.group(2)

    metadata = yaml.safe_load(frontmatter_str)

    # Split body into sections by ## headers
    sections_raw = re.split(r'^##\s+', body, flags=re.MULTILINE)[1:] # Skip first empty element
    
    sections = {}
    for section in sections_raw:
        lines = section.split('\n', 1)
        if len(lines) >= 2:
            header = lines[0].strip()
            content = lines[1].strip()
            sections[header] = content

    return metadata, sections

def extract_code_block(content):
    """Extracts code from a markdown fenced code block."""
    match = re.search(r'```(?:\w+)?\n(.*?)\n```', content, re.DOTALL)
    if match:
        return match.group(1).strip()
    return content.strip()

def extract_json_block(content):
    """Extracts JSON from a markdown fenced code block."""
    code = extract_code_block(content)
    try:
        return json.loads(code)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {e}")
        return []

def load_problems(directory=None):
    """
    Loads all problem markdown files from the content directory into the database.
    """
    if directory is None:
        directory = os.path.join(settings.BASE_DIR.parent, 'content', 'problems')
        
    if not os.path.exists(directory):
        logger.warning(f"Content directory not found: {directory}")
        return

    for filename in os.listdir(directory):
        if not filename.endswith('.md'):
            continue

        file_path = os.path.join(directory, filename)
        try:
            metadata, sections = parse_markdown_file(file_path)
            
            # 1. Resolve Curriculum Hierarchy
            level_title = metadata.get('level', 'Level 1: Foundations')
            chapter_title = metadata.get('chapter', 'Default Chapter')
            category_title = metadata.get('category', 'Default Category')

            level, _ = Level.objects.get_or_create(
                title=level_title,
                defaults={'description': '', 'order': Level.objects.count() + 1}
            )
            
            chapter, _ = Chapter.objects.get_or_create(
                level=level,
                title=chapter_title,
                defaults={'description': '', 'order': Chapter.objects.filter(level=level).count() + 1}
            )
            
            category, _ = Category.objects.get_or_create(
                chapter=chapter,
                title=category_title,
                defaults={'slug': category_title.lower().replace(' ', '-'), 'order': Category.objects.filter(chapter=chapter).count() + 1}
            )

            # 2. Extract specific sections
            description = sections.get('Description', '')
            constraints_list = []
            if 'Constraints' in sections:
                # Basic parsing of bullet list
                constraints_list = [line.strip('- ').strip() for line in sections['Constraints'].split('\n') if line.strip().startswith('-')]
            
            # 3. Create or update Problem
            problem, created = Problem.objects.update_or_create(
                slug=metadata.get('slug'),
                defaults={
                    'category': category,
                    'title': metadata.get('title'),
                    'difficulty': metadata.get('difficulty'),
                    'description': description,
                    'constraints': constraints_list,
                    'tags': metadata.get('tags', []),
                    'time_complexity': metadata.get('time_complexity', ''),
                    'space_complexity': metadata.get('space_complexity', ''),
                    'hints': metadata.get('hints', []),
                    'editorial': sections.get('Editorial', ''),
                    'has_visualizer': metadata.get('has_visualizer', False),
                    'visualizer_component': metadata.get('visualizer_component', ''),
                    'order': metadata.get('order', 0),
                    'is_published': True
                }
            )

            logger.info(f"{'Created' if created else 'Updated'} problem: {problem.title}")

            # 4. Load Starter Code & Solutions
            for header, content in sections.items():
                if header.startswith('Starter Code'):
                    lang = header.replace('Starter Code', '').strip(' ()').lower()
                    if not lang: lang = 'python' # default
                    
                    code = extract_code_block(content)
                    StarterCode.objects.update_or_create(
                        problem=problem,
                        language=lang,
                        defaults={'code': code}
                    )
                
                elif header.startswith('Solution'):
                    lang = header.replace('Solution', '').strip(' ()').lower()
                    if not lang: lang = 'python' # default
                    
                    code = extract_code_block(content)
                    Solution.objects.update_or_create(
                        problem=problem,
                        language=lang,
                        defaults={'code': code, 'explanation': sections.get('Editorial', '')}
                    )

            # 5. Load Test Cases
            if 'Test Cases' in sections:
                test_cases_data = extract_json_block(sections['Test Cases'])
                
                # Clear existing to prevent duplicates on reload
                TestCase.objects.filter(problem=problem).delete()
                
                for i, tc in enumerate(test_cases_data):
                    TestCase.objects.create(
                        problem=problem,
                        input_data=tc.get('input', ''),
                        expected_output=tc.get('output', ''),
                        is_hidden=tc.get('is_hidden', False),
                        order=i
                    )
                    
        except Exception as e:
            logger.error(f"Error parsing {filename}: {str(e)}")
