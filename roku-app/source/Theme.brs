' ********************************************************************
' ** Theme Constants
' ** Warm & Organic Palette
' ********************************************************************

Function GetTheme() as Object
    return {
        colors: {
            background: "#2A2522",   ' Deep Brown / Charcoal
            foreground: "#E0E0E0",   ' Soft White / Light Gray
            primary:    "#CC5500",   ' Burnt Orange
            secondary:  "#FFD700",   ' Mustard / Gold
            detail:     "#556B2F",   ' Olive Green
            error:      "#C0392B",   ' Red
            success:    "#27AE60"    ' Green
        },
        fonts: {
            title: "font:LargeBoldSystemFont",
            body:  "font:MediumSystemFont",
            small: "font:SmallSystemFont"
        },
        layout: {
            padding: 20,
            margin:  10
        },
        animation: {
            duration_short: 0.2,
            duration_medium: 0.5,
            duration_long: 1.0
        }
    }
End Function
