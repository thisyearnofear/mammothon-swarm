import os
from pathlib import Path

def check_directory_structure():
    """Check and print the directory structure during deployment."""
    current_dir = Path(__file__).resolve().parent
    base_dir = current_dir.parent
    workspace_dir = os.environ.get('WORKSPACE_DIR', '/workspace')
    
    print("Directory Structure Check:")
    print(f"Current directory: {current_dir}")
    print(f"Base directory: {base_dir}")
    print(f"Workspace directory: {workspace_dir}")
    
    # Check static directory
    static_dir = base_dir / "static"
    print(f"\nStatic directory ({static_dir}):")
    print(f"Exists: {static_dir.exists()}")
    if static_dir.exists():
        print("\nContents:")
        for item in static_dir.iterdir():
            print(f"- {item.name}")

if __name__ == "__main__":
    check_directory_structure() 