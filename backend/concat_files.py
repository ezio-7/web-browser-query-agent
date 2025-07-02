#!/usr/bin/env python3
"""
Script to concatenate all Python files in the project into a single text file
"""

import os
from pathlib import Path

def concatenate_python_files(root_dir="app", output_file="all_code.txt"):
    """
    Concatenate all Python files in the specified directory and subdirectories
    """
    root_path = Path(root_dir)
    
    if not root_path.exists():
        print(f"Directory {root_dir} does not exist!")
        return
    
    # Find all Python files
    python_files = []
    for py_file in root_path.rglob("*.py"):
        python_files.append(py_file)
    
    # Sort files for consistent output
    python_files.sort()
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write(f"# Concatenated Python Files from {root_dir}/\n")
        outfile.write(f"# Generated on: {__import__('datetime').datetime.now()}\n")
        outfile.write("# " + "="*60 + "\n\n")
        
        for py_file in python_files:
            try:
                with open(py_file, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                
                # Write file header
                outfile.write(f"{py_file}\n\n")
                outfile.write("<<CODE>>\n")
                outfile.write(content)
                outfile.write("\n\n" + "="*80 + "\n\n")
                
                print(f"Added: {py_file}")
                
            except Exception as e:
                print(f"Error reading {py_file}: {e}")
                continue
    
    print(f"\nAll files concatenated into: {output_file}")
    print(f"Total files processed: {len(python_files)}")

if __name__ == "__main__":
    # You can customize these parameters
    ROOT_DIR = "app"  # Change this to your source directory
    OUTPUT_FILE = "all_code.txt"  # Change output filename if needed
    
    concatenate_python_files(ROOT_DIR, OUTPUT_FILE)