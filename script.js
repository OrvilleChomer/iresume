
/*********************************************************************************
 *  file:  script.js
 * 
 *  INDEX OF FUNCTIONS (in alphabetical order)
 * 
 * TAG                            FUNCTION NAME                   DESCRIPTION                          EVENT HANDLER           SPECIAL CATEGORY
 * =========                      ===================             ======================               ===============         ================
 * #add_nav_spot                  addNavSpot()
 * #add_timeline_obj              addTimelineObj()
 * #art_board_constants           n/a                             Artboard constant declarations
 * #build_nav_spot_styles         buildNavSpotStyles()            Gen navspot CSS and add to 
 *                                                                style tag
 * 
 * #current_svg_values
 * #draw_box                      drawBox()                       'draw' SVG box
 * #draw_label                    drawLabel()                     'draw' SVG text label
 * #draw_line                     drawLine()                      'draw' SVG line
 * #draw_timeline                 drawTimeline()
 * #edit_mode_event_handler_setup n/a                             Event handlers set up on EDIT 
 *                                                                mode only
 * 
 * #edit_mode_page_setup          n/a
 * #get_svg_transform_value       getSVGTransformValue()
 * #get_timespan                  getTimespan()
 * #get_value                     getValue()                      Get a parameter value                                         Utility
 * #globals                       n/a                             Global Declarations
 * #handle_key_cmds               handleKeyCmds()
 * #handle_scroll_wheel           handleScrollWheel()                                                  'wheel' event 
 * #handle_textbox_change         handleTextboxChange()
 * #handle_transform_mode_change  handleTransformModeChange()
 * #hide_dialog                   hideDialog()                                                         click id:'tint'
 * #hide_movie_poster             hideMoviePoster()               For now, not really poster
 * #launch_video_player           launchVideoPlayer()
 * #load_youtube_client_api_code  loadYouTubeClientApiCode()
 * #nav_animation_finished        navigationAnimationFinished()
 * #nav_spots_added               n/a
 * #navigate_to_spot              navigateToSpot()
 * #page_setup__                  pageSetup()                     Runs on load event
 * #pan_art_board                 panArtBoard()
 * #reset_transform               resetTransform()
 * #rotate_art_board              rotateArtBoard()
 * #scale_art_board               scaleArtBoard()  
 * #special_video_cover_layers    n/a                             HTML for layers defined
 * #set_transform_origin          setTransformOrigin()            Based on mouse position
 * #setup_rotate_inputs           setupRotateInputs()
 * #setup_scale_inputs            setupScaleInputs()
 * #setup_translate_inputs        setupTranslateInputs()
 * #setup_youtube_player          setupYouTubePlayer()
 * #show_mouse_movement           showMouseMovement()             Display mouse coordinates
 * #show_movie_poster             showMoviePoster()
 * #stop_any_videos_playing       stopAnyVideosPlaying()
 * #toggle_full_view              toggleFullView()
 * #toggle_toolbar_collapse       toggleToolbarCollapse()
 * #transform_value               transformValue()                Gens string of value
 * 
 *********************************************************************************/


// #globals
const PAGE_MODE_VIEW = 0
const PAGE_MODE_EDIT = 1
const PAGE_MODE = PAGE_MODE_VIEW

let bdy, toc, viewPort, artBoard,mousePos, timelineDiagram
let tsOriginXHair,tint
let bChangingViaScroll = false
let bSettingUpInputs = false

// toolbar specific DOM variables:
let toolbar, tools, toggleFullViewBtn, transformMode, resetTransformBtn
let transformInput1, transformInput2, uom1, uom2
let collapseBtn

let navSpotsByIndex = []
let navSpotsById = []
let navSpotsByVideoPlayerId = []
let playInfoByIndex = []
let playerInfoByVideoPlayerId = []
let timelineByIndex = []

//   #art_board_constants
const ART_BOARD_WIDTH = 7200
const ART_BOARD_HEIGHT = 5400

const DEFAULT_SCALE = 1
const DEFAULT_ANGLE = 0
const DEFAULT_TRANSLATE_X = 0
const DEFAULT_TRANSLATE_Y = 0

const DEFAULT_VIDEO_WIDTH = 560
const VIDEO_ASPECT_RATIO = .562
const PLAY_STATE_PLAYING = 1

let nCurrentScale = DEFAULT_SCALE
let nCurrentAngle = DEFAULT_ANGLE
let nCurrentTranslateX = DEFAULT_TRANSLATE_X
let nCurrentTranslateY = DEFAULT_TRANSLATE_Y

let nCurrentTransformOriginX = 0
let nCurrentTransformOriginY = 0

let nCurrentX = -1
let nCurrentY = -1
let sLastNavId = ""
let sNextNavId = ""



/**
 * 
 * #add_nav_spot
 */
