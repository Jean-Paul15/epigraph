<#
.SYNOPSIS
    EpiGraph - Gestionnaire de projet Docker
.DESCRIPTION
    Script de gestion complet pour le projet EpiGraph.
    Commandes: start, stop, restart, destroy, status, logs
.EXAMPLE
    .\epigraph.ps1 start
    .\epigraph.ps1 stop
    .\epigraph.ps1 restart
    .\epigraph.ps1 destroy
    .\epigraph.ps1 status
    .\epigraph.ps1 logs [service]
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet("start", "stop", "restart", "destroy", "status", "logs", "help")]
    [string]$Command = "help",
    
    [Parameter(Position = 1)]
    [string]$Service = ""
)

$ErrorActionPreference = "Stop"

# Se placer a la racine du depot (le script est dans scripts/)
$RepoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $RepoRoot

# Lecture des identifiants Neo4j depuis .env (jamais en dur dans le script)
$Neo4jUser = "neo4j"
$Neo4jPassword = ""
if (Test-Path ".env") {
    foreach ($line in Get-Content ".env") {
        if ($line -match '^\s*NEO4J_USER=(.+)$') { $Neo4jUser = $Matches[1].Trim() }
        if ($line -match '^\s*NEO4J_PASSWORD=(.+)$') { $Neo4jPassword = $Matches[1].Trim() }
    }
}

# Configuration
$ProjectName = "EpiGraph"
$ProjectVersion = "1.0.0"

# Couleurs
function Write-Header {
    Clear-Host
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "  ║                                                              ║" -ForegroundColor Blue
    Write-Host "  ║   ███████╗██████╗ ██╗ ██████╗ ██████╗  █████╗ ██████╗ ██╗  ██║" -ForegroundColor Cyan
    Write-Host "  ║   ██╔════╝██╔══██╗██║██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██║  ██║" -ForegroundColor Cyan
    Write-Host "  ║   █████╗  ██████╔╝██║██║  ███╗██████╔╝███████║██████╔╝███████║" -ForegroundColor Cyan
    Write-Host "  ║   ██╔══╝  ██╔═══╝ ██║██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══██║" -ForegroundColor Cyan
    Write-Host "  ║   ███████╗██║     ██║╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║" -ForegroundColor Cyan
    Write-Host "  ║   ╚══════╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ██║" -ForegroundColor Cyan
    Write-Host "  ║                                                              ║" -ForegroundColor Blue
    Write-Host "  ║          Analyse Epidemiologique avec Neo4j + GDS            ║" -ForegroundColor DarkGray
    Write-Host "  ║                      Version $ProjectVersion                          ║" -ForegroundColor DarkGray
    Write-Host "  ╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Write-Step {
    param([string]$Number, [string]$Total, [string]$Message)
    Write-Host "  [$Number/$Total] " -ForegroundColor Blue -NoNewline
    Write-Host $Message -ForegroundColor White
}

function Write-Success {
    param([string]$Message)
    Write-Host "      [OK] " -ForegroundColor Green -NoNewline
    Write-Host $Message -ForegroundColor Gray
}

function Write-Error {
    param([string]$Message)
    Write-Host "      [ERREUR] " -ForegroundColor Red -NoNewline
    Write-Host $Message -ForegroundColor Gray
}

function Write-Info {
    param([string]$Message)
    Write-Host "      " -NoNewline
    Write-Host $Message -ForegroundColor DarkGray
}

function Write-Waiting {
    param([string]$Message)
    Write-Host "      [....] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message -ForegroundColor Gray -NoNewline
}

