#!/bin/bash

# Script para forzar renombrado de carpetas en Git (Case Sensitivity Fix)
# Ejecutar en /Users/dmarambio/cartas

# Lista de carpetas que sabemos que cambiaron de nombre
folders=(
    "Helenica:helenica"
    "Daana:daana"
    "ESPADA SAGRADA:espada_sagrada"
    "Hijos De Daana:hijos_de_daana"
    "nuevasCartas:nuevascartas"
    "Primera Era:primera_era"
    "Goticos:goticos" 
    # Añade más si ves otras en el ls anterior que no coincidan
)

for pair in "${folders[@]}"; do
    old="${pair%%:*}"
    new="${pair##*:}"
    
    # Solo si existe la carpeta 'new' (que ya renombraste localmente)
    if [ -d "img/$new" ]; then
        # Git piensa que se llama 'old' (probablemente).
        # Truco: Mover el contenido a un temporal, git rm old, git add new
        
        # Como ya renombraste localmente con 'mv', git está confundido.
        # Vamos a usar 'git mv' forzado pero como ya se llaman 'new' en disco...
        
        # Estrategia: 
        # 1. Renombrar local 'new' -> 'temp'
        mv "img/$new" "img/${new}_temp"
        
        # 2. Decirle a git que mueva 'old' -> 'temp'
        git mv "img/$old" "img/${new}_temp" 2>/dev/null
        
        # 3. Y ahora de 'temp' -> 'new'
        git mv "img/${new}_temp" "img/$new"
        
        echo "Renombrado git: $old -> $new"
    fi
done
