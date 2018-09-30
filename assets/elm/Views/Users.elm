module Views.Users exposing (view)

import Views.Header as Header
import Views.NotFound as NotFound
import Html exposing (..)
import Html.Attributes exposing (..)
import Messages exposing (..)
import Model exposing (..)


view : Model -> String -> Html Msg
view model userId =
    case model.otherUser of
        Success user ->
            div [ class "users" ] [
                Header.view model,
                div [ class "user" ] [
                    info user
                ,   package model.listPackages
                ]
            ]
        Requesting ->
            div [ class "users" ] [
                Header.view model,
                div [ class "user" ] [
                    a [] [ text "Loading..." ]
                ]
            ]
        _ ->
            NotFound.view model

info : User -> Html Msg
info user =
    div [ class "info" ] [
        img [ class "avatar-top", alt user.id, src user.photo_url, width 200, height 200 ] [],
        h2 [ class "user-id" ] [ text user.id ],
        text user.name,
        hr [ class "divider" ] [],
        a [ class "link", href user.github_link ] [
            i [class "fab fa-github github"] [],
            text user.id
        ]
    ]


package : RemoteData String (List Package) -> Html Msg
package ownedPackages =
    case ownedPackages of
        Success listPackages ->
            div [ class "package" ] (h3 [ class "first-header" ] [ text "Owned packages" ]
                                    :: (List.map packageView listPackages))
        Requesting ->
            a [] [ text "Loading..." ]
        _ ->
            a [] [ text "Not found" ]

packageView : Package -> Html Msg
packageView package =
    div [ class "list-item" ] [
        a [ class "packname"
          , href ("/packages/" ++ package.name)
        ] [ text package.name ],
        span [ class "version" ] [ text package.version ],
        p [ class "description" ] [ text package.description ]
    ]
