Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# --- Global State ---
$script:backendProcess = $null
$script:frontendProcess = $null

# --- Form ---
$form = New-Object System.Windows.Forms.Form
$form.Text = "PetHub - Pet Hotel Management System"
$form.Size = New-Object System.Drawing.Size(820, 620)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedSingle"
$form.MaximizeBox = $false
$form.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
$form.ForeColor = [System.Drawing.Color]::White
$form.Font = New-Object System.Drawing.Font("Segoe UI", 10)

# --- Title Panel ---
$titlePanel = New-Object System.Windows.Forms.Panel
$titlePanel.Dock = "Top"
$titlePanel.Height = 80
$titlePanel.BackColor = [System.Drawing.Color]::FromArgb(24, 24, 37)

$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "PetHub - Pet Hotel Management"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
$titleLabel.AutoSize = $true
$titleLabel.Location = New-Object System.Drawing.Point(20, 12)
$titlePanel.Controls.Add($titleLabel)

$subtitleLabel = New-Object System.Windows.Forms.Label
$subtitleLabel.Text = "He thong quan ly khach san thu cung"
$subtitleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(166, 173, 200)
$subtitleLabel.AutoSize = $true
$subtitleLabel.Location = New-Object System.Drawing.Point(22, 48)
$titlePanel.Controls.Add($subtitleLabel)

$form.Controls.Add($titlePanel)

# --- Status Panel ---
$statusPanel = New-Object System.Windows.Forms.Panel
$statusPanel.Location = New-Object System.Drawing.Point(15, 90)
$statusPanel.Size = New-Object System.Drawing.Size(775, 110)
$statusPanel.BackColor = [System.Drawing.Color]::FromArgb(36, 36, 54)

# Backend status
$lblBackend = New-Object System.Windows.Forms.Label
$lblBackend.Text = "Backend API (Express + Oracle)"
$lblBackend.Font = New-Object System.Drawing.Font("Segoe UI", 11)
$lblBackend.ForeColor = [System.Drawing.Color]::FromArgb(166, 173, 200)
$lblBackend.Location = New-Object System.Drawing.Point(20, 15)
$lblBackend.AutoSize = $true
$statusPanel.Controls.Add($lblBackend)

$lblBackendUrl = New-Object System.Windows.Forms.LinkLabel
$lblBackendUrl.Text = "http://localhost:5000"
$lblBackendUrl.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$lblBackendUrl.LinkColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
$lblBackendUrl.ActiveLinkColor = [System.Drawing.Color]::FromArgb(180, 210, 255)
$lblBackendUrl.Location = New-Object System.Drawing.Point(360, 17)
$lblBackendUrl.AutoSize = $true
$lblBackendUrl.Add_LinkClicked({ Start-Process "http://localhost:5000/api/health" })
$statusPanel.Controls.Add($lblBackendUrl)

$lblBackendStatus = New-Object System.Windows.Forms.Label
$lblBackendStatus.Text = "[Stopped]"
$lblBackendStatus.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$lblBackendStatus.ForeColor = [System.Drawing.Color]::FromArgb(243, 139, 168)
$lblBackendStatus.Location = New-Object System.Drawing.Point(600, 17)
$lblBackendStatus.AutoSize = $true
$statusPanel.Controls.Add($lblBackendStatus)

# Frontend status
$lblFrontend = New-Object System.Windows.Forms.Label
$lblFrontend.Text = "Frontend (Next.js)"
$lblFrontend.Font = New-Object System.Drawing.Font("Segoe UI", 11)
$lblFrontend.ForeColor = [System.Drawing.Color]::FromArgb(166, 173, 200)
$lblFrontend.Location = New-Object System.Drawing.Point(20, 50)
$lblFrontend.AutoSize = $true
$statusPanel.Controls.Add($lblFrontend)

