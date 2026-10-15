"""
Setup script for creating virtual environment on first launch.
This script is called by main.js during first run to create a portable venv.
"""
import os
import sys
import subprocess
import json
from pathlib import Path
from datetime import datetime

def log(message):
    """Print message for Electron to capture"""
    print(f"[Setup] {message}", flush=True)

def setup_venv(appdata_path, python_embed_path, wheels_path):
    """
    Create virtual environment and install dependencies on first run.
    
    Args:
        appdata_path: Path to AppData (e.g., C:/Users/User/AppData/Roaming/garexsa-ui-lite)
        python_embed_path: Path to embedded Python (resources/backend/python-embed)
        wheels_path: Path to wheel files (resources/backend/wheels)
    
    Returns:
        tuple: (success: bool, venv_path: str, error_message: str)
    """
    try:
        # Convert to Path objects
        appdata_path = Path(appdata_path)
        python_embed_path = Path(python_embed_path)
        wheels_path = Path(wheels_path)
        
        # Determine venv location in AppData
        venv_path = appdata_path / 'backend' / 'litert-lm-venv'
        status_file = venv_path / '.setup_complete'
        
        log(f"AppData path: {appdata_path}")
        log(f"Python embed path: {python_embed_path}")
        log(f"Wheels path: {wheels_path}")
        log(f"Target venv path: {venv_path}")
        
        # Check if already set up
        if status_file.exists():
            log("Virtual environment already exists and is configured")
            status_data = json.loads(status_file.read_text())
            log(f"Setup version: {status_data.get('version', 'unknown')}")
            log(f"Created: {status_data.get('created', 'unknown')}")
            return True, str(venv_path), None
        
        # Ensure parent directories exist
        venv_path.parent.mkdir(parents=True, exist_ok=True)
        log(f"Created parent directories: {venv_path.parent}")
        
        # Verify embedded Python exists
        python_exe = python_embed_path / 'python.exe'
        if not python_exe.exists():
            error = f"Python executable not found: {python_exe}"
            log(f"ERROR: {error}")
            return False, None, error
        
        log(f"Using Python: {python_exe}")
        
        # Check Python version
        try:
            version_result = subprocess.run(
                [str(python_exe), '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            log(f"Python version: {version_result.stdout.strip()}")
        except Exception as e:
            log(f"Warning: Could not check Python version: {e}")
        
        # Remove old venv if it exists but is incomplete
        if venv_path.exists() and not status_file.exists():
            log("Removing incomplete previous setup...")
            import shutil
            shutil.rmtree(venv_path, ignore_errors=True)
        
        # Create virtual environment
        log("Creating virtual environment... (this may take 10-15 seconds)")
        result = subprocess.run(
            [str(python_exe), '-m', 'virtualenv', str(venv_path)],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode != 0:
            error = f"Failed to create venv: {result.stderr}"
            log(f"ERROR: {error}")
            return False, None, error
        
        log("Virtual environment created successfully")
        
        # Verify venv was created
        venv_python = venv_path / 'Scripts' / 'python.exe'
        venv_pip = venv_path / 'Scripts' / 'pip.exe'
        
        if not venv_python.exists():
            error = f"Venv python not found: {venv_python}"
            log(f"ERROR: {error}")
            return False, None, error
        
        log(f"Venv python: {venv_python}")
        
        # Upgrade pip in venv
        log("Upgrading pip...")
        result = subprocess.run(
            [str(venv_python), '-m', 'pip', 'install', '--upgrade', 'pip'],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            log("Pip upgraded successfully")
        else:
            log(f"Warning: Pip upgrade had issues: {result.stderr}")
        
        # Verify wheels directory exists
        if not wheels_path.exists():
            error = f"Wheels directory not found: {wheels_path}"
            log(f"ERROR: {error}")
            return False, None, error
        
        # List available wheels
        wheel_files = list(wheels_path.glob('*.whl'))
        log(f"Found {len(wheel_files)} wheel files")
        for whl in wheel_files:
            log(f"  - {whl.name}")
        
        # Install litert-lm from bundled wheels
        log("Installing litert-lm from bundled wheels... (this may take 20-30 seconds)")
        result = subprocess.run(
            [
                str(venv_pip),
                'install',
                '--no-index',
                '--find-links', str(wheels_path),
                'litert-lm'
            ],
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode != 0:
            error = f"Failed to install litert-lm: {result.stderr}"
            log(f"ERROR: {error}")
            return False, None, error
        
        log("litert-lm installed successfully")
        
        # Verify litert-lm executable exists
        litert_exe = venv_path / 'Scripts' / 'litert-lm.exe'
        if not litert_exe.exists():
            error = f"litert-lm executable not found: {litert_exe}"
            log(f"ERROR: {error}")
            return False, None, error
        
        log(f"litert-lm executable: {litert_exe}")
        
        # Check litert-lm version
        try:
            version_result = subprocess.run(
                [str(litert_exe), '--version'],
                capture_output=True,
                text=True,
                timeout=10
            )
            log(f"litert-lm version: {version_result.stdout.strip()}")
        except Exception as e:
            log(f"Warning: Could not check litert-lm version: {e}")
        
        # Mark setup as complete
        status_data = {
            'version': '1.0.0',
            'created': datetime.now().isoformat(),
            'python_version': sys.version,
            'venv_path': str(venv_path)
        }
        
        status_file.write_text(json.dumps(status_data, indent=2))
        log("Setup complete marker created")
        
        log("=" * 60)
        log("SETUP COMPLETED SUCCESSFULLY!")
        log(f"Virtual environment: {venv_path}")
        log(f"litert-lm ready to use")
        log("=" * 60)
        
        return True, str(venv_path), None
        
    except subprocess.TimeoutExpired as e:
        error = f"Setup timeout: {str(e)}"
        log(f"ERROR: {error}")
        return False, None, error
    except Exception as e:
        error = f"Setup failed: {str(e)}"
        log(f"ERROR: {error}")
        import traceback
        log(traceback.format_exc())
        return False, None, error

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print("Usage: setup_venv.py <appdata_path> <python_embed_path> <wheels_path>")
        sys.exit(1)
    
    appdata_path = sys.argv[1]
    python_embed_path = sys.argv[2]
    wheels_path = sys.argv[3]
    
    success, venv_path, error = setup_venv(appdata_path, python_embed_path, wheels_path)
    
    if success:
        print(f"SUCCESS:{venv_path}")
        sys.exit(0)
    else:
        print(f"ERROR:{error}")
        sys.exit(1)
