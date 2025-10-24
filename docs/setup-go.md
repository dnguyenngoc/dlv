# Install Go on macOS

## Option 1: Install via Official Installer (Recommended)

### Step 1: Download Go
1. Visit: https://go.dev/dl/
2. Download macOS installer (`.pkg` file)
3. Current version: Go 1.21+ recommended

### Step 2: Install
```bash
# Double-click the downloaded .pkg file and follow the installer
# Or install via terminal:
sudo installer -pkg go1.21.6.darwin-amd64.pkg -target /
```

### Step 3: Verify Installation
```bash
go version
# Should show: go version go1.21.6 darwin/amd64
```

## Option 2: Install via Homebrew

### Step 1: Install Homebrew
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Go
```bash
brew install go
```

### Step 3: Verify
```bash
go version
```

## Post-Installation Setup

### Add to PATH (if needed)
```bash
# Add to ~/.zshrc or ~/.bash_profile
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

# Reload shell
source ~/.zshrc
```

## Verify Go is Working

```bash
# Check Go version
go version

# Check Go environment
go env

# Check if Go is in PATH
which go
```

## Next Steps

After installing Go:

```bash
# Navigate to project
cd /Users/duy.nguyen1/Desktop/me/project/dlv

# Install dependencies
make deps

# Run backend
make run
```

## Troubleshooting

### "go: command not found"
- Add Go to PATH in your shell profile
- Restart terminal

### "Permission denied"
- Use `sudo` for installation
- Check permissions on `/usr/local/go`

### Version conflicts
- Uninstall old version first
- Install latest version
- Update PATH variable

