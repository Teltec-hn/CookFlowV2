' ********************************************************************
' ** IntroScene Logic - FlowChef Rapper Intro
' ********************************************************************

sub Init()
    m.theme = GetTheme()

    ' Scene Nodes
    ' Scene Nodes
    m.background = m.top.findNode("background")
    m.background.color = m.theme.colors.background

    ' Removed contentGroup wrapper (Flattened)
    m.rapper = m.top.findNode("rapperCharacter")
    m.title = m.top.findNode("titleLabel")
    m.title.color = m.theme.colors.primary

    m.flagGroup = m.top.findNode("flagGroup")
    m.flagPoster = m.top.findNode("flagPoster")
    m.countryLabel = m.top.findNode("countryLabel")
    m.countryLabel.color = m.theme.colors.secondary

    ' Animations (Loaded from XML - Clean & Safe)
    m.rapperAnim = m.top.findNode("rapperAnim")
    m.titleAnim = m.top.findNode("titleAnim")
    m.infoAnim = m.top.findNode("infoAnim")

    ' Logic
    m.timer = m.top.findNode("sequenceTimer")
    m.step = 0
    m.timer.ObserveField("fire", "OnTimerFire")

    ' Data Observer
    m.top.ObserveField("countryInfo", "OnCountryInfoChanged")
end sub

sub Start()
    m.state = "playing"
    m.top.state = "playing"
    m.timer.control = "start"

    ' TODO: Play Audio here (Kitchen Beat)
end sub

sub OnCountryInfoChanged()
    info = m.top.countryInfo
    if info <> invalid
        m.countryLabel.text = "Bienvenido, " + info.name

        ' Set flag image if available
        flagUrl = GetFlagUrl(info.code)
        if flagUrl <> ""
            m.flagPoster.uri = flagUrl
        end if
    end if
end sub

sub OnTimerFire()
    m.step = m.step + 1

    if m.step = 1
        ' 0.5s: Rapper Bounce In
        m.rapperAnim.control = "start"
    else if m.step = 4
        ' 2.0s: Title Reveal
        m.titleAnim.control = "start"
    else if m.step = 6
        ' 3.0s: Country/Flag Reveal
        m.infoAnim.control = "start"
    else if m.step = 10
        ' 5.0s: End Sequence
        m.timer.control = "stop"
        m.top.state = "finished"
        m.top.visible = false
    end if
end sub
