sub init()
    m.rankPoster = m.top.findNode("rankPoster")
    m.awardsGroup = m.top.findNode("awardsGroup")
end sub

sub OnRankChanged()
    rank = m.top.rank
    ' Default to plomo
    uri = "pkg:/images/plomo_rank.png"

    if rank = "cobre"
        uri = "pkg:/images/cobre_rank.png"
    else if rank = "oro"
        uri = "pkg:/images/oro_rank.png"
    end if

    if m.rankPoster <> invalid
        m.rankPoster.uri = uri
    end if
end sub

sub OnAwardsChanged()
    ' For V1, just show a count or simple icons
    ' Clearing old children in SceneGraph is manual, so we'll just show the first 3 awards
    awards = m.top.awards
    if awards <> invalid and m.awardsGroup <> invalid
        for i = 0 to 2
            if i < m.awardsGroup.getChildCount()
                icon = m.awardsGroup.getChild(i)
                if icon <> invalid
                    if i < awards.count()
                        icon.visible = true
                        ' icon.uri = ... (For now using generic star)
                    else
                        icon.visible = false
                    end if
                end if
            end if
        end for
    end if
end sub