$lblFrontendUrl = New-Object System.Windows.Forms.LinkLabel
$lblFrontendUrl.Text = "http://localhost:3000"
$lblFrontendUrl.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$lblFrontendUrl.LinkColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
$lblFrontendUrl.ActiveLinkColor = [System.Drawing.Color]::FromArgb(180, 210, 255)
$lblFrontendUrl.Location = New-Object System.Drawing.Point(360, 52)
$lblFrontendUrl.AutoSize = $true
$lblFrontendUrl.Add_LinkClicked({ Start-Process "http://localhost:3000" })
$statusPanel.Controls.Add($lblFrontendUrl)

$lblFrontendStatus = New-Object System.Windows.Forms.Label
$lblFrontendStatus.Text = "[Stopped]"
$lblFrontendStatus.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$lblFrontendStatus.ForeColor = [System.Drawing.Color]::FromArgb(243, 139, 168)
$lblFrontendStatus.Location = New-Object System.Drawing.Point(600, 52)
$lblFrontendStatus.AutoSize = $true
$statusPanel.Controls.Add($lblFrontendStatus)

# Oracle status
$lblOracle = New-Object System.Windows.Forms.Label
$lblOracle.Text = "Oracle Database (FREEPDB1)"
$lblOracle.Font = New-Object System.Drawing.Font("Segoe UI", 11)
$lblOracle.ForeColor = [System.Drawing.Color]::FromArgb(166, 173, 200)
$lblOracle.Location = New-Object System.Drawing.Point(20, 82)
$lblOracle.AutoSize = $true
$statusPanel.Controls.Add($lblOracle)

$lblOracleInfo = New-Object System.Windows.Forms.Label
$lblOracleInfo.Text = "localhost:1521/FREEPDB1"
$lblOracleInfo.Font = New-Object System.Drawing.Font("Segoe UI", 10)
$lblOracleInfo.ForeColor = [System.Drawing.Color]::FromArgb(137, 180, 250)
$lblOracleInfo.Location = New-Object System.Drawing.Point(360, 84)
$lblOracleInfo.AutoSize = $true
$statusPanel.Controls.Add($lblOracleInfo)

$lblOracleStatus = New-Object System.Windows.Forms.Label
$lblOracleStatus.Text = "[Checking...]"
$lblOracleStatus.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$lblOracleStatus.ForeColor = [System.Drawing.Color]::FromArgb(249, 226, 175)
$lblOracleStatus.Location = New-Object System.Drawing.Point(600, 84)
$lblOracleStatus.AutoSize = $true
$statusPanel.Controls.Add($lblOracleStatus)

$form.Controls.Add($statusPanel)

# --- Buttons Panel ---
$btnPanel = New-Object System.Windows.Forms.Panel
$btnPanel.Location = New-Object System.Drawing.Point(15, 208)
$btnPanel.Size = New-Object System.Drawing.Size(775, 55)

function New-StyledButton {
    param([string]$text, [int]$x, [int]$w, $bgColor)
    $btn = New-Object System.Windows.Forms.Button
    $btn.Text = $text
    $btn.Location = New-Object System.Drawing.Point($x, 5)
    $btn.Size = New-Object System.Drawing.Size($w, 42)
    $btn.FlatStyle = "Flat"
    $btn.FlatAppearance.BorderSize = 0
    $btn.BackColor = $bgColor
    $btn.ForeColor = [System.Drawing.Color]::FromArgb(30, 30, 46)
    $btn.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
    $btn.Cursor = "Hand"
    return $btn
}

$btnStartAll = New-StyledButton "START ALL" 0 185 ([System.Drawing.Color]::FromArgb(166, 227, 161))
$btnPanel.Controls.Add($btnStartAll)

$btnStopAll = New-StyledButton "STOP ALL" 195 155 ([System.Drawing.Color]::FromArgb(243, 139, 168))
$btnPanel.Controls.Add($btnStopAll)

$btnAdmin = New-StyledButton "Open Admin" 360 135 ([System.Drawing.Color]::FromArgb(137, 180, 250))
$btnPanel.Controls.Add($btnAdmin)

$btnCustomer = New-StyledButton "Open Customer" 505 145 ([System.Drawing.Color]::FromArgb(245, 194, 231))
$btnPanel.Controls.Add($btnCustomer)

