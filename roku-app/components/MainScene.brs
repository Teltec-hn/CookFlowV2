sub init()
    m.theme = GetTheme()

    m.mainBackground = m.top.findNode("mainBackground")
    m.mainBackground.color = m.theme.colors.background

    m.mainUI = m.top.findNode("mainUI")
    m.recipeList = m.top.findNode("recipeList")
    m.agentChat = m.top.findNode("agentChat")

    ' Componente Detalle y Animaciones
    m.recipeDetail = m.top.findNode("recipeDetail")
    m.fadeDetailAnimIn = m.top.findNode("fadeDetailAnimIn")
    m.fadeDetailAnimOut = m.top.findNode("fadeDetailAnimOut")
    m.fadeOutMainUIAnim = m.top.findNode("fadeOutMainUIAnim")
    m.fadeInMainUIAnim = m.top.findNode("fadeInMainUIAnim")

    ' Observador Detalle Cerrar
    m.recipeDetail.ObserveField("closeEvent", "onRecipeDetailClose")
    m.fadeDetailAnimOut.ObserveField("state", "onFadeOutDetailStateChange")

    ' New Components
    m.calizGoal = m.top.findNode("calizGoal")
    m.gamificationBadges = m.top.findNode("gamificationBadges")

    ' 1. Configurar Intro y CountryTask
    m.introScene = m.top.findNode("introScene")
    m.countryTask = m.top.findNode("countryTask")

    ' Observadores
    m.introScene.ObserveField("state", "onIntroStateChange")
    m.countryTask.ObserveField("countryInfo", "onCountryInfoReady")
    ' Observador de Selección de Lista (RowList usa rowItemSelected usualmente, pero agregamos ambos por seguridad)
    m.recipeList.ObserveField("itemSelected", "onRecipeSelected")
    m.recipeList.ObserveField("rowItemSelected", "onRecipeSelected")

    ' Iniciar secuencia
    m.introScene.callFunc("Start")
    m.countryTask.control = "RUN"

    ' 2. Carga de datos (Recetas)
    m.loadTask = CreateObject("roSGNode", "RecipeTask")
    m.loadTask.apiUrl = "https://hcfhvgkucaimchfxbtub.supabase.co/functions/v1"
    m.loadTask.observeField("response", "onDataArrived")
    m.loadTask.control = "RUN"

    ' 3. Carga de datos (Perfil Chef / Cáliz)
    m.chefTask = CreateObject("roSGNode", "ChefProfileTask")
    m.chefTask.apiUrl = "https://hcfhvgkucaimchfxbtub.supabase.co/functions/v1"
    m.chefTask.supabaseKey = m.global.appConfig.supabase_key
    m.chefTask.chefId = "flowchef_rapper" ' Hardcoded for V1, dynamic later
    m.chefTask.observeField("response", "onChefDataArrived")
    m.chefTask.control = "RUN"

    ' 4. Real-time Subscription via Polling
    m.pollingTimer = m.top.findNode("pollingTimer")
    if m.pollingTimer <> invalid
        m.pollingTimer.observeField("fire", "onPollingTimerFire")
        m.pollingTimer.control = "start"
    end if
end sub

sub onPollingTimerFire()
    ' Re-run the task to fetch fresh values
    if m.chefTask <> invalid
        m.chefTask.control = "STOP" ' Forzamos detención
        m.chefTask.control = "RUN" ' Reiniciamos
    end if
end sub

sub onChefDataArrived()
    data = m.chefTask.response
    if data <> invalid
        ' 🔥 Imprimimos la verdad absoluta en el Telnet
        print "[MainScene] 🧬 ADN del Chef Recibido: " ; FormatJson(data)

        ' 1. Forzamos que el componente sea visible para pruebas
        if m.calizGoal <> invalid then m.calizGoal.visible = true

        ' 2. Actualizamos el Cáliz de forma segura
        if data.DoesExist("activeGoal") and data.activeGoal <> invalid and m.calizGoal <> invalid
            ' Extraemos valores con fallbacks por si el backend no los manda
            target = "0"
            current = "0"
            percent = 0.0

            if data.activeGoal.DoesExist("targetAmount")
                target = SafeToString(data.activeGoal.targetAmount)
            end if
            if data.activeGoal.DoesExist("currentAmount")
                current = SafeToString(data.activeGoal.currentAmount)
            end if
            if data.activeGoal.DoesExist("percentage")
                percent = SafeToFloat(data.activeGoal.percentage) / 100.0
            end if

            m.calizGoal.targetText = "$" + target
            m.calizGoal.currentText = "$" + current
            m.calizGoal.progress = percent
        else
            print "[MainScene] ⚠️ El backend no envió 'activeGoal'."
        end if

        ' 3. Update Gamification
        if m.gamificationBadges <> invalid
            if data.DoesExist("profile") and data.profile <> invalid
                if data.profile.DoesExist("rank") then m.gamificationBadges.rank = data.profile.rank
            end if
            if data.DoesExist("awards") and data.awards <> invalid
                m.gamificationBadges.awards = data.awards
            end if
        end if
    end if
end sub

sub onCountryInfoReady()
    info = m.countryTask.countryInfo
    if info <> invalid and m.introScene <> invalid
        m.introScene.countryInfo = info
    end if
end sub