function addNavSpot(params) {
  const navSpot = {}
  navSpot.x = getValue(params, "x", 0)
  navSpot.y = getValue(params, "y", 0)
  navSpot.scale = getValue(params, "scale", 1)
  navSpot.transformOriginX = getValue(params, "transformOriginX", 0)
  navSpot.transformOriginY = getValue(params, "transformOriginY", 0)
  navSpot.rotate = getValue(params, "rotate", 0)
  navSpot.timingFunction = getValue(params, "timingFunction", "ease")
  navSpot.delay = getValue(params, "delay", 0)
  navSpot.duration = getValue(params, "duration", 1.5)
  navSpot.id = getValue(params, "id", "?")
  navSpot.notation = getValue(params, "notation", "")  // mainly meta data to help designer
  navSpot.nextNavId = getValue(params, "nextNavId", "")
  navSpot.backgroundColor = getValue(params, "backgroundColor", "#f0f5f5")
  navSpot.videoCode = getValue(params, "videoCode", "")
  navSpot.videoTitle = getValue(params, "videoTitle", "")
  navSpot.videoWidth = getValue(params, "videoWidth", DEFAULT_VIDEO_WIDTH)
  
  if (navSpot.videoCode !== "" && navSpot.videoTitle === "") {
    navSpot.videoTitle = "Needs a Title!"
  } // end if

  if (navSpot.id === "?") throw("addNavSpot():  The 'id' parameter is a Required string value")
  navSpotsByIndex.push(navSpot)
  navSpotsById[navSpot.id] = navSpot

} // end addNavSpot


/**
 * 
 * #build_nav_spot_styles
 * 
 * 
 */
function buildNavSpotStyles() {
    console.log("buildNavSpotStyles() called")
    let s = []
    const dynamicStyles = document.getElementById("dynamicStyles")
    const nMax = navSpotsByIndex.length

    for (let n=0; n < nMax; n++) {
        const navSpot = navSpotsByIndex[n]

        // For Panning Artboard:
        s.push("@keyframes "+navSpot.id+"_ani {")
        s.push("  to {")
        s.push("    transform-origin:"+navSpot.transformOriginX+"px "+navSpot.transformOriginY+"px;")
        let sTransform = transformValue(navSpot.scale, navSpot.rotate, navSpot.x, navSpot.y)
        s.push("    transform:"+sTransform+";")
        s.push("  }")
        s.push("}")
        s.push("")
        s.push(".navSpot_"+navSpot.id+"{")
        s.push("  animation-name:"+navSpot.id+"_ani;")
        s.push("  animation-duration:"+navSpot.duration+"s;")

        if (navSpot.delay > 0) {
            s.push("  animation-delay:"+navSpot.delay+"s;")
        } // end if

        s.push("  animation-fill-mode:both;")

        s.push("}")

        s.push("")
    } // next n

    dynamicStyles.innerHTML = s.join("\n")

    // at this point these dynamically generated style selectors should be usable!

} // end of buildNavSpotStyles()




/**
 * 
 * #navigate_to_spot
 * 
 */
function navigateToSpot(sNavSpotId, el) {
    console.log("navigateToSpot called for id: '"+sNavSpotId+"'")
    const navSpot = navSpotsById[sNavSpotId]

    viewPort.style.backgroundColor = navSpot.backgroundColor;

    sLastNavId = navSpot.id
    let sNavCssClassName = "navSpot_"+navSpot.id
    artBoard.classList.add(sNavCssClassName)
    console.log("a class name of: '"+sNavCssClassName+"' was added to artBoard classList")
    console.log("navSpot.videoCode='"+navSpot.videoCode+"'")
    if (navSpot.videoCode !== "") {
        
        launchVideoPlayer(navSpot, el)
    } // end if

    if (navSpot.nextNavId !== "") {
        sNextNavId = navSpot.nextNavId
    } // end if

   
    // let sTransform = transformValue(nCurrentScale, nCurrentAngle, nCurrentTranslateX, nCurrentTranslateY)
    // artBoard.style.transform = sTransform

} // end of navigateToSpot


/**
 * 
 * #nav_animation_finished
 */
function navigationAnimationFinished(evt) {
    console.log("navigationAnimationFinished() called")

    if (sLastNavId !== "") {
        const navSpot = navSpotsById[sLastNavId]
        let sNavCssClassName = "navSpot_"+navSpot.id
        artBoard.style.transformOrigin = navSpot.transformOriginX+"px "+navSpot.transformOriginY+"px"
        let sTransform = transformValue(navSpot.scale, navSpot.rotate, navSpot.x, navSpot.y)
        artBoard.style.transform = sTransform

        artBoard.classList.remove(sNavCssClassName)
        console.log("a class name of: '"+sNavCssClassName+"' was removed to artBoard classList")
        sLastNavId = ""
    } // end if

    // sNextNavId is a global variable that is set in the navigateToSpot() function!
    // it is used for a multi-position animation!
    if (sNextNavId === "") return   // if this happens, there is no mult-position animation.

    let sNewNavId = sNextNavId
    sNextNavId = ""
    navigateToSpot(sNewNavId)
} // end of navigationAnimationFinished



/**
 * 
 * #load_youtube_client_api_code
 * 
 *   See:  https://developers.google.com/youtube/iframe_api_reference
 * 
 *   Injects YouTube API Script file load to be the first JavaScript on
 *   the page.
 * 
 *   Only called once to support all the YouTube videos that are 
 *   displayed on this page!
 * 
 *   Called near the end part of pageSetup()
 */
function loadYouTubeClientApiCode() {
    const tag = document.createElement('script')
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

} // end of loadYouTubeClientApiCode