$btnSetupDB = New-StyledButton "Setup DB" 660 115 ([System.Drawing.Color]::FromArgb(249, 226, 175))
$btnPanel.Controls.Add($btnSetupDB)

$form.Controls.Add($btnPanel)

# --- Log Panel ---
$lblLog = New-Object System.Windows.Forms.Label
$lblLog.Text = "Console Log:"
$lblLog.Font = New-Object System.Drawing.Font("Segoe UI", 10, [System.Drawing.FontStyle]::Bold)
$lblLog.ForeColor = [System.Drawing.Color]::FromArgb(166, 173, 200)
$lblLog.Location = New-Object System.Drawing.Point(15, 270)
$lblLog.AutoSize = $true
$form.Controls.Add($lblLog)

$txtLog = New-Object System.Windows.Forms.RichTextBox
$txtLog.Location = New-Object System.Drawing.Point(15, 295)
$txtLog.Size = New-Object System.Drawing.Size(775, 270)
$txtLog.BackColor = [System.Drawing.Color]::FromArgb(17, 17, 27)
$txtLog.ForeColor = [System.Drawing.Color]::FromArgb(205, 214, 244)
$txtLog.Font = New-Object System.Drawing.Font("Consolas", 9)
$txtLog.ReadOnly = $true
$txtLog.BorderStyle = "None"
$txtLog.ScrollBars = "Vertical"
$form.Controls.Add($txtLog)

# --- Helper Functions ---
function Write-Log {
    param([string]$msg, [string]$color = "White")
    $time = Get-Date -Format "HH:mm:ss"
    $line = "[$time] $msg"
    $txtLog.SelectionStart = $txtLog.TextLength
    $txtLog.SelectionColor = switch ($color) {
        "Green"  { [System.Drawing.Color]::FromArgb(166, 227, 161) }
        "Red"    { [System.Drawing.Color]::FromArgb(243, 139, 168) }
        "Yellow" { [System.Drawing.Color]::FromArgb(249, 226, 175) }
        "Blue"   { [System.Drawing.Color]::FromArgb(137, 180, 250) }
        "Cyan"   { [System.Drawing.Color]::FromArgb(148, 226, 213) }
        default  { [System.Drawing.Color]::FromArgb(205, 214, 244) }
    }
    $txtLog.AppendText("$line`r`n")
    $txtLog.ScrollToCaret()
    [System.Windows.Forms.Application]::DoEvents()
}

function Set-ServiceStatus {
    param($label, [string]$status)
    switch ($status) {
        "Running" {
            $label.Text = "[Running]"
            $label.ForeColor = [System.Drawing.Color]::FromArgb(166, 227, 161)
        }
        "Starting" {
            $label.Text = "[Starting...]"
            $label.ForeColor = [System.Drawing.Color]::FromArgb(249, 226, 175)
        }
        "Stopped" {
            $label.Text = "[Stopped]"
            $label.ForeColor = [System.Drawing.Color]::FromArgb(243, 139, 168)
        }
        "Error" {
            $label.Text = "[Error]"
            $label.ForeColor = [System.Drawing.Color]::FromArgb(243, 139, 168)
        }
    }
}

