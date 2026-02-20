sub init()
    m.theme = GetTheme()

    m.mainBackground = m.top.findNode("mainBackground")
    m.mainBackground.color = m.theme.colors.background

    m.mainUI = m.top.findNode("mainUI")
    m.recipeList = m.top.findNode("recipeList")
    m.agentChat = m.top.findNode("agentChat")

    ' New Components
    m.calizGoal = m.top.findNode("calizGoal")
    m.gamificationBadges = m.top.findNode("gamificationBadges")

    ' 1. Configurar Intro y CountryTask
    m.introScene = m.top.findNode("introScene")
    m.countryTask = m.top.findNode("countryTask")

    ' Observadores
    m.introScene.ObserveField("state", "onIntroStateChange")
    m.countryTask.ObserveField("countryInfo", "onCountryInfoReady")

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
end sub

sub onChefDataArrived()
    data = m.chefTask.response
    if data <> invalid
        ' Update Caliz
        if data.activeGoal <> invalid
            m.calizGoal.targetText = "$" + Str(data.activeGoal.targetAmount)
            m.calizGoal.currentText = "$" + Str(data.activeGoal.currentAmount)
            m.calizGoal.progress = data.activeGoal.percentage / 100.0
        else
            m.calizGoal.visible = false
        end if

        ' Update Gamification
        if data.profile <> invalid
            m.gamificationBadges.rank = data.profile.rank
        end if
        if data.awards <> invalid
            m.gamificationBadges.awards = data.awards
        end if
    end if
end sub

sub onCountryInfoReady()
    info = m.countryTask.countryInfo
    if info <> invalid
        m.introScene.countryInfo = info
    end if
end sub

sub onIntroStateChange()
    state = m.introScene.state
    if state = "finished"
        m.mainUI.visible = true
        m.recipeList.setFocus(true)

        ' Trigger FlowChef Master Greeting
        if m.agentChat <> invalid
            m.agentChat.text = "¡Hey! ¿Qué cocinamos hoy? Tu cocina, a tu ritmo."
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
    root = CreateObject("roSGNode", "ContentNode")
    row = root.CreateChild("ContentNode")
    for each item in data
        node = row.CreateChild("ContentNode")
        node.title = item.title
        node.hdPosterUrl = item.image
    end for
    m.recipeList.content = root
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    if press
        if key = "options"
            if m.agentChat.opacity > 0
                m.agentChat.isSpeaking = false
            else if m.agentChat <> invalid
                m.agentChat.text = "¡Aquí estoy! ¿Necesitas ayuda con alguna receta?"
                m.agentChat.isSpeaking = true
            end if
            return true
        end if
    end if
    return false
end function