/**
 * 
 * #launch_video_player
 * 
 *    places embedded YouTube video in the right place and starts playing it!
 * 
 *    It gets information from navSpot object about the video and how to play it
 *    and positions it in relation to the 'el' DOM object that is passed in as well.
 * 
 *    If video player popup for particular nav spot does not exists, it is created.
 *    Otherwise it will just make sure the existing video player for it visible
 * 
 * 
 *    It is called by:    navigateToSpot()
 * 
 */
function launchVideoPlayer(navSpot, el) {
    console.log("launchVideoPlayer() called")
    
    const sVidCntrId = navSpot.id+"_vid_popup"
    let vidPlayPopup = document.getElementById(sVidCntrId)

    if (typeof vidPlayPopup === "undefined" || vidPlayPopup=== null) {     
        const playerInfo = {}

        // a little circular referencing! ...
        playerInfo.navSpot = navSpot  
        navSpot.playerInfo = playerInfo

        vidPlayPopup = document.createElement("div")  
        vidPlayPopup.setAttribute("id", sVidCntrId)
        vidPlayPopup.classList.add("vidPlayerPopup")
        vidPlayPopup.classList.add("vidPlayerPopupStartPos")
        vidPlayPopup.classList.add("isDisplayDialog")
        let s = []
        const Q = '"'
        let nVideoWidth = navSpot.videoWidth
        let nVideoHeight = Math.floor(nVideoWidth * VIDEO_ASPECT_RATIO)
        playerInfo.videoCode = navSpot.videoCode   // Unique YouTube code that they gave to the video
        playerInfo.videoWidth = navSpot.videoWidth
        playerInfo.videoHeight = nVideoHeight
        playerInfo.videoTitle = navSpot.videoTitle

        // @@@@ opening vidPlayerCntr:
        s.push("<div class='vidPlayerCntr' style='width:"+nVideoWidth+"px; height:"+nVideoHeight+"px;'>")
        
        
        const sVidPlayerId = navSpot.id+"_player"
        const sVideoPlayerCoverId = sVidPlayerId+"_cover"
        const sVideoPlayerMoviePosterId = sVidPlayerId+"_poster"
        const sVideoPlayerMoviePosterTitleId = sVidPlayerId+"_poster_title"
        const sVideoPlayerMoviePosterPlayPauseId = sVidPlayerId+"_poster_play_pause"
        playerInfo.playerId = sVidPlayerId
        playerInfo.videoPlayerCoverId = sVideoPlayerCoverId
        playerInfo.videoPlayerMoviePosterId = sVideoPlayerMoviePosterId

        s.push("<div id='"+sVidPlayerId+"'></div>")

        // @@@@ closing vidPlayerCntr:
        s.push("</div>") // closing div for vidPlayerCntr

        let sCoverLayersTagInfo = " data-player-id='"+sVidPlayerId+"' "
        sCoverLayersTagInfo = sCoverLayersTagInfo + "style='width:"+nVideoWidth+"px; height:"+nVideoHeight+"px;"
     
        // #special_video_cover_layers
        s.push("<div id='"+sVideoPlayerCoverId+"' class='videoPlayerCover' "+sCoverLayersTagInfo+"></div>")                
        s.push("<div id='"+sVideoPlayerMoviePosterId+"' class='videoPlayerMoviePoster' "+sCoverLayersTagInfo+"'></div>")
        s.push("<div id='"+sVideoPlayerMoviePosterTitleId+"' class='videoPlayerVideoTitle' "+sCoverLayersTagInfo+"line-height:"+nVideoHeight+";'>Video: "+playerInfo.videoTitle+"</div>")   
        s.push("<div id='"+sVideoPlayerMoviePosterPlayPauseId+"' class='videoPlayerPlayPause' "+sCoverLayersTagInfo+"'></div>")      
               


        vidPlayPopup.innerHTML = s.join("")
        
        bdy.appendChild(vidPlayPopup)        

        const videoCover = document.getElementById(sVideoPlayerCoverId)
        videoCover.addEventListener("click", handleTogglePlay)

        setupYouTubePlayer(sVidPlayerId, playerInfo)
        
    } else {
        document.getElementById(navSpot.playerInfo.videoPlayerMoviePosterId).style.display = "block"
        const player = navSpot.playerInfo.player
        player.playVideo()
    } // end if
    
    tint.style.display = "block"

    const posInfo = el.getBoundingClientRect()
    let nLeft = Math.floor(posInfo.left - (posInfo.width / 2))
    let nTop = Math.floor(posInfo.top - (posInfo.height / 2))
    vidPlayPopup.style.left = (nLeft)+"px"
    vidPlayPopup.style.top = (nTop)+"px"
    vidPlayPopup.style.display = "block"
} // end of launchVideoPlayer


/**
 * 
 * #setup_youtube_player
 * 
 * Uses YouTube's client API for embedded iframes.
 * 
 * See:   https://developers.google.com/youtube/iframe_api_reference
 * 
 * Called from:    launchVideoPlayer()
 * 
 */