function Test-Port {
    param([int]$port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

$projectRoot = "D:\project\PetHub"

# --- Start Backend ---
function Start-Backend {
    if ($script:backendProcess -and -not $script:backendProcess.HasExited) {
        Write-Log "Backend is already running" "Yellow"
        return
    }

    Write-Log "Starting Backend (Express + Oracle)..." "Blue"
    Set-ServiceStatus $lblBackendStatus "Starting"

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "node"
    $psi.Arguments = "src/server.js"
    $psi.WorkingDirectory = "$projectRoot\backend"
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true

    try {
        $script:backendProcess = [System.Diagnostics.Process]::Start($psi)
        Start-Sleep -Seconds 3

        $maxWait = 15
        $waited = 0
        while ($waited -lt $maxWait) {
            if (Test-Port 5000) {
                Set-ServiceStatus $lblBackendStatus "Running"
                Write-Log ">> Backend ready -> http://localhost:5000" "Green"
                return
            }
            Start-Sleep -Seconds 1
            $waited++
            [System.Windows.Forms.Application]::DoEvents()
        }

        if ($script:backendProcess.HasExited) {
            $err = $script:backendProcess.StandardError.ReadToEnd()
            Write-Log "Backend error: $err" "Red"
            Set-ServiceStatus $lblBackendStatus "Error"
        } else {
            Set-ServiceStatus $lblBackendStatus "Running"
            Write-Log ">> Backend started (port not confirmed)" "Yellow"
        }
    } catch {
        Write-Log "Backend start error: $_" "Red"
        Set-ServiceStatus $lblBackendStatus "Error"
    }
}

# --- Start Frontend ---
function Start-Frontend {
    if ($script:frontendProcess -and -not $script:frontendProcess.HasExited) {
        Write-Log "Frontend is already running" "Yellow"
        return
    }

    Write-Log "Starting Frontend (Next.js)..." "Blue"
    Set-ServiceStatus $lblFrontendStatus "Starting"

    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    $psi.Arguments = "/c npx next dev"
    $psi.WorkingDirectory = "$projectRoot\frontend"
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true

    try {
        $script:frontendProcess = [System.Diagnostics.Process]::Start($psi)
        Start-Sleep -Seconds 5

        $maxWait = 30
        $waited = 0
        while ($waited -lt $maxWait) {
            if (Test-Port 3000) {
                Set-ServiceStatus $lblFrontendStatus "Running"
                Write-Log ">> Frontend ready -> http://localhost:3000" "Green"
                return
            }
            Start-Sleep -Seconds 2
            $waited += 2
            [System.Windows.Forms.Application]::DoEvents()
        }

        if ($script:frontendProcess.HasExited) {
            $err = $script:frontendProcess.StandardError.ReadToEnd()
            Write-Log "Frontend error: $err" "Red"
            Set-ServiceStatus $lblFrontendStatus "Error"
        } else {
            Set-ServiceStatus $lblFrontendStatus "Running"
            Write-Log ">> Frontend started" "Yellow"
        }
    } catch {
        Write-Log "Frontend start error: $_" "Red"
        Set-ServiceStatus $lblFrontendStatus "Error"
    }
}

# --- Stop All ---
function Stop-All {
    Write-Log "Stopping all services..." "Yellow"

    if ($script:backendProcess -and -not $script:backendProcess.HasExited) {
        try {
            $pid = $script:backendProcess.Id
            Start-Process "taskkill" -ArgumentList "/pid $pid /f /t" -NoNewWindow -Wait -ErrorAction SilentlyContinue
            Write-Log "Backend stopped" "Red"
        } catch {}
    }
    Set-ServiceStatus $lblBackendStatus "Stopped"

    if ($script:frontendProcess -and -not $script:frontendProcess.HasExited) {
        try {
            $pid = $script:frontendProcess.Id
            Start-Process "taskkill" -ArgumentList "/pid $pid /f /t" -NoNewWindow -Wait -ErrorAction SilentlyContinue
            Write-Log "Frontend stopped" "Red"
        } catch {}
    }
    Set-ServiceStatus $lblFrontendStatus "Stopped"

    try {
        $conns = Get-NetTCPConnection -LocalPort 5000,3000 -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            if ($conn.OwningProcess -gt 0) {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {}

    Write-Log ">> All services stopped" "Green"
}

# --- Button Events ---
$btnStartAll.Add_Click({
    $btnStartAll.Enabled = $false
    $btnStartAll.Text = "Starting..."

    if (Test-Port 1521) {
        Set-ServiceStatus $lblOracleStatus "Running"
        Write-Log ">> Oracle Database is running" "Green"
    } else {
        Set-ServiceStatus $lblOracleStatus "Error"
        Write-Log "!! Oracle Database not available (port 1521)" "Red"
        Write-Log "   Please check Oracle service" "Yellow"
    }

    Start-Backend
    Start-Frontend

    Write-Log "" "White"
    Write-Log "===========================================" "Cyan"
    Write-Log "  PetHub is ready!" "Cyan"
    Write-Log "  Admin:    http://localhost:3000" "Blue"
    Write-Log "  Customer: http://localhost:3000/customer" "Blue"
    Write-Log "  API:      http://localhost:5000/api/health" "Blue"
    Write-Log "===========================================" "Cyan"

    $btnStartAll.Text = "START ALL"
    $btnStartAll.Enabled = $true
})

$btnStopAll.Add_Click({
    Stop-All
})

$btnAdmin.Add_Click({
    if (Test-Port 3000) {
        Start-Process "http://localhost:3000"
        Write-Log "Opening Admin page..." "Blue"
    } else {
        Write-Log "!! Frontend is not running, start it first" "Yellow"
    }
})

$btnCustomer.Add_Click({
    if (Test-Port 3000) {
        Start-Process "http://localhost:3000/customer"
        Write-Log "Opening Customer page..." "Blue"
    } else {
        Write-Log "!! Frontend is not running, start it first" "Yellow"
    }
})

$btnSetupDB.Add_Click({
    $result = [System.Windows.Forms.MessageBox]::Show(
        "Do you want to recreate the database? This will DELETE all existing data!",
        "Setup Database",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Warning
    )
    if ($result -eq "Yes") {
        Write-Log "Running database setup..." "Yellow"
        $btnSetupDB.Enabled = $false

        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "node"
        $psi.Arguments = "setup-database.js"
        $psi.WorkingDirectory = "$projectRoot\backend"
        $psi.UseShellExecute = $false
        $psi.CreateNoWindow = $true
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true

        try {
            $proc = [System.Diagnostics.Process]::Start($psi)
            $proc.WaitForExit(120000)
            $output = $proc.StandardOutput.ReadToEnd()
            $errOutput = $proc.StandardError.ReadToEnd()

            if ($proc.ExitCode -eq 0) {
                Write-Log ">> Database setup completed!" "Green"
            } else {
                Write-Log "!! Database setup failed" "Red"
                if ($errOutput) { Write-Log $errOutput "Red" }
            }

            $lines = $output -split "`n"
            foreach ($line in $lines) {
                $trimmed = $line.Trim()
                if ($trimmed.Length -gt 5 -and ($trimmed -match "tables|bang|Triggers|Procedures|records")) {
                    Write-Log "  $trimmed" "Cyan"
                }
            }
        } catch {
            Write-Log "Error: $_" "Red"
        }

        $btnSetupDB.Enabled = $true
    }
})

# --- Check services on load ---
$form.Add_Shown({
    Write-Log "PetHub Manager started" "Cyan"
    Write-Log "Project: $projectRoot" "White"

    if (Test-Port 1521) {
        Set-ServiceStatus $lblOracleStatus "Running"
        Write-Log ">> Oracle Database is running" "Green"
    } else {
        Set-ServiceStatus $lblOracleStatus "Stopped"
        Write-Log "!! Oracle Database not running (port 1521)" "Yellow"
    }

    if (Test-Port 5000) {
        Set-ServiceStatus $lblBackendStatus "Running"
        Write-Log "Backend already running on port 5000" "Green"
    }
    if (Test-Port 3000) {
        Set-ServiceStatus $lblFrontendStatus "Running"
        Write-Log "Frontend already running on port 3000" "Green"
    }
})

# --- Cleanup on close ---
$form.Add_FormClosing({
    $result = [System.Windows.Forms.MessageBox]::Show(
        "Stop all services before exit?",
        "Exit PetHub",
        [System.Windows.Forms.MessageBoxButtons]::YesNoCancel,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )
    if ($result -eq "Cancel") {
        $_.Cancel = $true
        return
    }
    if ($result -eq "Yes") {
        Stop-All
    }
})

# --- Run ---
[System.Windows.Forms.Application]::EnableVisualStyles()
[System.Windows.Forms.Application]::Run($form)
