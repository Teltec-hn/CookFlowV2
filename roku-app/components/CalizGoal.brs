sub init()
    m.fillTexture = m.top.findNode("fillTexture")
    ' Base position is [0, 150] (Empty, pushed down)
    ' Full position is [0, 0] (Full)
    m.maxOffset = 150
end sub

sub onProgressChanged()
    percent = m.top.progress
    if percent > 1.0 then percent = 1.0
    if percent < 0.0 then percent = 0.0
    
    ' Calculate new Y position
    ' 0% -> 150
    ' 100% -> 0
    newY = m.maxOffset * (1.0 - percent)
    
    ' Animate smooth transition? For V1 direct set
    m.fillTexture.translation = [0, newY]
end sub
