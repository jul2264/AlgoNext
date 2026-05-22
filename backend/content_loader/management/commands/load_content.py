from django.core.management.base import BaseCommand
from content_loader.loader import load_problems
import os
from django.conf import settings

class Command(BaseCommand):
    help = 'Loads curriculum and problem content from markdown files'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dir',
            type=str,
            help='Directory containing markdown files',
        )

    def handle(self, *args, **options):
        directory = options.get('dir')
        if not directory:
            directory = os.path.join(settings.BASE_DIR.parent, 'content', 'problems')
            
        self.stdout.write(self.style.NOTICE(f'Loading content from {directory}...'))
        
        try:
            load_problems(directory)
            self.stdout.write(self.style.SUCCESS('Successfully loaded all content!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error loading content: {str(e)}'))