sub onIntroStateChange()
    if m.introScene <> invalid and m.introScene.state = "finished"
        if m.mainUI <> invalid then m.mainUI.visible = true
        if m.calizGoal <> invalid then m.calizGoal.visible = true ' Mostramos el Cáliz al terminar la intro

        ' IMPORTANTE: Esperar un frame para asegurar visibilidad antes del foco
        if m.recipeList <> invalid then m.recipeList.setFocus(true)

        if m.agentChat <> invalid
            chatText = "¡Hey! ¿Qué cocinamos hoy?"
            if m.calizGoal <> invalid and m.calizGoal.currentText <> ""
                chatText = chatText + " El Cáliz está al " + m.calizGoal.currentText
            end if
            m.agentChat.text = chatText
            m.agentChat.isSpeaking = true
        end if
    end if
end sub

sub onDataArrived()
    jsonString = m.loadTask.response
    if jsonString <> "" and jsonString <> invalid
        data = ParseJson(jsonString)
        if data <> invalid then renderRecipes(data)
    end if
end sub

sub renderRecipes(data as object)
    if m.recipeList <> invalid
        root = CreateObject("roSGNode", "ContentNode")
        row = root.CreateChild("ContentNode")
        for each item in data
            node = row.CreateChild("ContentNode")
            node.title = item.title
            node.hdPosterUrl = item.image

            ' 🔥 Inyectamos los metadatos aquí (puedes ajustarlo según tu JSON de FastAPI)
            node.description = "⏱️ 20 min • Nivel: Flow"
        end for
        m.recipeList.content = root
    end if
end sub

sub onRecipeSelected()
    ' Soporte para RowList (que usa rowItemSelected = [row, col]) y MarkupGrid (itemSelected = index)
    rowIdx = 0
    itemIdx = 0
    isValidSelection = false

    if m.recipeList.HasField("rowItemSelected") and type(m.recipeList.rowItemSelected) = "roArray"
        rowIdx = m.recipeList.rowItemSelected[0]
        itemIdx = m.recipeList.rowItemSelected[1]

        ' 2. Limpiar selección para evitar disparos dobles
        if rowIdx >= 0 and itemIdx >= 0
            isValidSelection = true
            m.recipeList.rowItemSelected = [-1, -1]
        end if
    else if m.recipeList.HasField("itemSelected")
        itemIdx = m.recipeList.itemSelected

        ' 2. Limpiar selección para evitar disparos dobles
        if itemIdx >= 0
            isValidSelection = true
            m.recipeList.itemSelected = -1
        end if
    end if

    if not isValidSelection then return

    ' Obtenemos los datos del nodo seleccionado
    rowNode = m.recipeList.content.getChild(rowIdx)
    if rowNode <> invalid
        selectedData = rowNode.getChild(itemIdx)
        if selectedData <> invalid
            print "🚀 [SUCCESS] ¡Receta abierta desde el observador!: " ; selectedData.title

            ' 1. Configurar datos de RecipeDetailScene y hacer visible
            m.recipeDetail.content = selectedData
            m.recipeDetail.visible = true
            m.recipeDetail.setFocus(true)

            ' Transición Visual (Fade)
            m.fadeOutMainUIAnim.control = "start"
            m.fadeDetailAnimIn.control = "start"

            ' Feedback del FlowChef
            if m.agentChat <> invalid
                m.agentChat.text = "¡Buena elección! Con " + selectedData.title + " estamos más cerca de llenar el Cáliz."
                m.agentChat.isSpeaking = true
            end if
        end if
    end if
end sub

sub onRecipeDetailClose()
    if m.recipeDetail.closeEvent
        ' Reproducir animación de salida
        m.fadeDetailAnimOut.control = "start"
        m.fadeInMainUIAnim.control = "start"
        ' Limpiamos la bandera
        m.recipeDetail.closeEvent = false
    end if
end sub

sub onFadeOutDetailStateChange()
    ' Una vez que terminó de hacerse transparente la pantalla, le quitamos focus/visible
    if m.fadeDetailAnimOut.state = "stopped"
        m.recipeDetail.visible = false
        if m.recipeList <> invalid
            m.recipeList.setFocus(true)
        end if
    end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    handled = false
    if press
        print "--- Tecla presionada: " ; key

        ' 1. Normalizamos la tecla de selección
        if (key = "OK" or key = "select")
            if m.recipeList <> invalid and m.recipeList.hasFocus()
                itemSelected = m.recipeList.itemSelected
                print "🚀 [EXEC] Seleccionada receta índice: " ; itemSelected
                ' Aquí disparamos la acción
                handled = true
            else
                ' ESTO ES CLAVE: Nos dirá quién tiene el foco si no es la lista
                focusedNode = m.top.focusedChild
                if focusedNode <> invalid
                    print "⚠️ [FOCUS_ERROR] El foco lo tiene: " ; focusedNode.id
                end if
            end if
        end if

        ' 2. Soporte para el Toggle del Chat (Botón Asterisco/Options)
        if key = "options"
            if m.agentChat <> invalid
                m.agentChat.isSpeaking = not m.agentChat.isSpeaking
            end if
            handled = true
        end if
    end if
    return handled
end function

' ----- Helper Functions para Evitar Crashes ------
function SafeToString(value as dynamic) as string
    if value = invalid return "0"
    valType = type(value)
    if valType = "roInt" or valType = "Integer" or valType = "roFloat" or valType = "Float" or valType = "roDouble" or valType = "Double" or valType = "roLongInteger"
        return value.ToStr()
    else if valType = "roString" or valType = "String"
        return value.Trim()
    end if
    return "0"
end function

function SafeToFloat(value as dynamic) as float
    if value = invalid return 0.0
    valType = type(value)
    if valType = "roInt" or valType = "Integer" or valType = "roFloat" or valType = "Float" or valType = "roDouble" or valType = "Double" or valType = "roLongInteger"
        return value
    else if valType = "roString" or valType = "String"
        return value.ToFloat()
    end if
    return 0.0
end function