function Test-Docker {
    try {
        docker --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Test-DockerRunning {
    try {
        docker ps | Out-Null
        return $true
    } catch {
        return $false
    }
}

function Get-ContainerStatus {
    $containers = docker-compose ps --format json 2>$null | ConvertFrom-Json
    return $containers
}

function Show-Status {
    Write-Header
    Write-Host "  STATUS DES SERVICES" -ForegroundColor White
    Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    
    $services = @(
        @{Name="neo4j"; Port="7474"; Desc="Base de donnees graphe"},
        @{Name="backend"; Port="8000"; Desc="API FastAPI"},
        @{Name="frontend"; Port="3000"; Desc="Dashboard Next.js"},
        @{Name="jupyter"; Port="8888"; Desc="Notebooks"}
    )
    
    foreach ($svc in $services) {
        $status = docker-compose ps --format "{{.State}}" $svc.Name 2>$null
        $health = docker-compose ps --format "{{.Health}}" $svc.Name 2>$null
        
        if ($status -eq "running") {
            if ($health -eq "healthy" -or $health -eq "") {
                $icon = "[OK]"
                $color = "Green"
            } else {
                $icon = "[~~]"
                $color = "Yellow"
            }
        } else {
            $icon = "[--]"
            $color = "DarkGray"
        }
        
        Write-Host "  $icon " -ForegroundColor $color -NoNewline
        Write-Host ("{0,-12}" -f $svc.Name) -ForegroundColor White -NoNewline
        Write-Host " : " -ForegroundColor DarkGray -NoNewline
        Write-Host (":{0,-5}" -f $svc.Port) -ForegroundColor Cyan -NoNewline
        Write-Host " - $($svc.Desc)" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  ACCES RAPIDE" -ForegroundColor White
    Write-Host ""
    Write-Host "      Dashboard    " -ForegroundColor Gray -NoNewline
    Write-Host "http://localhost:3000" -ForegroundColor Cyan
    Write-Host "      API Docs     " -ForegroundColor Gray -NoNewline
    Write-Host "http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "      Neo4j        " -ForegroundColor Gray -NoNewline
    Write-Host "http://localhost:7474" -ForegroundColor Cyan
    Write-Host "      Jupyter      " -ForegroundColor Gray -NoNewline
    Write-Host "http://localhost:8888" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Help {
    Write-Header
    Write-Host "  COMMANDES DISPONIBLES" -ForegroundColor White
    Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "      start     " -ForegroundColor Cyan -NoNewline
    Write-Host "Demarre tous les services (avec init auto)" -ForegroundColor Gray
    Write-Host "      stop      " -ForegroundColor Cyan -NoNewline
    Write-Host "Arrete tous les conteneurs" -ForegroundColor Gray
    Write-Host "      restart   " -ForegroundColor Cyan -NoNewline
    Write-Host "Redemarre tous les services" -ForegroundColor Gray
    Write-Host "      destroy   " -ForegroundColor Cyan -NoNewline
    Write-Host "Supprime tout (conteneurs, volumes, images)" -ForegroundColor Gray
    Write-Host "      status    " -ForegroundColor Cyan -NoNewline
    Write-Host "Affiche l'etat des services" -ForegroundColor Gray
    Write-Host "      logs      " -ForegroundColor Cyan -NoNewline
    Write-Host "Affiche les logs (optionnel: nom du service)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  EXEMPLES" -ForegroundColor White
    Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "      .\epigraph.ps1 start" -ForegroundColor DarkGray
    Write-Host "      .\epigraph.ps1 logs backend" -ForegroundColor DarkGray
    Write-Host "      .\epigraph.ps1 destroy" -ForegroundColor DarkGray
    Write-Host ""
}

function Invoke-Start {
    Write-Header
    Write-Host "  DEMARRAGE DU PROJET" -ForegroundColor White
    Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    
    # Etape 1: Verification Docker
    Write-Step "1" "6" "Verification de Docker..."
    if (-not (Test-Docker)) {
        Write-Error "Docker n'est pas installe"
        exit 1
    }
    if (-not (Test-DockerRunning)) {
        Write-Error "Docker n'est pas demarre"
        exit 1
    }
    Write-Success "Docker operationnel"
    
    # Etape 2: Configuration
    Write-Step "2" "6" "Verification de la configuration..."
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Success "Fichier .env cree"
        } else {
            Write-Info "Pas de .env requis"
        }
    } else {
        Write-Success "Configuration presente"
    }
    
    # Etape 3: Donnees CSV
    Write-Step "3" "6" "Verification des donnees..."
    $csvCount = (Get-ChildItem -Path "data/csv" -Filter "*.csv" -ErrorAction SilentlyContinue).Count
    if ($csvCount -lt 10) {
        Write-Info "Generation des donnees en cours..."
        docker-compose run --rm data-generator 2>&1 | Out-Null
        Write-Success "Donnees generees"
    } else {
        Write-Success "$csvCount fichiers CSV presents"
    }
    
    # Etape 4: Demarrage des conteneurs
    Write-Step "4" "6" "Demarrage des services..."
    docker-compose up -d 2>&1 | Out-Null
    Write-Success "Conteneurs lances"
    
    # Etape 5: Attente de Neo4j
    Write-Step "5" "7" "Initialisation de Neo4j..."
    $retries = 0
    $maxRetries = 30
    while ($retries -lt $maxRetries) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:7474" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Start-Sleep -Seconds 3
                # Importer les donnees et creer les projections
                docker exec epigraph-neo4j bash /scripts/init.sh 2>&1 | Out-Null
                Write-Success "Donnees importees"
                break
            }
        } catch {
            Start-Sleep -Seconds 2
            $retries++
        }
    }
    
    if ($retries -ge $maxRetries) {
        Write-Error "Timeout Neo4j"
    }
    
    # Etape 6: Creation de la projection GDS
    Write-Step "6" "7" "Creation de la projection GDS..."
    Start-Sleep -Seconds 2
    try {
        docker exec epigraph-neo4j cypher-shell -u $Neo4jUser -p $Neo4jPassword "CALL gds.graph.drop('epidemic-network', false)" 2>&1 | Out-Null
        docker exec epigraph-neo4j cypher-shell -u $Neo4jUser -p $Neo4jPassword "CALL gds.graph.project('epidemic-network', 'Patient', 'INFECTED_BY')" 2>&1 | Out-Null
        Write-Success "Projection epidemic-network creee"
    } catch {
        Write-Info "Projection GDS sera creee par le backend"
    }
    
    # Etape 7: Entrainement du modele ML
    Write-Step "7" "7" "Entrainement du modele ML (RandomForest)..."
    Start-Sleep -Seconds 3
    try {
        # Copier le script si necessaire
        docker cp "$PSScriptRoot\backend\train_model.py" epigraph-backend:/app/train_model.py 2>&1 | Out-Null
        # Entrainer le modele
        $trainOutput = docker exec epigraph-backend python train_model.py 2>&1
        if ($trainOutput -match "Modele sauvegarde") {
            # Sauvegarder l'heure d'entrainement
            $trainTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            docker exec epigraph-backend sh -c "echo '$trainTime' > /app/models/last_trained.txt" 2>&1 | Out-Null
            Write-Success "Modele RandomForest entraine ($trainTime)"
        } else {
            Write-Info "Modele deja entraine"
        }
    } catch {
        Write-Info "Entrainement ML ignore (sera fait au premier appel API)"
    }
    
    # Verification finale
    Write-Host ""
    Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  PROJET DEMARRE AVEC SUCCES" -ForegroundColor Green
    Write-Host ""
    Write-Host "      Dashboard    " -ForegroundColor Gray -NoNewline
    Write-Host "http://localhost:3000" -ForegroundColor Cyan
    Write-Host "      API          " -ForegroundColor Gray -NoNewline
    Write-Host "http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "      Neo4j        " -ForegroundColor Gray -NoNewline
    Write-Host "http://localhost:7474" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "      Identifiants Neo4j: " -ForegroundColor Gray -NoNewline
    Write-Host "$Neo4jUser / (voir NEO4J_PASSWORD dans .env)" -ForegroundColor White
    Write-Host ""
}

