from setuptools import setup, find_packages

setup(
    name='smart-data-cleaner',
    version='0.1.0',
    author='Your Name',
    author_email='your.email@example.com',
    description='A smart data cleaning tool that handles various data cleaning tasks.',
    packages=find_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[
        'pandas',
        # Add other dependencies as needed
    ],
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)