function setupYouTubePlayer(sVidPlayerId, playerInfo) {
    console.log("setupYouTubePlayer() called")
    const player = new YT.Player(sVidPlayerId, {
        height: playerInfo.videoHeight+"",
        width: playerInfo.videoWidth+"",
        videoId: playerInfo.videoCode,
        playerVars: {
          'playsinline': 1, 'controls': 0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });

    const playerIframe = player.getIframe()
    playerIframe.dataset.playerId = sVidPlayerId

    playerInfo.videoRevealed = false
    playerInfo.player = player
    navSpotsByVideoPlayerId[sVidPlayerId] = playerInfo.navSpot
    playInfoByIndex.push(playerInfo)
    playerInfoByVideoPlayerId[sVidPlayerId] = playerInfo

} // end of setupYouTubePlayer


/**
 * 
 * #on_player_ready
 * 
 */
function onPlayerReady(evt) {
    console.clear()
    evt.target.playVideo()
} // end of onPlayerReady


/**
 * 
 * #handle_toggle_play
 * 
 * eventListener for "click" event on videoCover
 * 
 */
function handleTogglePlay(evt) {
    console.log("handleTogglePlay() called")
    
    let sPlayerId
    let playerInfo
    let player
    let nCurrentPlayerState

    try {
        sPlayerId = evt.target.dataset.playerId
        playerInfo = playerInfoByVideoPlayerId[sPlayerId]
        player = playerInfo.player
        nCurrentPlayerState = player.getPlayerState()

        if (!playerInfo.videoRevealed) return

        if (nCurrentPlayerState===YT.PlayerState.PLAYING) {
            player.pauseVideo()
            showMoviePoster()
        } else {
            player.playVideo()
            hideMoviePoster()
        } // end if / else

    } catch(err) {
        console.log("Error in: handleTogglePlay()")
        console.log(err.message)
    } // end of try / catch block


} // end of handleTogglePlay




let latestPlayerInfo

/**
 * 
 * #on_player_state_change
 * 
 * event handler for video play
 */
function onPlayerStateChange(evt) {
    console.log("onPlayerStateChange() called")
    const player = evt.target
    const playerIframe = player.getIframe()
    const sPlayerId = playerIframe.dataset.playerId

    const nCurrentPlayerState = player.getPlayerState()
    console.log("nCurrentPlayerState="+nCurrentPlayerState)
    const playerInfo = playerInfoByVideoPlayerId[sPlayerId]
    latestPlayerInfo = playerInfo

    if (nCurrentPlayerState===PLAY_STATE_PLAYING) {
        setTimeout(hideMoviePoster, 4000)
    } // end if
} // end of onPlayerStateChange




/**
 * 
 * #hide_movie_poster
 * 
 */
function hideMoviePoster() {
    const playerInfo = latestPlayerInfo
    const moviePoster = document.getElementById(playerInfo.videoPlayerMoviePosterId)
    moviePoster.style.display = "none"
    playerInfo.videoRevealed = true
} // end of hideMoviePoster


/**
 * 
 * #show_movie_poster
 * 
 *  layer visually covers over video being played.... when it's been paused
 * 
 *  
 */
function showMoviePoster() {
    const playerInfo = latestPlayerInfo
    const moviePoster = document.getElementById(playerInfo.videoPlayerMoviePosterId)
    moviePoster.style.display = "block"
} // end of showMoviePoster

// ######################################################################################################
// ######################################################################################################

/**
 * 
 * #page_setup__
 * 
 */
function pageSetup() {
    console.clear()
    console.log("pageSetup called")
 
    // #nav_spots_added
    addNavSpot({x:-1000,y:-620,id:"start_waypoint1_about",notation:"add interest",
                rotate:80,duration:.75,nextNavId:"about"})
    addNavSpot({x:-1160,y:-440,id:"about",notation:"about this interactive resume"})
    addNavSpot({x:-800,y:40,id:"start_waypoint2_about",notation:"add interest",
                rotate:-60,duration:.75,nextNavId:"about",backgroundColor:"yellow"})
    addNavSpot({x:-1170,y:-430,id:"vid-about",notation:"video player about this interactive resume",
                videoCode:"gIWZvItsW2U",videoTitle:"About This Page"})
    addNavSpot({x:-678,y:-1804,id:"profile",notation:"profile text",backgroundColor:"#ffe6ff"})
    addNavSpot({x:-4700,y:-200,id:"skills",notation:"skills area - skills listed out",rotate:-3,backgroundColor:"#ffddcc"})
    addNavSpot({x:-2280,y:-3640,id:"work_experience",notation:"jobs at different companies listed out",backgroundColor:"#f9ffe6"})

    bdy = document.getElementsByTagName("BODY")[0]
    toc = document.getElementById("toc")
    viewPort = document.getElementById("viewPort")
    artBoard = document.getElementById("artBoard")

    timelineDiagram = document.getElementById("timelineDiagram")
    tint = document.getElementById("tint")

    toc.addEventListener("click", navClick)
    artBoard.addEventListener("animationend", navigationAnimationFinished)
    artBoard.addEventListener("click", navClick)

    tint.addEventListener("click", hideDialog)

    if (PAGE_MODE === PAGE_MODE_EDIT) {
        // #edit_mode_page_setup
        mousePos = document.getElementById("mousePos")    
        tsOriginXHair = document.getElementById("tsOriginXHair")
        tsOriginXHair.style.display = ""
    
        const sections = document.getElementsByTagName("SECTION")
        const nMax = sections.length

        for (let n=0; n < nMax; n++) {
            const section = sections[n]
            section.classList.add("npe")
        } // next n

        toolbar = document.getElementById("toolbar")
        toolbar.style.display = ""
        tools = document.getElementById("tools")
        collapseBtn = document.getElementById("collapseBtn")
        toggleFullViewBtn = document.getElementById("toggleFullViewBtn")
        transformMode = document.getElementById("transformMode")
        resetTransformBtn = document.getElementById("resetTransformBtn")
        transformInput1 = document.getElementById("transformInput1")
        transformInput2 = document.getElementById("transformInput2")
        uom1 = document.getElementById("uom1")
        uom2 = document.getElementById("uom2")
    
        // #edit_mode_event_handler_setup
        artBoard.addEventListener("mousemove", showMouseMovement)
        artBoard.addEventListener("mouseout", showMouseMovement)
        artBoard.addEventListener("wheel", handleScrollWheel, { passive: false, deltaMode: WheelEvent.DOM_DELTA_LINE })
        
    
        bdy.addEventListener("keydown", handleKeyCmds)
        
    
        collapseBtn.addEventListener("click", toggleToolbarCollapse)
        toggleFullViewBtn.addEventListener("click", toggleFullView)
        resetTransformBtn.addEventListener("click", resetTransform)
    
        transformInput1.addEventListener("input", handleTextboxChange)
        transformInput2.addEventListener("input", handleTextboxChange)
    
        transformMode.addEventListener("change", handleTransformModeChange)
        
        setupTranslateInputs()
    } else {
        artBoard.classList.remove("crosshair")
    } // end if  (PAGE_MODE === PAGE_MODE_EDIT) / else

    loadYouTubeClientApiCode()

    buildNavSpotStyles()

    drawTimeline()

    navigateToSpot("start_waypoint1_about")

} // end of pageSetup


/**
 * 
 * #nav_click
 * 
 * handle user clicking navigation link / list item / button
 * 
 * event handler is on 'toc' element
 */
function navClick(evt) {
    console.log("navClick called")
    const el = evt.target

    if (!el.classList.contains("navClick")) return

    const sNavId = el.dataset.navId
    console.log("sNavId="+sNavId)
    if (typeof sNavId === "string") {
        if (sNavId !== "") {
            navigateToSpot(sNavId, evt.target)
        } // end if
    } // end if
} // end of navClick


/**
 * 
 * #toggle_toolbar_collapse
 * 
 */
function toggleToolbarCollapse() {
    if (toolbar.classList.contains("collapsed")) {
        toolbar.classList.remove("collapsed")
        tools.classList.remove("collapsed")
        collapseBtn.innerText = ">>"
    } else {
        toolbar.classList.add("collapsed")
        tools.classList.add("collapsed")
        collapseBtn.innerText = "<<"
    } // end if / else

} // end of toggleToolbarCollapse()




/**
 * 
 * #add_timeline_obj
 * 
 * called from: pageSetup()
 * 
 */
function addTimelineObj(params) {
    const timelineObj = {}

    timelineObj.startYear = getValue(params,"startYear",1963)
    timelineObj.endYear = getValue(params,"endYear",timelineObj.startYear)
    timelineObj.startMonth = getValue(params,"startMonth",1)
    timelineObj.endMonth = getValue(params,"endMonth",12)
    timelineObj.navToKey = getValue(params,"navToKey","")
    timelineObj.title = getValue(params,"title","missing title!")
    timelineObj.subTitle = getValue(params,"subTitle","")
    timelineObj.spanBackgroundColor = getValue(params,"spanBackgroundColor","lightblue")
    let sTimespanCaption = ""
    let sPlural = ""
    getTimespan(timelineObj)

    if (timelineObj.totalYears>0) {
        if (timelineObj.totalYears>1) {
            sPlural = "s"
        } // end if

        sTimespanCaption = sTimespanCaption + (timelineObj.totalYears)+" year"+sPlural+" "
        if (timelineObj.totalMonths > 0) {
            sTimespanCaption = sTimespanCaption + "and "
        } // end if
    } // end if

    sPlural = ""
    if (timelineObj.totalMonths > 0) {
        if (timelineObj.totalMonths > 1) {
            sPlural = "s"
        } // end if

        sTimespanCaption = sTimespanCaption + (timelineObj.totalMonths)+" month"+sPlural+" "
    } // end if

    timelineObj.timespanCaption = sTimespanCaption

    timelineObj.spanWidth = timelineObj.totalInMonths * 8

    timelineByIndex.push(timelineObj)

} // end of addTimelineObj


/**
 * 
 * #get_timespan
 * 
 * called from: addTimelineObj()
 * 
 */
function getTimespan(timelineObj) {
    let sStartMonth = timelineObj.startMonth+""
    sStartMonth.padStart(2,'0')
    let sEndMonth = timelineObj.endMonth+""
    sEndMonth.padStart(2,'0')
    let sStartLastDay = "31"
    let sEndLastDay = "31"

    if (timelineObj.startMonth===2) sStartLastDay = "28"
    if (timelineObj.endMonth===2) sEndLastDay = "28"

    const sFormattedStartDate = sStartMonth+"/"+sStartLastDay+"/"+timelineObj.startYear
    const sFormattedEndDate = sEndMonth+"/"+sEndLastDay+"/"+timelineObj.endYear
    const date1 = new Date(sFormattedStartDate)
    const date2 = new Date(sFormattedEndDate)
    timelineObj.totalYears = date2.getFullYear() - date1.getFullYear()
    timelineObj.totalMonths = (date2.getMonth() - date1.getMonth()) // exclude months in full years
    timelineObj.totalInMonths = (years * 12) +(date2.getMonth() - date1.getMonth()) // count months in full years

    
} // end of getTimespan



/**
 * 
 * #draw_timeline
 * 
 * called from: pageSetup()
 * 
 */
function drawTimeline() {
    let s = []
    s.push(drawLine({x1:30,y1:140,x2:3990,color:"red",width:2}))
    s.push(drawLabel({x:-50,y:105,caption:"Collaberra",angle:-45,angleXPos:0,angleYPos:0}))
    
    s.push(drawLabel({x:30,y:105,caption:"IBM",angle:-45,angleXPos:0,angleYPos:0}))
    //alert(s.join("\n"))
    timelineDiagram.innerHTML = s.join("")
} // end of drawTimeline


/**
 * #current_svg_values
 */
let sCurrentSvgFillColor = "lightblue"
let sCurrentSvgStrokeColor = "black"
let sCurrentSvgFontFamily = "tahoma"
let sCurrentSvgFontSize = "12pt"
let sCurrentSvgTextFillColor = "black"
let sCurrentSvgTextStrokeColor = "none"

/**
 * 
 * #draw_line
 * 
 */
function drawLine(params) {
    const Q = '"'
    let x1 = getValue(params,"x1",0)
    let y1 = getValue(params,"y1",50)

    let x2 = getValue(params,"x2",300)
    let y2 = getValue(params,"y2",y1)
    let sLineColor = getValue(params,"color","black")
    let nWidth = getValue(params,"width",1)
    let s = []

    s.push("<line x1="+Q+(x1)+Q+" y1="+Q+(y1)+Q+" x2="+Q+(x2)+Q)
    s.push(" y2="+Q+(y2)+Q+" ")
    s.push(getSVGTransformValue(params))
    s.push(" style="+Q)
    s.push("stroke:"+sLineColor+";stroke-width:"+(nWidth)+Q+" />")

    return s.join("")
} // end of drawLine()



/**
 * 
 * #draw_box
 * 
 */
function drawBox(params) {
    let s = []
    let x = getValue(params,"x",10)
    let y = getValue(params,"y",10)
    let nWidth = getValue(params,"width",300)
    let nHeight = getValue(params,"height",40)
    let sFill = getValue(params,"fill","lightblue")

    s.push(getSVGTransformValue(params))
} // end of drawBox



/**
 * 
 * #draw_label
 * 
 */
function drawLabel(params) {
    const Q = '"'
    let s = []
    let sCaption = getValue(params,"caption","missing caption!")
    let sFill = getValue(params,"color","")
    let sStroke = getValue(params,"stroke","")
    let sFontFamily = getValue(params,"fontFamily",sCurrentSvgFontFamily)
    let sFontSize = getValue(params,"fontSize",sCurrentSvgFontSize)

    if (sFill === "" && sStroke ==="") {
        sFill = "black"
    } // end if

    let x = getValue(params,"x",10)
    let y = getValue(params,"y",10)

    s.push("<text x="+Q+(x)+Q+" y="+Q+(y)+Q+" ")

    s.push("font-family="+Q+sFontFamily+Q+" ")
    s.push("font-size="+Q+sFontSize+Q+" ")
    s.push(getSVGTransformValue(params))

    if (sFill !== "") {
        s.push("fill="+Q+sFill+Q+" ")
    } // end if

    if (sStroke !== "" && sStroke !== sFill) {
        s.push("stroke="+Q+sStroke+Q+" ")
    } // end if

    s.push(" >"+sCaption+"</text>")

    return s.join("")
} // end of drawLabel()



/**
 * 
 * #get_svg_transform_value
 * 
 * just basically making features I need for now... nothing more
 * 
 */
function getSVGTransformValue(params) {
    let s=[]
    const Q = '"'

    let vAngle = getValue(params,"angle","none")
    if (!isNaN(vAngle)) {
        s.push("rotate("+(vAngle))
        let vX = getValue(params,"angleXPos","none")
        let vY = getValue(params,"angleYPos","none")

        if (!isNaN(vX) && !isNaN(vY)) {
            s.push(","+(vX)+","+(vY))
        } // end if

        s.push(") ")
    } // end if (!isNaN(vAngle))

    let vScale = getValue(params,"scale","none")
    if (!isNaN(vScale)) {
        s.push("scale("+(vScale))
        s.push(") ")
    } // end if (!isNaN(vScale))


    let sTransform = s.join("")

    if (sTransform !== "") {
        sTransform = " transform="+Q+sTransform+Q+" "
    } // end if

    return sTransform
} // end of getSVGTransformValue



/**
 * 
 * #show_mouse_movement
 * 
 * added to event listeners in pageSetup() for 'mousemove' and 'mouseout' events
 */
function showMouseMovement(evt) {
    let s = evt.offsetX+", "+evt.offsetY
    nCurrentX = evt.offsetX
    nCurrentY = evt.offsetY
    mousePos.innerText = s
} // end of showMouseMovement


/**
 * 
 * #hide_dialog
 * 
 */
function hideDialog() {
    tint.style.display = "none"
    const els = document.getElementsByClassName("isDisplayDialog")
    const nMax = els.length
    for (let n=0; n< nMax; n++) {
        const el = els[n]
        el.style.display = "none"
    } // next n

    stopAnyVideosPlaying()
} // end of hideDialog



/**
 * 
 * #stop_any_videos_playing
 * 
 */
function stopAnyVideosPlaying() {
    const nMax = playInfoByIndex.length    
    for (let n=0; n < nMax;n++) {
        const playerInfo = playInfoByIndex[n]
        playerInfo.videoRevealed = false   // reset
        const player = playerInfo.player

        if (player.getPlayerState()===PLAY_STATE_PLAYING) {
            player.stopVideo()
        } // end if
    } // next x

} // end of stopAnyVideosPlaying


/**
 * 
 * #set_transform_origin
 * 
 * Sets transform origin on the artBoard, and position of
 * the transform origin SVG crosshair image.
 * 
 * It is used in EDIT mode.
 * 
 * It is called from:  handleKeyCmds() when the user taps the 'z' key
 * 
 */
function setTransformOrigin(x, y) {
    console.log("setTransformOrigin called")
    artBoard.style.transformOrigin = x+"px "+y+"px"
    tsOriginXHair.style.left = (x)+"px"
    tsOriginXHair.style.top = (y)+"px"
} // end setTransformOrigin




/**
 * 
 * #transform_value
 * 
 * Builds a string value for the CSS transform value including:
 *    scale, angle (in degrees), and translateX, and translateY
 *    and returns that value to be used for whatever.
 * 
 *   Called by:   handleScrollWheel()
 * 
 */
function transformValue(nScale, nAngle, nTranslateX, nTranslateY) {
    let s = []
    s.push("scale("+nScale+") rotate("+nAngle+"deg) ")
    s.push("translate("+nTranslateX+"px,"+nTranslateY+"px)")

    return s.join("")
} // end of transformValue()





/**
 * #toggle_full_view
 * 
 * 
 */
function toggleFullView() {
    if (artBoard.classList.contains("zoomOut")) {
        artBoard.style.transform = transformValue(nCurrentScale, nCurrentAngle, nCurrentTranslateX, nCurrentTranslateY)
        artBoard.classList.remove("zoomOut")
        toggleFullViewBtn.innerText = "Toggle to Full View"
    } else {
        artBoard.style.transform = ""
        artBoard.classList.add("zoomOut")
        toggleFullViewBtn.innerText = "Toggle to Normal View"
    } // end if / else

} // toggleFullView





/**
 * #handle_key_cmds
 * 
 *  Keyboard "keydown" event handler on body DOM element.
 * 
 *  For now, mainly used in EDIT mode
 */
function handleKeyCmds(evt) {
    

    if (evt.key === "z") {
        nCurrentTransformOriginX = nCurrentX
        nCurrentTransformOriginY = nCurrentY
        setTransformOrigin(nCurrentTransformOriginX, nCurrentTransformOriginY)
        return
    } // end if


    // future ability to create and add a navPos object ??? ... in EDIT mode of course!
    // We will see !!!
    if (evt.key === " ") {
        let params = {}
        params.x = nCurrentX
        params.y = nCurrentY
    } // end if

} // end of handleKeyCmds




/**
 * 
 * #handle_scroll_wheel
 * 
 *   Event handler for 'wheel' event for mouse wheel on artBoard
 * 
 *   Used right now for EDIT mode on the artBoard to:
 *     - Pan
 *     - Scale
 *     - Rotate
 * 
 *  It prevents any regular functionality of the event from happening
 * 
 */
function handleScrollWheel(evt) {
    //console.log("handleScrollWheel called")
    evt.preventDefault()

    bChangingViaScroll = true
    
    let sMode = transformMode.value
    let nDeltaX = evt.deltaX * -1
    let nDeltaY = evt.deltaY * -1

    if (sMode==="translate") panArtBoard(nDeltaX, nDeltaY)
    if (sMode==="scale") scaleArtBoard(nDeltaY)
    if (sMode==="rotate") rotateArtBoard(nDeltaY)
    
    let sTransform = transformValue(nCurrentScale, nCurrentAngle, nCurrentTranslateX, nCurrentTranslateY)
    
    artBoard.style.transform = sTransform

    // for EDIT mode, set textboxes on Toolbar's with translate value
    // idea here is we can change these values by either hovering mouse over artboard and using mousewheel, or
    // edit values precisely in text boxes!
    transformInput1.value = nCurrentTranslateX
    transformInput2.value = nCurrentTranslateY
    //

    bChangingViaScroll = false

} // handleScrollWheel



/**
 * 
 * #pan_art_board
 * 
 * 
 * Called by handleScrollWheel() function
 * 
 * Change artBoard's translate position variables which will be used later
 * to set CSS transform property
 * 
 */
function panArtBoard(nDeltaX, nDeltaY) {
    const BASE_INCR = 40
    let nIncX = 0
    let nIncY = 0

    if (nDeltaX < 0) {
        nIncX = -BASE_INCR
    } else if (nDeltaX > 0) {
        nIncX = BASE_INCR
    } // end if / else

    if (nDeltaY < 0) {
        nIncY = -BASE_INCR
    } else if (nDeltaY > 0){
        nIncY = BASE_INCR
    } // end if / else

    //console.log("nIncX="+nIncX+"  nIncY="+nIncY)
    nCurrentTranslateX = nCurrentTranslateX + nIncX
    nCurrentTranslateY = nCurrentTranslateY + nIncY

    if (nCurrentTranslateX > 0) nCurrentTranslateX =0
    if (nCurrentTranslateY > 0) nCurrentTranslateY =0

    if (nCurrentTranslateX < -artBoard.clientWidth) nCurrentTranslateX = -artBoard.clientWidth
    if (nCurrentTranslateY < -artBoard.clientHeight) nCurrentTranslateY = -artBoard.clientHeight

} // end of panArtBoard()




/**
 * 
 * #scale_art_board
 * 
 * Called by handleScrollWheel() function
 * 
 * Change artBoard's scale variable which will be used later
 * to set CSS transform property
 */
function scaleArtBoard(nDeltaY) {
    const BASE_INCR = .1

    let nIncY = 0

    if (nDeltaY < 0) {
        nIncY = -BASE_INCR
    } else if (nDeltaY > 0){
        nIncY = BASE_INCR
    } // end if / else

    nCurrentScale = nCurrentScale + nIncY

    if (nCurrentScale < .2) nCurrentScale = .4
    if (nCurrentScale > 2.6) nCurrentScale = 4
    
} // end of scaleArtBoard




/**
 * 
 * #rotate_art_board
 * 
 * Called by handleScrollWheel() function
 * 
 * Change artBoard's angle variable which will be used later
 * to set CSS transform property 
 */
function rotateArtBoard(nDeltaY) {
    let nIncY = 0
    const BASE_INCR = 2

    if (nDeltaY < 0) {
        nIncY = -BASE_INCR
    } else if (nDeltaY > 0){
        nIncY = BASE_INCR
    } // end if / else

    nCurrentAngle = nCurrentAngle + nIncY

    if (nCurrentAngle < -360) nCurrentAngle = -360
    if (nCurrentAngle > 360) nCurrentAngle = 360

} // end of rotateArtBoard()





/**
 * 
 * #reset_transform
 * 
 */
function resetTransform() {
    if (bChangingViaScroll) return

    nCurrentTranslateX = 0
    nCurrentTranslateY = 0
    nCurrentScale = 1
    nCurrentAngle = 0
    let sTransform = transformValue(nCurrentScale, nCurrentAngle, nCurrentTranslateX, nCurrentTranslateY)
    
    artBoard.style.transform = sTransform
} // end of resetTransform





/**
 * 
 * #handle_textbox_change
 * 
 */
function handleTextboxChange(evt) {
    if (bChangingViaScroll || bSettingUpInputs) return

    //console.log("processing handleTextboxChange()")

    let bValueModified = false

    let sMode = transformMode.value

    if (sMode==="translate") {
        if (evt.target.id === "transformInput1" && evt.target.value !== "") {
            nCurrentTranslateX = evt.target.value - 0
            bValueModified = true
        } // end if

        if (evt.target.id === "transformInput2" && evt.target.value !== "") {
            nCurrentTranslateY = evt.target.value - 0
            bValueModified = true
        } // end if
        
    } // end if

    if (bValueModified) {
        let sTransform = transformValue(nCurrentScale, nCurrentAngle, nCurrentTranslateX, nCurrentTranslateY)
        artBoard.style.transform = sTransform
    } // end if    

} // end of handleTextboxChange




/**
 * 
 * #handle_transform_mode_change
 * 
 */
function handleTransformModeChange(evt) {
    console.log("handleTransformModeChange() called")
    let sMode = transformMode.value

    if (sMode==="translate") setupTranslateInputs() 
    if (sMode==="scale") setupScaleInputs() 
    if (sMode==="rotate") setupRotateInputs() 

} // end of handleTransformModeChange



/**
 * 
 * #setup_translate_inputs
 * 
 */
function setupTranslateInputs() {
    bSettingUpInputs = true
    transformInput2.style.display = "inline"
    transformInput1.min = ART_BOARD_WIDTH * -1
    transformInput2.min = ART_BOARD_HEIGHT * -1
    transformInput1.step = 1
    transformInput1.max = 0
    transformInput2.max = 0

    transformInput1.value = nCurrentTranslateX
    transformInput2.value = nCurrentTranslateY
    uom1.innerText = "px"
    uom2.style.display = "inline"
    bSettingUpInputs = false
} // end of setupTranslateInputs



/**
 * 
 * #setup_scale_inputs
 * 
 */
function setupScaleInputs() {
    bSettingUpInputs = true
    transformInput2.style.display = "none"
    transformInput1.min = .6
    transformInput1.max = 3
    transformInput1.step = .1
    transformInput1.value = nCurrentScale
    uom1.innerText = "scale pct"
    uom2.style.display = "none"
    bSettingUpInputs = false
} // end of setupScaleInputs



/**
 * 
 * #setup_rotate_inputs
 * 
 */
function setupRotateInputs() {
    bSettingUpInputs = true
    transformInput2.style.display = "none"

    transformInput1.min = -360
    transformInput1.max = 360
    transformInput1.step = 1

    transformInput1.value = nCurrentAngle
    uom1.innerText = "deg"
    uom2.style.display = "none"
    bSettingUpInputs = false
} // end of setupRotateInputs



/**
 * 
 * #get_value
 * 
 */
function getValue(params, sParamName, vDefValue) {
    let vValue = vDefValue

    let testValue = params[sParamName]

    if (typeof testValue !== "undefined") {
        vValue = testValue
    } // end if

    return vValue

} // end of getValue


window.addEventListener("load", pageSetup)
