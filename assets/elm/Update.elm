module Update exposing (..)

import Commands exposing (..)
import Messages exposing (..)
import Model exposing (..)
import Navigation
import Routing exposing (Route(..), parse, toPath)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        UrlChange location ->
            let
                currentRoute =
                    parse location
            in
                urlUpdate { model | route = currentRoute }

        NavigateTo route ->
            model ! [ Navigation.newUrl <| toPath route ]

        AutoLogin ->
            model ! [ Navigation.load "/auth" ]

        HandleSearchInput value ->
            { model | search = value } ! []

        UserResult (Ok response) ->
            { model | userInfo = Success response } ! []
        UserResult (Err error) ->
            { model | userInfo = Failure (toString error) } ! []

        DeleteSession ->
            model ! [ logout model.csrfToken ]

        PostDeleted (Ok response) ->
            { model | userInfo = NotRequested } ! []
        PostDeleted (Err error) ->
            model ! [ Debug.crash (toString error) ]

        SelectMeta string ->
            { model | csrfToken = string } ! []

--        KeyDown 191 ->
--            model ! [ FocusOn ]

        _ ->
            model ! []

urlUpdate : Model -> ( Model, Cmd Msg )
urlUpdate model =
    case model.route of
        _ ->
            case model.userInfo of
                NotRequested ->
                    model ! [ getSession ]
                _ ->
                    model ! []
