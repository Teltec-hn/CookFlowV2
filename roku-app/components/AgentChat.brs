sub init()
    m.chatContainer = m.top.findNode("chatContainer")
    m.avatar = m.top.findNode("avatar")
    m.godHalo = m.top.findNode("godHalo")
    m.bubbleBg = m.top.findNode("bubbleBg")
    m.messageLabel = m.top.findNode("messageLabel")
    m.showAnim = m.top.findNode("showAnim")
    m.hideAnim = m.top.findNode("hideAnim")

    ' Ensure container starts hidden as defined in XML
    ' m.chatContainer.opacity is 0 by default in XML
end sub

sub onSendMessage()
    msg = m.top.sendMessage
    if msg <> ""
        ' Show typing state or immediate user feedback?
        ' For now, we assume this is triggered by user or system event
        ' We'll create a task to fetch response

        m.chatTask = CreateObject("roSGNode", "AgentChatTask")
        m.chatTask.message = msg
        ' m.chatTask.userId = m.global.currentUser.id ' TODO: User Auth Context
        m.chatTask.ObserveField("response", "onAgentResponse")
        m.chatTask.control = "RUN"

        ' Visual Feedback: "Thinking..."
        m.messageLabel.text = "FlowChef está cocinando una rima..."
        showAgent()
    end if
end sub

sub onAgentResponse()
    response = m.chatTask.response
    if response <> invalid
        reply = response.reply
        isGodMode = response.isGodMode

        if reply <> invalid
            m.messageLabel.text = reply
        end if

        if isGodMode = true
            enableGodModeVisuals()
        end if

        showAgent()
    end if
end sub

sub enableGodModeVisuals()
    m.godHalo.opacity = 1.0
    m.bubbleBg.color = "0xF1C40FEE" ' Gold background
    m.messageLabel.color = "0x000000FF" ' Black text
end sub

sub onGodModeChanged()
    if m.top.isGodMode
        enableGodModeVisuals()
    end if
end sub

sub onTextChanged()
    text = m.top.text
    print "[AgentChat] Text Changed: " + text
    if text <> ""
        m.messageLabel.text = text
        showAgent()
    end if
end sub

sub onSpeakingChanged()
    if m.top.isSpeaking
        showAgent()
    else
        hideAgent()
    end if
end sub

sub showAgent()
    if m.chatContainer.opacity < 1
        m.showAnim.control = "start"
    end if
end sub

sub hideAgent()
    if m.chatContainer.opacity > 0
        m.hideAnim.control = "start"
    end if
end sub