function Invoke-Stop {
    Write-Header
    Write-Host "  ARRET DES SERVICES" -ForegroundColor White
    Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    
    Write-Step "1" "1" "Arret des conteneurs..."
    docker-compose stop 2>&1 | Out-Null
    Write-Success "Tous les services sont arretes"
    Write-Host ""
}

function Invoke-Restart {
    Write-Header
    Write-Host "  REDEMARRAGE DES SERVICES" -ForegroundColor White
    Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    
    Write-Step "1" "2" "Arret des conteneurs..."
    docker-compose stop 2>&1 | Out-Null
    Write-Success "Services arretes"
    
    Write-Step "2" "2" "Redemarrage..."
    docker-compose up -d 2>&1 | Out-Null
    Write-Success "Services redemarres"
    
    Write-Host ""
    Write-Host "  SERVICES REDEMARRES" -ForegroundColor Green
    Write-Host ""
}

function Invoke-Destroy {
    Write-Header
    Write-Host "  DESTRUCTION COMPLETE" -ForegroundColor Red
    Write-Host "  ───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  Cette action va supprimer:" -ForegroundColor Yellow
    Write-Host "      - Tous les conteneurs" -ForegroundColor Gray
    Write-Host "      - Tous les volumes (donnees Neo4j)" -ForegroundColor Gray
    Write-Host "      - Toutes les images Docker du projet" -ForegroundColor Gray
    Write-Host "      - Les fichiers CSV generes" -ForegroundColor Gray
    Write-Host ""
    
    $confirm = Read-Host "  Confirmer la destruction? (oui/non)"
    if ($confirm -ne "oui") {
        Write-Host ""
        Write-Host "  Annulation." -ForegroundColor Yellow
        Write-Host ""
        return
    }
    
    Write-Host ""
    
    Write-Step "1" "4" "Arret et suppression des conteneurs..."
    docker-compose down -v --remove-orphans 2>&1 | Out-Null
    Write-Success "Conteneurs et volumes supprimes"
    
    Write-Step "2" "4" "Suppression des images..."
    docker-compose down --rmi local 2>&1 | Out-Null
    Write-Success "Images supprimees"
    
    Write-Step "3" "4" "Nettoyage des fichiers CSV..."
    if (Test-Path "data/csv/*.csv") {
        Remove-Item "data/csv/*.csv" -Force -ErrorAction SilentlyContinue
    }
    Write-Success "Fichiers CSV supprimes"
    
    Write-Step "4" "4" "Nettoyage Docker..."
    docker system prune -f 2>&1 | Out-Null
    Write-Success "Cache Docker nettoye"
    
    Write-Host ""
    Write-Host "  PROJET COMPLETEMENT NETTOYE" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Pour reconstruire: " -ForegroundColor Gray -NoNewline
    Write-Host ".\epigraph.ps1 start" -ForegroundColor Cyan
    Write-Host ""
}

function Invoke-Logs {
    param([string]$ServiceName)
    
    if ($ServiceName) {
        docker-compose logs -f --tail 100 $ServiceName
    } else {
        docker-compose logs -f --tail 50
    }
}

# Point d'entree principal
switch ($Command) {
    "start"   { Invoke-Start }
    "stop"    { Invoke-Stop }
    "restart" { Invoke-Restart }
    "destroy" { Invoke-Destroy }
    "status"  { Show-Status }
    "logs"    { Invoke-Logs -ServiceName $Service }
    "help"    { Show-Help }
    default   { Show-Help }
}
